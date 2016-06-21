angular.module('app.controllers', [])

.controller('mainCtrl', function($scope, $firebase, Utils, $firebaseAuth, $state) {
    var auth = $firebaseAuth();
    $scope.logout = function() {
        auth.$signOut();
    };
})

.controller('loginCtrl', function($scope, $firebase, Utils, $firebaseAuth, $state) {
    var auth = $firebaseAuth();
    console.log(auth);
    $scope.login = function(email, pwd) {
        Utils.show();
        auth.$signInWithEmailAndPassword(email, pwd).catch(function(err) {
            console.log(err);
        });
        $state.go('menu.orders');
        Utils.hide();
    }
})

.controller('ordersCtrl', function($scope, Utils, $firebaseAuth, $state, $firebaseArray) {
	/* firebase ref to database */
    var ref = firebase.database().ref();
    var orders = $firebaseArray(ref.child('orders'));
    $scope.noorders = true;
    Utils.show();
    orders.$loaded(
        function(orders) {
            if(orders.length == 0) {
            	$scope.noorders = true;
            } else {
            	$scope.noorders = false;
            	$scope.orders = orders;
            };
            Utils.hide();
        },
        function(error) {
            console.error("Error:", error);
        });
})

.controller('neworderCtrl', function($scope, $firebaseObject, Utils, $firebaseAuth, orderService) {
    /* firebase ref to database */
    var ref = firebase.database().ref();
    /* firebase ref to auth */
    var auth = $firebaseAuth();

    $scope.groups = $firebaseObject(ref.child('menu'));
    $scope.tables = $firebaseObject(ref.child('tables'));
    $scope.orders = $firebaseObject(ref.child('orders'));

    /* get present logged in user details*/
    $scope.user = auth.$getAuth();
    /* no of customers on the table */
    $scope.covers = 0;
    /* menu items selected */
    $scope.orderitems = orderService.getitems();
    /* total items qty ordered */
    $scope.totalQty = orderService.gettotalQty();
    /* total bill amount */
    $scope.totalBill = orderService.gettotalbill();
    /* order type dine-in or take away*/
    $scope.ordertype = "dine in";

    /* fun that converts ionic list to accordian */
    $scope.toggleGroup = function(group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };
    $scope.isGroupShown = function(group) {
        return $scope.shownGroup === group;
    };

    /* check if the menu category is veg or non veg*/
    $scope.isVeg = function(val) {
        return val == "veg" ? true : false;
    };

    /* funcitons to add qty */
    $scope.addQty = function(item) {
        var isItemAdd = false;
        for (var i = 0; i < $scope.orderitems.length; i++) {
            if ($scope.orderitems[i].name === item.name) {
                $scope.orderitems[i].qty = $scope.orderitems[i].qty + 1;
                isItemAdd = true;
            };
        };
        if (!isItemAdd) {
            item.qty = 1;
            $scope.orderitems.push(item);
        };
        $scope.sumCalc();
        console.log($scope.orderitems);
    };

    /* funcitons to remove qty */
    $scope.removeQty = function(item) {
        var zeroqtyitem = null;
        for (var i = 0; i < $scope.orderitems.length; i++) {
            if ($scope.orderitems[i].name === item.name && $scope.orderitems[i].qty > 1) {
                $scope.orderitems[i].qty = $scope.orderitems[i].qty - 1;
                item.qty - 1;
            } else if ($scope.orderitems[i].name === item.name && $scope.orderitems[i].qty == 1) {
                zeroqtyitem = i;
                item.qty = 0;
            };
        };
        if (typeof zeroqtyitem == "number") {
            $scope.orderitems.splice(zeroqtyitem, 1);
        };

        $scope.sumCalc();
        console.log($scope.orderitems);
    };

    /* funcitons to catculate total qty */
    $scope.sumCalc = function() {
        var sum = 0;
        var bill = 0;
        angular.forEach($scope.orderitems, function(item, index) {
            sum += parseInt(item.qty, 10);
            bill += parseInt(item.price, 10) * parseInt(item.qty, 10);
        });
        $scope.totalQty = sum;
        $scope.totalBill = bill;
        orderService.settotalQty(sum);
        orderService.settotalbill(bill);
        orderService.setitems($scope.orderitems);
        console.log(orderService.gettotalQty());
    };
})

.controller('mergeOrdersCtrl', function($scope) {

})

.controller('syncMenuCtrl', function($scope, $state) {

})

.controller('showBillsCtrl', function($scope) {

})

.controller('showOrderCtrl', function($scope) {

})
