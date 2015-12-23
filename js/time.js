var yucandoApp = angular.module("yucandoApp");

yucandoApp.filter('secondsToDateTime', [function() {
    return function(seconds) {
        //seconds = (seconds - 18000) / 1000
        retval = new Date(1970, 0, 1).setSeconds(Math.abs(seconds));
//        retval2 = retval.toLocaleFormat('%A')
        //if (seconds<0) retval = "-" + retval
         //| secondsToDateTime | date:'HH:mm:ss'
        return seconds;
    };
}])

yucandoApp.filter('feedTime', [function() {
    return function(date) {
      t1 = new Date(date)
      t2 = new Date();
      seconds = (t2.getTime() - t1.getTime())/1000;
      switch(true) {
        case (seconds < 60):
          return "Less than a minute ago";
          break;
        case (seconds >= 60 && seconds < 3600):
          return Math.floor(seconds/60) + " minutes ago";
          break;
        case (seconds >= 3600 && seconds < 60 * 60 * 24):
          return Math.floor(seconds / 3600) + " hours ago";
          break;
        case (seconds >= 60 * 60 * 24):
          return Math.floor(seconds / (60 * 60 * 24)) + " days ago";
          break;
      }
        //retval = date//.getTime() //- Date().getTime();
        return retval
    };
}])
/*
app.filter('underOrOver', [function() {
  return function(seconds) {
    if (seconds >= 0) return 'left to go!'
    return 'over!'
  };
}])*/

yucandoApp.controller("myCtrl",function($rootScope, $scope, $http, $route, $timeout, globaljwt) {
  $rootScope.jwt = globaljwt.getjwt();
  $scope.test = "Hello World";
  $rootScope.jwt_is_set = globaljwt.isSet($http);
  if ($rootScope.jwt_is_set) {
    setTimeout(function(){
        loadTasks($http); loadFeed($http)}, 200);

  }
  $scope.areCompletedsShowing = false
  
  $scope.punch = function(id){
    index = getTaskIndex(id)
    var url = '/task/punch/' + id
    var g = $http.get(url);
    $scope.tasks[index].isActive = !$scope.tasks[index].isActive
  }
  
  $scope.complete = function(id) {
    index = getTaskIndex(id)
    var url = '/task/complete/' + id
    var g = $http.post(url);
    $scope.tasks[index].isIncomplete = false
  }
  
  getTaskIndex = function(id) {
    var retval = -1
    angular.forEach($scope.tasks, function(task, index){
      if (task._id == id){
        retval = index
        return(retval)
      }
      })
    return(retval)
  }
  
  $scope.login = function() {
    json = {"username" : $scope.username, "password" : $scope.password}
    var postdata = $http.post('/user/login',json)
    postdata.error(function (response) {
      $rootScope.jwt_is_set = false
      $scope.password = "";
      $scope.loginError = "Invalid username or password"
    })      
    postdata.success(function (response) {
      globaljwt.setjwt($http,response)
      $scope.$emit('login')
      $rootScope.jwt_is_set = true;
      $scope.loginError = ""
      setHeaderToken($http, response)
      loadTasks($http)  
      loadFeed($http)  
    })
  }
  
  $scope.register = function() {
    if (angular.equals($scope.registerPassword,$scope.registerPasswordCheck)) {
      json = {
        "username" : $scope.registerUsername,
        "firstName" : $scope.registerFirstName,
        "lastName" : $scope.registerLastName,
        "password" : $scope.registerPassword,
        "email" : $scope.registerEmail
      }
      var jwt = $http.post('/user/register', json)
      jwt.error(function (response) {
        $rootScope.jwt_is_set = false
        $scope.password = "";
        $scope.loginError = "Invalid username or password"
      })      
      jwt.success(function (response) {
        try {
          if ("error" in response) {
            $scope.registerError = response.error
          }
        } catch (e) {
          $scope.registerError = ""
          $rootScope.jwt_is_set = true
          $scope.loginError = ""
          setHeaderToken($http, response)
          loadTasks($http)   
          loadFeed($http)
        }
      })      
    } else {
      $scope.registerError = "Passwords don't match"
    }    
  }
  
  $scope.createTask = function() {
    json = {"taskname" : $scope.taskname, "timeEstimate" : $scope.timeEstimate}
    var g = $http.post('/task', json)
    g.success(function(response){
      loadTasks($http)
    });
  }
  
  setHeaderToken = function($http, token) {
      $http.defaults.headers.common.Authorization = 'Token ' + token
  }

  $scope.logout = function() {
    globaljwt.unsetjwt($http);
    $rootScope.jwt_is_set = false;
  }
  
  loadFeed = function($http){
    var url = '/feed'
    var g = $http.get(url);
    g.success(function(response){
      angular.forEach(response, function(message, index) {
        void(0) // Do nothing for now.
      })
      $scope.feed = response;
      return response;
    })
  }
  
  loadTasks = function($http){
  var url = '/task'
  var g = $http.get(url);
  g.success(function (response) {
    console.log(response);
    angular.forEach(response, function(task, index) {
      task.totalTime = 0
      task.isActive = false
      if ('timeCompleted' in task) {
        task.isIncomplete = false
      } else {
        task.isIncomplete = true
      }
      /*angular.forEach(task.punches, function(punch, index){
          var d_in
          var d_out
          if ("in" in punch) {
            d_in = Date.parse(punch.in)
          }
          
          if ("out" in punch) {
            d_out = Date.parse(punch.out)
            task.isActive = false
          } else {
            d_out = Date.parse(new Date())
            task.isActive = true
          }
          if (d_in != undefined) {
            d_in = parseInt(d_in)
            d_out = parseInt(d_out)
            
            punch.duration = (d_out - d_in) / 1000
            //task.totalTime += punch.duration
            task.totalTime += Math.round(punch.duration)
          }
          
      })*/


    });
    $scope.tasks = response;
    $scope.timeLeft = 0 //get_remaining_time()
  });
  }

  $scope.totalTime = [0,1,2,3,4,5,6,7,8,9,10]
  $scope.counter = 0
  var stopped
    



  
    


countdown = function(){
  stopped = $timeout(function() {
    $scope.counter++;   
    $scope.countdown();  
    angular.forEach($scope.tasks, function(task, index){
      if(task.isActive)
        task.totalTime++
    }) 
  }, 1000);  
}

countdown()
$scope.countdown = countdown
  
$scope.stop = function(){
  $timeout.cancel(stopped);
} 


  var socket = io();
$scope.sendChatMessage = function() {
  
  json = {"message" : $scope.myMsg}
  var postdata = $http.post('/feed',json)
  $scope.myMsg = ""
  postdata.error(function (response) {
    alert('Your session has expired. Log out and back in again.')
  })      
  postdata.success(function (response) {
    /* Wait for chat message to come back through socket */
  })
  /*socket.emit('chat message', myMsg);*/
}
$rootScope.mrs = {"message" : 'hi'}
socket.on('chat message', function(msg){

  $scope.feed = $scope.feed.concat(msg).sort(function(a, b){
    t1 = new Date(a.timestamp)
    t2 = new Date(b.timestamp)
    return (t1.getTime() == t2.getTime() ? 0 : (t1.getTime() > t2.getTime() ? -1: 1))
  }).slice(0,10);
  $rootScope.$digest();
  $rootScope.mrs = msg;
})

/* 
Login
*/

$(function() {
    $('#login-form-link').click(function(e) {
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function(e) {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});

});
/*
End Login
*/




});
