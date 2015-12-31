'use strict';
(function (App) {
    var Q = require('q');
    var net = require('net');
    var fs = require('fs');
    var request = require('request');
    var assert = require('assert');
    var restify = require('restify');



    App.Update = {
        socket: null,
        connect: function (task) {
            var that = this;

            if (that.socket == null) {
                that.socket = new net.Socket();
            }

            if (that.socket.destroyed == false) {
                that.socket.destroy();
            }

            that.socket.connect(8888, '127.0.0.1', _.bind(that.clientScheduler, that, task));

//            this.checkUpdateRoutine().then(function () {
//                that.socket.destroy();
//            });
        },
        runCheckUpdade: function () {
            var that = this;
            (function p() {
                _.bind(that.connect, that)();
                setTimeout(p, 5000);
            })();
        },
        clientScheduler: function (task) {

            console.log(task);

            switch (task) {
                case "getSongBaseUrl":
                    break;
                default:
                    this.checkUpdateRoutine();
            }

        },
        /* 
         * Get songBase version from server, compare it with local 
         * and set or not set update available flag
         */

        checkUpdateRoutine: function () {
            console.log("check request");
            this.getLastVersionNumber().then(function (result) {
                if (result != Settings.Config.version) {
                    console.log("UPDATE");

                    /* TODO set update available flag */

                }
            });
        },
        
        
        
        
        
        
//        getSongBaseFileLink: function () {
//            var d = Q.defer();
//            var that = this;
//            var request_obj = {
//                type: "get",
//                object: "songbase",
//                request: "file"
//            };
//
//            this.getRequest(request_obj, 5000).then(
//                    function (result) {
//                        that.downloadSongBaseFile(result.toString());
//                        console.log("Path: " + result.toString());
//                    },
//                    function (err) {
//
//                    });
//
//            return d.promise;
//        },
//        downloadSongBaseFile: function (uri) {
//            var d = Q.defer();
//
//            var basePath = Settings.Config.tmpPath;
//
////            if (fs.existsSync(basePath)) {
////                fs.rmdirSync(basePath);
////            }
//
//            console.log("create: " + basePath);
//            fs.mkdirSync(basePath);
//
//            request.head(uri, function (err, res, body) {
//
//                console.log('content-type:', res.headers['content-type']);
//                console.log('content-length:', res.headers['content-length']);
//
//                var r = request(uri).pipe(fs.createWriteStream(basePath + "global.db"));
//
//                r.on('close', function () {
//                    console.log("closed");
//                    d.resolve(basePath + "global.db");
//                });
//
//                r.on('error', function () {
//                    console.log("error");
//                    d.reject(false);
//                });
//            });
//
//            return d.promise;
//        },
        getLastVersionNumber: function () {

            var d = Q.defer();

            var request_obj = {
                type: "get",
                object: "songbase",
                request: "version"
            };

            this.getRequest(request_obj).then(
                    function (result) {
                        d.resolve(result);
                    },
                    function (err) {

                        console.log("got error");
                        console.log(err);
                        d.reject(false);
                    });

            return d.promise;

        },
        
        /* General send request and get answer routine */

        getRequest: function (request_obj, timeout) {

            console.log("getRequest");

            if (typeof (timeout) == "undefined") {
                timeout = 5000;
            }

            var d = Q.defer();
            var that = this;
            var data = JSON.stringify(request_obj);

            var result = this.socket.write(data, 'utf8', function () {

                console.log("write complete");

                var timeoutCounter = setTimeout(function () {
                    console.log("timeout");
                    that.socket.destroy();
                    d.reject("timeout error");
                }, timeout);

                that.socket.on('data', function (data) {
                    console.log("got data");
                    that.socket.removeAllListeners('data');
                    clearTimeout(timeoutCounter);

                    var result_obj = JSON.parse(data.toString());
                    console.log(result_obj);

                    if (result_obj.type != request_obj.type) {
                        d.reject("wrong packet");
                    }

                    if (result_obj.object != request_obj.object) {
                        d.reject("wrong packet");
                    }

                    if (result_obj.request != request_obj.request) {
                        d.reject("wrong packet");
                    }

                    if (result_obj.result == "undefined") {
                        d.reject("wrong packet");
                    }

                    d.resolve(result_obj.result);
                });
            });

            if (result == false) {
                d.reject("send error");
            }

            return d.promise;
        },
    }

})(window.App);

