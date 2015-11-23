// script.js

    // create the module and name it yucandoApp
    var yucandoApp = angular.module('yucandoApp', ['ngRoute']);


    
    yucandoApp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'pages/dashboard.html',
                controller  : 'mainController'
            })
            
            .when ('/home', {
                templateUrl : 'pages/dashboard.html',
                controller  : 'mainController'
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
