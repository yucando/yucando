#!/bin/env node
//  OpenShift sample Node application
var express = require('express');

var fs      = require('fs');
var mongo = require('mongodb')
var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;
//var crypto = require('crypto')
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var testDB

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1"
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */



    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {

      self.app = express()
      var db
      
      // Get connection to mongo 
      mongo_port = 27017
      mongo_ip = 'localhost'
      connectString = 'mongodb://' + mongo_ip + ':' + mongo_port + '/'
      mongo_url = mongo_url = process.env.OPENSHIFT_MONGODB_DB_URL || connectString
      mongo_url += 'yucando/'
      console.log(mongo_url)
      mongoose.connect(mongo_url)
      var db = mongoose.connection;
      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function (callback) {
        // yay!
      });
      db.collection('tasks').insert({'name':'Debug mongo', 'user':'wheelerj','estimatedTime':3600})

      
     // connectString = mongo_url
      /*MongoClient.connect(connectString, function(err, dbconn) {
        if (err) throw err;*/
      //db = dbconn
      
      // Create a static directory to access stylesheets
      self.app.use("/styles",express.static(__dirname + "/styles"));
      self.app.use("/js",express.static(__dirname + "/js"));
      self.app.use(bodyParser.urlencoded({ extended: false }));
      self.app.use(bodyParser.json());
      self.app.use(bodyParser())
      self.app.set('superSecret', config.secret);
      //self.app.use('/api', apiRoutes)
      task = require('./routes/task.js')(db)
      self.app.use('/task', task)
      
      user = require('./routes/user.js')(db)
      self.app.use('/user', user)
      
      self.app.get('', function(req, res) {
          res.setHeader('Content-Type', 'text/html');
          res.send(self.cache_get('index.html') );
      });
      
      self.app.get('/', function(req, res) {
          res.setHeader('Content-Type', 'text/html');
          res.send(self.cache_get('index.html') );
      });

    //})



  

    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
