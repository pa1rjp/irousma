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

.controller('ordersCtrl', function($scope, Utils, $firebaseAuth, $state, $firebaseArray, orderService, $ionicPopup, $ionicModal) {
    /* firebase ref to database */
    var ref = firebase.database().ref();
    var orders = $firebaseArray(ref.child('orders'));
    $scope.noorders = true;
    Utils.show();
    var d1 = new Date(); //'02-01-2017 03:56:57.012 PM'
    orders.$loaded(
        function(orders) {
            if (orders.length == 0) {
                $scope.noorders = true;
            } else {
                $scope.noorders = false;
                for (var i = 0; i < orders.length; i++) {
                    d2 = new Date(d1);
                    orders[i].ts = d2.setMinutes(d1.getMinutes() + (i * 15) + 5);
                }
                $scope.orders = orders;
                console.log($scope.orders);
            };
            Utils.hide();
        },
        function(error) {
            console.error("Error:", error);
        });

    $scope.showpop = false;

    $scope.showOrderDetail = function(order, orderid) {
        //var orderitems = ;
        $scope.showpop = true;
        $scope.orderitems = order.orderitems;
        $scope.total = order.totalBill;
        $scope.orderid = orderid;

        $ionicModal.fromTemplateUrl('popup.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(model) {
            $scope.modal = model;
            $scope.modal.show();
        });
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    };
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
        $state.go('selectMenu');
    };

    $scope.updateStatus = function(order, status) {
        console.log(order);
        var order = orders.$getRecord(order.$id);
        order.status = status;
        orders.$save(order).then(function() {
            // data has been saved to our database
        });
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
	/* no of waiters for the table */
    $scope.waiters = $firebaseArray(ref.child('waiters'));
    $scope.selectedWaiter = orderService.neworder.waiters != null ? orderService.neworder.waiters : "select";
    /* get present logged in user details*/
    $scope.user = auth.$getAuth();

    $scope.countChange = function(c) {
        orderService.neworder.covers = c;
    };
    $scope.selectTable = function(t) {
        orderService.neworder.table = $scope.tables[t - 1];
    };

    $scope.selectMenu = function() {
       /* orderService.neworder.user = $scope.user.email; */
        $state.go("selectMenu");
    };

    $scope.placeEmptyorder = function(){
        var err = [];
        err.Msg = "";
        var i =1;
        if(orderService.neworder.table == 'Select' || orderService.neworder.table == null){
            err.code = 1;
            err.Msg +=  i + ". Select table <br />";
            i++;
        }
        if (orderService.neworder.covers <1)
        {
            err.code = 1;
            err.Msg +=  i + ". Select covers <br />";
            i++;
        }
        if(orderService.neworder.waiter == 'Select' || orderService.neworder.waiter == null){
            err.code = 1;
            err.Msg +=  i + ". Select waiter <br />";
            i++;
        }

        if(i>1)
        {
            Utils.errMessage(err);
        }
        else
        {
            orderService.emptyorder.covers =orderService.neworder.covers;
            orderService.emptyorder.table = orderService.neworder.table;
            orderService.emptyorder.user  = orderService.neworder.waiter;//$scope.user.email;

            var ref = firebase.database().ref();
            var orders = $firebaseArray(ref.child('orders'));
            orders.$add(orderService.emptyorder).then(function(ref) {
                var id = ref.key;
                console.log("added record with id " + id);
                orders.$indexFor(id); // returns location in the array
                orderService.refresh();
                $state.go('menu.orders');
            });
        }
    };
  
	$scope.selectWaiters = function(w) {
        orderService.neworder.waiter = $scope.waiters[w - 1];

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
    // var ref = firebase.database().ref();
    //     var orders = $firebaseArray(ref.child('orders'));
    //     $scope.noorders = true;
    //     Utils.show();
    //     orders.$loaded(
    //         function(orders) {
    //             if (orders.length == 0) {
    //                 $scope.noorders = true;
    //             } else {
    //                 $scope.noorders = false;
    //                 $scope.orders = orders;
    //             };
    //             Utils.hide();
    //         },
    //         function(error) {
    //             console.error("Error:", error);
    //         });
})
