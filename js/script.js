// script.js

    // create the module and name it yucandoApp
    var yucandoApp = angular.module('yucandoApp', ['ngRoute']);
    
    yucandoApp.service('globaljwt', function(){
      var jwt = undefined;
      this.getjwt = function() {
        return jwt;
      }    
      this.setjwt = function($http,passedjwt) {
        jwt = passedjwt
        $http.defaults.headers.common.Authorization = 'Token ' + jwt
      }
      this.isValid = function() {
        // TODO
        if (jwt != undefined)
        {
            return true;
        }
        return false;
      }
    })

    
    yucandoApp.controller('globalController', function($scope, $location) {
        $scope.isNavActive = function(path) {
          if ($location.path() === path){
            return "active"
          } else {
            return ""
          }
        }
    })


    
    yucandoApp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'pages/dashboard.html',
                controller  : 'myCtrl'
            })
            
            .when ('/home', {
                templateUrl : 'pages/dashboard.html',
                controller  : 'myCtrl'
            })

            // route for the about page
            .when('/about', {
                templateUrl : 'pages/about.html',
                controller  : 'aboutController'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl : 'pages/contact.html',
                controller  : 'contactController'
            })
            
            // route for the api page
            .when('/api', {
                templateUrl : 'pages/api.html',
                controller  : 'apiController'
            });
    });
    
    // create the controller and inject Angular's $scope
    yucandoApp.controller('mainController', function($scope) {

        // create a message to display in our view
        $scope.message = 'Everyone come and see how good I look!';
    });
    
    yucandoApp.controller('aboutController', function($scope) {
        $scope.message = 'Look! I am an about page.';
    });

    yucandoApp.controller('contactController', function($scope) {
        $scope.message = 'Contact us! JK. This is just a demo.';
    });

    yucandoApp.controller('apiController', function($scope, $http, globaljwt) {
      $scope.jwt = globaljwt.getjwt()
      $scope.task_id_response = "Yo"
      
      $scope.get_task_id_submit = function() {
        var postdata = $http.get('/task/id/' + $scope.get_task_id)
        postdata.error(function (response) {
          /*
            Error handling
          */
        })      
        postdata.success(function (response) {
          $scope.get_task_id_response = JSON.stringify(response) 
        })
      }
      
      $scope.delete_task_submit = function() {
        var postdata = $http.delete('/task/' + $scope.delete_task_id)
        postdata.error(function (response) {
          /*
            Error handling
          */
        })      
        postdata.success(function (response) {
          $scope.delete_task_response = JSON.stringify(response) 
        })
      }
      
      $scope.put_task_submit = function() {
        var postdata = $http.put('/task/' + $scope.put_task_name)
        console.log($scope.put_task_name)
        postdata.error(function (response) {
          /*
            Error handling
          */
        })      
        postdata.success(function (response) {
          $scope.put_task_response = JSON.stringify(response) 
        })
      }
      
      $scope.task_submit = function() {
        
        var postdata = $http.get('/task')
        postdata.error(function (response) {
          /*
            Error handling
          */
        })      
        postdata.success(function (response) {
          $scope.task_response = JSON.stringify(response)
        })
       
      }
    });
