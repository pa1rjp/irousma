angular.module('app.services', [])

.factory('Utils', function($ionicLoading, $ionicPopup) {
    var Utils = {
        show: function() {
            $ionicLoading.show({
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 200,
                showDelay: 500,
                template: '<ion-spinner icon="android"></ion-spinner>'
            });
        },

        hide: function() {
            $ionicLoading.hide();
        },

        alertshow: function(tit, msg) {
            var alertPopup = $ionicPopup.alert({
                title: tit,
                template: msg
            });
            alertPopup.then(function(res) {
                //console.log('Registrado correctamente.');
            });
        },

        errMessage: function(err) {

            var msg = "Unknown Error...";

            if (err && err.code) {
                switch (err.code) {
                    case "EMAIL_TAKEN":
                        msg = "This Email has been taken.";
                        break;
                    case "INVALID_EMAIL":
                        msg = "Invalid Email.";
                        break;
                    case "NETWORK_ERROR":
                        msg = "Network Error.";
                        break;
                    case "INVALID_PASSWORD":
                        msg = "Invalid Password.";
                        break;
                    case "INVALID_USER":
                        msg = "Invalid User.";
                        break;
                }
            }
            Utils.alertshow("Error", msg);
        }
    };
    return Utils;
})

.factory('orderFactory', function() {
    /* order object to hold new order*/
    var neworder = {
        "id": 1,
        "datetime": "",
        "table": "",
        "covers": 0,
        "waiter": "",
        "items": [],
        "totalbill": 0,
        "tax": 0,
        "discount": 0,
        "kitchennotes": "",
        "type": "dine in"
    };
    var totalbill = 0;
    var _order = {
        order: function() {
            return neworder;
        },
        settotalbill: function(bill) {
            totalbill = bill;
        },
        gettotalbill: function() {
            return totalbill;
        }
    };
    return _order;
})

.service('orderService', [function() {
    this.neworder = {
        table: null,
        covers: null,
        user: null,
        orderitems: null,
        totalQty: null,
        totalBill: null,
        kitchennotes: null,
        datetime: new Date()
    };

    this.refresh = function() {
        this.neworder = {
            table: null,
            covers: null,
            user: null,
            orderitems: null,
            totalQty: null,
            totalBill: null,
            kitchennotes: null,
            datetime: new Date()
        };
    };










    this.totalbill = 0;
    this.items = [];
    this.qty = 0;
    this.settotalbill = function(bill) {
        this.totalbill = bill;
    };
    this.gettotalbill = function() {
        return this.totalbill;
    };
    this.setitems = function(items) {
        this.items = items;
    };
    this.getitems = function() {
        return this.items;
    };
    this.settotalQty = function(qty) {
        this.qty = qty;
    };
    this.gettotalQty = function() {
        return this.qty;
    };
}]);
