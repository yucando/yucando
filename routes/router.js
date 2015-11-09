var router = require('express').Router()
console.log(typeof(router))


  router.get('/api', function(req,res){
    console.log('Done')
    res.send('Hello World')
  })

module.exports = router



/*router.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

router.use(function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
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
}); */


//  Add handlers for the app (from the routes).
/* for (var r in self.routes) {
    self.app.get(r, self.routes[r]);
} */






/**
 *  Create the routing table entries + handlers for the application.
 */
self.createRoutes = function() {
    self.routes = { };

    self.routes['/asciimo'] = function(req, res) {
        var link = "http://i.imgur.com/kmbjB.png";
        res.send("<html><body><img src='" + link + "'></body></html>");
    };

    self.routes['/'] = function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        res.send(self.cache_get('index.html') );
    };

    self.routes['/test'] = function(req, res) {
        res.send('Hello world')
    };

    self.routes['/tasks'] = function(req, res) {
        var cursor = testDB.collection('tasks').find({})
        cursor.toArray(function(err, docs) {
            res.send(docs)
        });
    };
    
    self.routes['/login'] = function(req, res) {
      
    }
    
    self.routes['/recover_password'] = function(req, res) {
      
    }
    
    self.routes['/register'] = function(req, res) {
      
    }
    
