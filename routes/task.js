module.exports = function(mongoose) {
  
  var db = mongoose.connection;
  var router = require('express').Router();
  var mongo = require('mongodb');
  var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
  var config = require('../config.js');
  var crypto = require('crypto');
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
  
  var punchSchema = new mongoose.Schema({ 
    in: {type: Date, default: null}, 
    out: {type: Date, default: null}
  })
  
  var taskSchema = mongoose.Schema({
    username : {
      type: String,
      validate: {
        validator: function(user) {
          // Validate that the user exists
          taskSchema.pre('save', function (next, req) {
            var Users = mongoose.model('users');
            Users.findOne({username:req.body.authenticatedUser}, function (err, found){
              if (found) return next();
              else return next(new Error({error: "user not found"}))
            })
          })
        },
        message : 'User does not exist.'
      }
    },
    taskname : {
      type: String,
      default: "Untitled",
      validate: {
        validator: function(v) {
          return (v != null)
        },
        message : 'Title of task cannot be null.'
      }
    },
    timeEstimate : {type : Number, default: null},
    points : {type : Number, default: null},
    tags : {type : Array, default: []},
    notes : {type : String, default : null},
    due : {type: Date, default: null},
    defer : {type: Date, default: null},
    timeCreated : {type: Date, default: Date.now},
    timeUpdated : {type: Date, default: Date.now},
    timeCompleted : {type: Date, default: null},
    repeat : {type: mongoose.Schema.Types.Mixed, default: false},
    project : {type: String, default: null},
    visibility : {
      type: String, 
      default: "private",
      validate: {
        validator: function(v) {
          return (v in ["private", "public", "follows", "project_members"]);
        }, 
        message : '{VALUE} is not a valid visibility setting.'
      }
    },
    onComplete : {type: mongoose.Schema.Types.Mixed, default: null},
    punches : {type: [punchSchema], default: []}
  })
  
  var Task = mongoose.model('Task', taskSchema);
  

  router.get('/id/:id', function(req, res){
    var o_id = new mongo.ObjectID(req.params.id);
    cursor = db.collection('tasks').find({"username":req.authenticatedUser.username,"_id":o_id})
    cursor.toArray(function(err, docs){
      if(docs[0]){
        res.json(docs[0]);
      } else {
        res.json([])
      }
    })
  })
  
  /*
  router.get('/points/:points', function(req, res){
    var points = parseInt(req.params.points)
    cursor = db.collection('tasks').find({"username":req.authenticatedUser.username,'points':points})
    cursor.toArray(function(err, docs){
      res.json(docs)
    })
  })
  
  router.get('/project/:project', function(req, res){
    //var o_id = new mongo.ObjectID(req.params.id);
    var project = req.params.project;
    cursor = db.collection('tasks').find({"username":req.authenticatedUser.username,'project':project})
    cursor.toArray(function(err, docs) {
      res.json(docs);
    })
  })
  
  router.get('/time_min/:seconds', function(req, res){
    var seconds = parseInt(req.params.seconds);
    cursor = db.collection('tasks').find({"username":req.authenticatedUser.username,'timeEstimate' : {$gte: seconds}})
    cursor.toArray(function(err, docs) {
      res.json(docs)
    })
  })
  
  router.get('/time_max/:seconds', function(req, res){
    var seconds = parseInt(req.params.seconds);
    cursor = db.collection('tasks').find({"username":req.authenticatedUser.username,'timeEstimate' : {$lte: seconds}})
    cursor.toArray(function(err, docs) {
      res.json(docs)
    })    
  }) */
  
  router.delete('/:id', function(req, res){
    var o_id = new mongo.ObjectID(req.params.id);
    cursor = db.collection('tasks').remove({"username":req.authenticatedUser.username,"_id":o_id})
    // Hebrews 11:1
    res.send('Task identified by {"id":'+o_id +'} has been removed')
  })
  
  /*
  router.put('/:name', function(req, res){
    var name = req.params.name;
    json = {
      'username' : req.authenticatedUser.username,
      'name' : name
    }
    db.collection('tasks').insert(json)
    res.json({
      "success" : true,
      "username" : req.authenticatedUser.username,
      "name" : name
    })
  })*/
  
  router.get('', function(req,res){     
        var cursor = db.collection('tasks').find({'username':req.authenticatedUser.username})
        cursor.toArray(function(err, docs) {
            res.send(docs)
        });
    });
  
  router.post('', function(req, res){
    console.log(req.authenticatedUser.username)
    task = new Task({
      username: req.authenticatedUser.username,
      taskname: req.body.taskname,
      timeEstimate: req.body.timeEstimate,
      points: req.body.points,
      tags: req.body.tags,
      notes: req.body.notes,
      due: req.body.due,
      defer: req.body.defer,
      timeCreated: req.body.timeCreated,
      timeUpdated: req.body.timeUpdated,
      timeCompleted: req.body.timeCompleted,
      project: req.body.project,
      visibility: req.body.visibility,
      onComplete: req.body.onComplete,
      punches: req.body.punches
    })

    task.save(function(err, task) {
      if (err) {
        res.send(err);
      } else {
        res.send(task) 
      }

    })
  })
  
  router.post('/complete/:id', function(req, res) {
    var o_id = new mongo.ObjectID(req.params.id);
    var json = {}
    cursor = db.collection('tasks').find({'_id':o_id})
    cursor.toArray(function(err, docs) {
        json = docs[0]
        json.timeCompleted = new Date()
      db.collection('tasks').update({'_id':o_id}, json)
      cursor = db.collection('tasks').find({'_id':o_id})
      cursor.toArray(function(err, docs) {
          res.send(docs[0])
      });
    });    
  })
  
  /*
  router.get('/punch/:id', function(req, res){
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
*/
  
  return router
  
}
  
