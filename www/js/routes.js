angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

        .state('menu', {
        url: '/side-menu21',
        templateUrl: 'templates/menu.html',
        abstract: true
    })

    .state('menu.login', {
        url: '/login',
        views: {
            'side-menu21': {
                templateUrl: 'templates/login.html',
                controller: 'loginCtrl'
            }
        }
    })

    .state('menu.orders', {
        url: '/orders',
        views: {
            'side-menu21': {
                templateUrl: 'templates/orders.html',
                controller: 'ordersCtrl'
            }
        }
    })

    .state('selectTable', {
        cache: false,
        url: '/selecttable',
        templateUrl: 'templates/selectTable.html',
        controller: 'tableCtrl'
    })

    .state('selectMenu', {
        cache: false,
        url: '/selectmenu',
        templateUrl: 'templates/selectMenu.html',
        controller: 'menuCtrl'
    })

    .state('reviewOrder', {
        url: '/revieworder',
        templateUrl: 'templates/reviewOrder.html',
        controller: 'reviewCtrl'
    })

    .state('menu.mergeOrders', {
        url: '/mergeorders',
        views: {
            'side-menu21': {
                templateUrl: 'templates/mergeOrders.html',
                controller: 'mergeOrdersCtrl'
            }
        }
    })

    .state('menu.syncMenu', {
        url: '/syncmenu',
        views: {
            'side-menu21': {
                templateUrl: 'templates/syncMenu.html',
                controller: 'syncMenuCtrl'
            }
        }
    })

    .state('menu.showBills', {
        url: '/showbills',
        views: {
            'side-menu21': {
                templateUrl: 'templates/showBills.html',
                controller: 'showBillsCtrl'
            }
        }
    })

    .state('showOrder', {
        url: '/showorder',
        templateUrl: 'templates/showOrder.html',
        controller: 'showOrderCtrl'
    })

    $urlRouterProvider.otherwise('/side-menu21/login')



});
