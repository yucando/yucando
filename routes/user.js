module.exports = function(db) {
  var bodyParser = require('body-parser')
  var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
  var config = require('../config.js')
  var router = require('express').Router()
  mongo = require('mongodb')

  router.get('', function(req,res){
    var cursor = db.collection('tasks').find({})
    cursor.toArray(function(err, docs) {
        res.send(docs)
    });
  });
  
  router.get('/jwt', function(req, res){
      user = {'name': 'Hello', 'pass':'World'}

      var token = jwt.sign(user, config.secret, {
          expiresInMinutes: 1440 // expires in 24 hours
      });
      res.send(token)
  });

  router.get('/validate/:token', function(req,res){
    var token = req.params.token || req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        console.log('Success')//next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
  })
  
  router.post('/login', function(req,res){
    var username, password
    if ('username' in req.body){
      username = req.body.username
    } else {
      res.send({'success' : 'false'})
    //  return ({'success' : 'false'})
    }
    
    if ('password' in req.body) {
      password = req.body.password
    } else {
      res.send({'success' : 'false'})
    //  return ({'success' : 'false'})
    }
    
    if (username && password) {
      user = {'username': username}

      var token = jwt.sign(user, config.secret, {
          expiresIn: 84600 // expires in 24 hours
      });
      console.log('issued token')
      res.send(token)
    }
  })
  
  return router
  
}
