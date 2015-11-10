module.exports = function(db) {
  var router = require('express').Router()
  mongo = require('mongodb')
  var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
  var config = require('../config.js')

  router.get('', function(req,res){
    console.log(req.headers.authorization)
    tokenArray = ("authorization" in req.headers) ? req.headers.authorization.split(' ') : []
    token = (tokenArray.length == 2) ? tokenArray[1] : undefined
    console.log("Token: " + token)
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        //return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded; 
        console.log(decoded)   
        console.log('Success')//next();
        console.log(req.decoded.username)
        var cursor = db.collection('tasks').find({'user':req.decoded.username})
        cursor.toArray(function(err, docs) {
            res.send(docs)
        });
      }
    });

  });
  
  router.post('/create', function(req, res){
    console.log(req.headers.authorization)
    tokenArray = ("authorization" in req.headers) ? req.headers.authorization.split(' ') : []
    token = (tokenArray.length == 2) ? tokenArray[1] : undefined
    console.log("Token: " + token)
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        //return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded; 
        user = req.decoded.username
        name = req.body.name
        timeEstimate = parseInt(req.body.timeEstimate)
        json = {
          'user':req.decoded.username,
          'name':name,
          'timeEstimate':timeEstimate
        }
        db.collection('tasks').insert(json)
        
        //cursor.toArray(function(err, docs) {
            res.send('Inserted a document')
        //});
      }
    });  
  })
  
  router.get('/punch/:id', function(req, res){
    console.log(req.headers.authorization)
    var o_id = new mongo.ObjectID(req.params.id);
    var json = {}
    cursor = db.collection('tasks').find({'_id':o_id})
    cursor.toArray(function(err, docs) {
        json = docs[0]
      if ("punches" in json) {
        punches = json.punches
        if ("in" in punches[punches.length - 1]){ 

          if ("out" in punches[punches.length - 1]) { // Punch in
          //  punches = [{'in' : 'sometime'}]
          json.punches.push({'in' : new Date()})

        } else { //Punch out             
          // punches = [{'in' : sometime, 'out' : sometime}]      
          punches[punches.length - 1].out = new Date();
         }
        } else {
          
        }
      } else {
        // Punch in 
        json.punches = []
        json.punches.push({'in':new Date()})
      }
      db.collection('tasks').update({'_id':o_id}, json)
      cursor = db.collection('tasks').find({'_id':o_id})
      cursor.toArray(function(err, docs) {
          res.send(docs[0])
      });
      
    });
  });

  
  return router
  
}
  
