var app = angular.module("myApp", []);



app.filter('secondsToDateTime', [function() {
    return function(seconds) {
        retval = new Date(1970, 0, 1).setSeconds(Math.abs(seconds));
        //retval = retval.toLocaleFormat('HH:mm:ss')
        //if (seconds<0) retval = "-" + retval
         //| secondsToDateTime | date:'HH:mm:ss'
        return retval;
    };
}])
/*
app.filter('underOrOver', [function() {
  return function(seconds) {
    if (seconds >= 0) return 'left to go!'
    return 'over!'
  };
}])*/

app.controller("myCtrl",function($scope, $http, $timeout) {
  $scope.jwt_is_valid = false
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
    var jwt = $http.post('/user/login',json)
            
    jwt.success(function (response) {
      $scope.jwt_is_valid = true
      setHeaderToken($http, response)
      loadTasks($http)
    })
  }
  
  $scope.createTask = function() {
    json = {"name" : $scope.name, "timeEstimate" : $scope.timeEstimate}
    var g = $http.post('/task', json)
    g.success(function(response){
      loadTasks($http)
    });
  }
  
  setHeaderToken = function($http, token) {
      console.log('Setting rerouting properties')
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

  $scope.firstName = "John";
  $scope.lastName = "Doe";
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

});
