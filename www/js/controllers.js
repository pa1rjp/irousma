angular.module('app.controllers', [])

.controller('mainCtrl', function($scope, $firebase, Utils, $firebaseAuth, $state) {
    var auth = $firebaseAuth();
    $scope.logout = function() {
        auth.$signOut();
        $state.go('menu.login');
    };
})

.controller('loginCtrl', function($scope, $firebase, Utils, $firebaseAuth, $state) {
    var auth = $firebaseAuth();
    $scope.email = "pa1rjp@gmail.com";
    $scope.pwd = "pa1rjp";
    console.log(auth);
    $scope.login = function(email, pwd) {
        console.log(auth);
        auth.$signInWithEmailAndPassword(email, pwd)
            .then(function(user) {
                $state.go('menu.orders');
            })
            .catch(function(err) {
                Utils.errMessage(err);
            });
    }
})

.controller('ordersCtrl', function($scope, Utils, $firebaseAuth, $state, $firebaseArray, orderService) {
    /* firebase ref to database */
    var ref = firebase.database().ref();
    var orders = $firebaseArray(ref.child('orders'));
    $scope.noorders = true;
    Utils.show();
    orders.$loaded(
        function(orders) {
            if (orders.length == 0) {
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

    $scope.selectTable = function() {
        $state.go('selectTable');
    };

    $scope.deleteOrder = function(order) {
        orders.$remove(orders.$indexFor(order.$id)).then(function(ref) {
            $state.go('menu.orders');
        });
    };

    $scope.editOrder = function(order) {
        orderService.refresh();
        orderService.neworder = order;
        $state.go('selectTable');
    };
})

.controller('tableCtrl', function($scope, $firebaseArray, Utils, $firebaseAuth, orderService, $state) {
    /* firebase ref to database */
    var ref = firebase.database().ref();
    /* firebase ref to auth */
    var auth = $firebaseAuth();

    $scope.tables = $firebaseArray(ref.child('tables'));
    $scope.selectedTable = orderService.neworder.table != null ? orderService.neworder.table : "select";
    /* no of customers on the table */
    $scope.covers = orderService.neworder.covers != null ? orderService.neworder.covers : 0;
    /* get present logged in user details*/
    $scope.user = auth.$getAuth();

    $scope.countChange = function(c) {
        orderService.neworder.covers = c;
    };
    $scope.selectTable = function(t) {
        orderService.neworder.table = $scope.tables[t - 1];
    };

    $scope.selectMenu = function() {
        orderService.neworder.user = $scope.user.email;
        $state.go("selectMenu");
    };
})

.controller('menuCtrl', function($scope, $firebaseObject, Utils, $firebaseAuth, orderService, $state) {
    /* firebase ref to database */
    var ref = firebase.database().ref();
    /* firebase ref to auth */
    var auth = $firebaseAuth();
    console.log(orderService.neworder);

    $scope.groups = $firebaseObject(ref.child('menu'));
    /* menu items selected */
    $scope.orderitems = orderService.neworder.orderitems != null ? orderService.neworder.orderitems : [];
    /* total items qty ordered */
    $scope.totalQty = orderService.neworder.totalQty != null ? orderService.neworder.totalQty : 0;
    /* total bill amount */
    $scope.totalBill = orderService.neworder.totalbill != null ? orderService.neworder.totalbill : 0;

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
        var qty = 0;
        var bill = 0;
        angular.forEach($scope.orderitems, function(item, index) {
            qty += parseInt(item.qty, 10);
            bill += parseInt(item.price, 10) * parseInt(item.qty, 10);
        });
        $scope.totalQty = qty;
        $scope.totalBill = bill;
    };

    $scope.getQty = function(item) {
        if ($scope.orderitems.length > 0) {
            for (var i = 0; i < $scope.orderitems.length; i++) {
                if ($scope.orderitems[i].name == item.name) {
                    return item.qty = $scope.orderitems[i].qty;
                };
            }
        } else {
            return item.qty = 0;
        };
    };

    $scope.reviewOrder = function() {
    	console.log(orderService.neworder);
    	console.log($scope.orderitems, $scope.totalQty, $scope.totalBill);
        orderService.neworder.orderitems = $scope.orderitems;
        orderService.neworder.totalQty = $scope.totalQty;
        orderService.neworder.totalBill = $scope.totalBill;
        $state.go('reviewOrder');
    };
})

.controller('reviewCtrl', function($scope, $firebaseArray, Utils, $firebaseAuth, orderService, $state) {
    console.log(orderService.neworder);
    /* firebase ref to database */
    var ref = firebase.database().ref();
    /* menu items selected */
    $scope.orderitems = orderService.neworder.orderitems != null ? orderService.neworder.orderitems : [];
    /* total bill amount */
    $scope.totalBill = orderService.neworder.totalBill != null ? orderService.neworder.totalBill : 0;
    /* order type dine-in or take away*/
    $scope.ordertype = orderService.neworder.ordertype != null ? orderService.neworder.ordertype : "dine in";
    /* kitchen notes*/
    $scope.kitchennotes = orderService.neworder.kitchennotes != null ? orderService.neworder.kitchennotes : "";
    /* total items qty ordered */
    $scope.totalQty = orderService.neworder.totalQty != null ? orderService.neworder.totalQty : 0;
console.log($scope.orderitems, $scope.totalQty, $scope.totalBill)
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
        var qty = 0;
        var bill = 0;
        angular.forEach($scope.orderitems, function(item, index) {
            qty += parseInt(item.qty, 10);
            bill += parseInt(item.price, 10) * parseInt(item.qty, 10);
        });
        $scope.totalQty = qty;
        $scope.totalBill = bill;
    };

    $scope.saveorder = function() {
        orderService.neworder.orderitems = $scope.orderitems;
        orderService.neworder.totalBill = $scope.totalBill;
        orderService.neworder.ordertype = $scope.ordertype;
        orderService.neworder.kitchennotes = $scope.kitchennotes;
        orderService.neworder.totalQty = $scope.totalQty;

        var orders = $firebaseArray(ref.child('orders'));
        orders.$add(orderService.neworder).then(function(ref) {
            var id = ref.key;
            console.log("added record with id " + id);
            orders.$indexFor(id); // returns location in the array
            orderService.refresh();
            $state.go('menu.orders');
        });
    };
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
