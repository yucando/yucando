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
/*
app.filter('underOrOver', [function() {
  return function(seconds) {
    if (seconds >= 0) return 'left to go!'
    return 'over!'
  };
}])*/

yucandoApp.controller("myCtrl",function($scope, $http, $timeout, globaljwt) {
  $scope.jwt = globaljwt.getjwt();
  $scope.jwt_is_valid = globaljwt.isValid();
  if ($scope.jwt_is_valid) {
    setTimeout(function(){
        loadTasks($http)}, 200);
  }
  $scope.areCompletedsShowing = false
  
  $scope.punch = function(id){
    index = getTaskIndex(id)
    var url = '/task/punch/' + id
    var g = $http.get(url);
    $scope.tasks[index].isActive = !$scope.tasks[index].isActive
    //console.log($scope.tasks[index])
    //console.log(index)// + ' ' + $scope.tasks[index].isActive)
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
      $scope.jwt_is_valid = false
      $scope.password = "";
      $scope.loginError = "Invalid username or password"
    })      
    postdata.success(function (response) {
      globaljwt.setjwt($http,response)
      $scope.jwt_is_valid = true
      $scope.loginError = ""
      setHeaderToken($http, response)
      loadTasks($http)    
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
        $scope.jwt_is_valid = false
        $scope.password = "";
        $scope.loginError = "Invalid username or password"
      })      
      jwt.success(function (response) {
        try {
          console.log("Trying" + response);
          if ("error" in response) {
            $scope.registerError = response.error
          }
        } catch (e) {
          $scope.registerError = ""
          $scope.jwt_is_valid = true
          $scope.loginError = ""
          setHeaderToken($http, response)
          loadTasks($http)   
        }
      })      
    } else {
      $scope.registerError = "Passwords don't match"
    }    
  }
  
  $scope.createTask = function() {
    json = {"name" : $scope.name, "timeEstimate" : $scope.timeEstimate}
    var g = $http.post('/task', json)
    g.success(function(response){
      loadTasks($http)
    });
  }
  
  setHeaderToken = function($http, token) {
      $http.defaults.headers.common.Authorization = 'Token ' + token
  }


  

  
  loadTasks = function($http){
  var url = '/task'
  var g = $http.get(url);
  g.success(function (response) {
    angular.forEach(response, function(task, index) {
      task.totalTime = 0
      task.isActive = false
      if ('timeCompleted' in task) {
        task.isIncomplete = false
      } else {
        task.isIncomplete = true
      }
      angular.forEach(task.punches, function(punch, index){
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
          
      })


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
  $scope.messages = ['Hello', 'World']
$scope.sendChatMessage = function() {
  myMsg = $scope.myMsg
  socket.emit('chat message', myMsg);
}

socket.on('chat message', function(msg){
  $scope.messages.push(msg);
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
