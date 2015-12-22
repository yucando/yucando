module.exports = function(mongoose) {
  
  var router = require('express').Router()
  mongo = require('mongodb')
  var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
  var config = require('../config.js');
  var crypto = require('crypto');
  var db = mongoose.connection;
  //var security = require('../js/security.js');

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
      jwt.verify(token, config.secret, {algorithms:["HS256"]}, function(err, decoded) {      
        if (err) {
          return res.json({ "error":"Invalid token", "token":token });    
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
                "error":'Authentication (token) failed'
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
  }    
  
  router.use(isAuthenticated)
  
  var messageSchema = mongoose.Schema({username : String, timestamp : Date, message: String})
  messageSchema.methods.display = function() {
    return this.username + ' ' + this.message + ' ' + this.timestamp
  }
  var Message = mongoose.model('Message', messageSchema)
  var Event = mongoose.model('Event', {message: String, timestamp: Date})
  
  router.get('', function(req, res){
    Message.find({}, function(err, messages) {
      res.send(messages)
    })
  })
  
  router.post('', function(req, res){
    message = new Message({ username : req.authenticatedUser.username, timestamp : Date(), message: req.body.message});
    message.save(function(err , message) {
      if (err) {
        res.send(err);
      } else {
        res.send('Success: ' + message.display());    
      }

    })
  })

  
  return router
  
}
  
