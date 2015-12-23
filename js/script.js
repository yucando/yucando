// script.js

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    // create the module and name it yucandoApp
    var yucandoApp = angular.module('yucandoApp', ['ngRoute']);
    
    
    
    yucandoApp.service('globaljwt', function($http){
      jwt = getCookie('token')
      if (jwt || 0 != jwt.length) {
        $http.defaults.headers.common.Authorization = 'Token ' + jwt
      } else {
        jwt = undefined;
      }
      this.getjwt = function() {
        return jwt;
      }    
      this.setjwt = function($http,passedjwt) {
        jwt = passedjwt
        $http.defaults.headers.common.Authorization = 'Token ' + jwt
        var start_pos = jwt.indexOf('.') + 1;
        var end_pos = jwt.indexOf('.',start_pos);
        var encoded_payload = jwt.substring(start_pos, end_pos);
        var decoded_payload = JSON.parse(atob(encoded_payload));
        var expiry_date = new Date(decoded_payload.exp * 1000).toGMTString();
        document.cookie="token="+jwt + "; expires=" + expiry_date;
      }
      this.isSet = function() {
        if (jwt != undefined)
        {
            return true;
        }
        return false;
      }
      this.unsetjwt = function($http) {
        document.cookie="token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        $http.defaults.headers.common.Authorization = null;
        jwt = undefined;
      }
    })

    
    yucandoApp.controller('globalController', function($rootScope, $scope, $location, $route, $http, globaljwt) {
        $scope.isNavActive = function(path) {
          if ($location.path() === path){
            return "active";
          } else {
            return "";
          }
        }
        
        $rootScope.jwt_is_set = globaljwt.getjwt();
        
        $scope.logout = function() {
          globaljwt.unsetjwt($http);
          $route.reload();
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
