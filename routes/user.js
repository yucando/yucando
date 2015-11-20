module.exports = function(db) {
  var bodyParser = require('body-parser')
  var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
  var config = require('../config.js')
  var router = require('express').Router()
  var crypto = require('crypto')
  mongo = require('mongodb')
  
  isAuthenticated = function(req, res, next){
    var authenticatedUser = false;
    // Authenticate
    var token = req.params.token || req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) {
      tokenArray = ("authorization" in req.headers) ? req.headers.authorization.split(' ') : []
      token = (tokenArray.length == 2) ? tokenArray[1] : undefined
    }
    var username = req.params.username || req.params.user || req.body.username || req.body.user || req.query.username || req.query.user;
    var password = req.params.password || req.params.pass || req.body.password || req.body.pass || req.query.password || req.query.pass;
    //Verify Token
    //Verify Username

    if (username && password) {
      // Try to authenticate against database
      cursor = db.collection('users').find({"username":username}).limit(1)
      cursor.next(function(err, cred){
        if(err) {console.log("Error!")}
        if(!cred) {res.status(403).send({"err":"Username or password incorrect"})}
        var preHash = cred.salt + password;
        var hash = crypto.createHash("sha512").update(preHash).digest("hex")
        if(hash != cred.hash) {
          res.status(403).send({"err":"Username or password incorrect"})
          return;
        }
        req.authenticatedUser = cred;
        return next(); // accessible later as req.user
      })
    }
    
    if ((!username || !password) && token) {
      // verifies secret and checks exp
      jwt.verify(token, config.secret, function(err, decoded) {      
        if (err) {
          return res.json({ success: false, message: 'Invalid token.' });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          username = decoded.username;
          cursor = db.collection('users').find({"username":username})  
          cursor.toArray(function(err, docs){
            if (docs[0]){
              req.authenticatedUser = docs[0];
              return next();
            } else {
              res.status(403).send({
                "success": false,
                "message": 'Authentication failed'
              })
            }
          }) 
        }
      });
    } 
    
    if (!token && !(username && password)){
      res.status(403).send({
        "error" : "No credentials supplied"
      })
      return;
    } 
    return;
  }  
  
  router.post('/register', function(req, res){
    // Check for complete registration data coming in
    username = req.body.username || req.params.username || req.query.username
    password = req.body.password || req.params.password || req.query.password
    email = req.body.email || req.params.email || req.query.email
    firstName = req.body.firstName || req.params.firstName || req.query.firstName
    lastName = req.body.lastName || req.params.lastName || req.query.lastName
    if (username && password && email && firstName && lastName) {
      cursor = db.collection('users').find({"username":username})
      cursor.toArray(function(err, docs){
        if (docs[0]){
          res.json({"error":"Username already exists"})
        } else {
          var salt = crypto.randomBytes(64).toString("hex");
          var preHash = salt + password;
          var hash = crypto.createHash("sha512").update(preHash).digest("hex")
          db.collection('users').insert({"username":username, "hash":hash, "salt" : salt, "email":email, "firstName":firstName, "lastName":lastName})       
          user = {'username': username}
          var token = jwt.sign(user, config.secret, {
              expiresIn: 84600 // expires in 24 hours
          });
          res.send(token)            
        }
      })

    } else {
      res.status(505).send("One of the fields is missing to register a user")
    }
  })  
  
  //router.use(isAuthenticated)
  
  router.post('/login', isAuthenticated, function(req,res){
      user = {'username': req.authenticatedUser.username}

      var token = jwt.sign(user, config.secret, {
          expiresIn: 84600 // expires in 24 hours
      });
      res.send(token)    
  })
  
  router.get('/jwt', isAuthenticated, function(req, res){
      user = {'username': req.authenticatedUser.username}
      var token = jwt.sign(user, config.secret, {
          expiresIn: 84600 // expires in 24 hours
      });
      res.send(token)
  });
  


  router.get('', isAuthenticated, function(req,res){
    if (req.authenticatedUser.admin) {
      var cursor = db.collection('users').find({})
      cursor.toArray(function(err, docs) {
          res.send(docs)
      });
    } else {
      res.json({"error" : "You must be admin to see all users"})
    }

  });
  
  return router
  
}
