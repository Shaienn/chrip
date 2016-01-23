/**
 * Created by shaienn on 01.09.15.
 */

console.log("Start");

var
// Load native UI library
        gui = require('nw.gui'),
// browser window object
        win = gui.Window.get(),
// os object
        os = require('os'),
// path object
        path = require('path'),
// fs object
        fs = require('fs'),
// url object
        url = require('url'),
        Q = require('q'),
        PEG = require("pegjs");

//var intel = require('intel');
var keypress = require('keypress');

win.log = console.log.bind(console);
win.debug = function () {
    var params = Array.prototype.slice.call(arguments, 1);
    params.unshift('%c[%cDEBUG%c] %c' + arguments[0], 'color: black;', 'color: green;', 'color: black;', 'color: blue;');
    console.debug.apply(console, params);
};
win.info = function () {
    var params = Array.prototype.slice.call(arguments, 1);
    params.unshift('[%cINFO%c] ' + arguments[0], 'color: blue;', 'color: black;');
    console.info.apply(console, params);
};
win.warn = function () {
    var params = Array.prototype.slice.call(arguments, 1);
    params.unshift('[%cWARNING%c] ' + arguments[0], 'color: orange;', 'color: black;');
    console.warn.apply(console, params);
};
win.error = function () {
    var params = Array.prototype.slice.call(arguments, 1);
    params.unshift('%c[%cERROR%c] ' + arguments[0], 'color: black;', 'color: red;', 'color: black;');
    console.error.apply(console, params);
    fs.appendFileSync(path.join(require('nw.gui').App.dataPath, 'logs.txt'), '\n\n' + (arguments[0].stack || arguments[0])); // log errors;
};


var App = new Backbone.Marionette.Application();

_.extend(App, {
    Controller: {},
    View: {
        MainWindow: {},
        SongService: {},
        Bible: {},
        Videoplayer: {},
        Settings: {},
    },
    Model: {
        SongService: {},
        SongEditor: {},
        Bible: {},
        Videoplayer: {},
    },
    ControlWindow: null,
    Presentation: {},
    Settings: {},
    Localization: {},
    Database: {},
    SplashScreen: {},
    presentation_state: false,
    active_mode: false,
});

App.ViewStack = [];

var initTemplates = function () {
    App.SplashScreen.send_progress("Init templates", null);
    var ts = [];
    _.each(document.querySelectorAll('[type="text/x-template"]'), function (el) {
        var d = Q.defer();
        $.get(el.src)
                .done(
                        function (res) {
                            el.innerHTML = res;
                            d.resolve(true);
                        })
                .fail(
                        function () {
                            d.reject(false);
                        });
        ts.push(d.promise);
    });
    return Q.all(ts);
};

var closeApp = function () {
    win.log("Application closed");
    win.close();
    if (App.presentation_state == true) {

        for (var i = 0; i < App.PresentationWindows.length; i++) {
            App.PresentationWindows[i].close();
        }
    }
    process.exit(0);
};


var getMac = function () {
    var d = Q.defer();
    App.SplashScreen.send_progress("Get MAC address", null);
    require('getmac').getMac(
            function (err, macAddress) {
                if (err)
                    throw new Error(err);

                Settings.Config.mac = macAddress;
                App.SplashScreen.send_progress(null, "OK");
                d.resolve(macAddress);
            }
    );
    return d.promise;
};

var initApp = function () {


//    intel.setLevel(intel.WARN);
//    intel.addHandler(new intel.handlers.File('test.log'));
//    intel.info("Start init app");
//    intel.warn('i made it!');
//    intel.debug('nobody loves me');

    var nwPath = process.execPath;
    var nwDir = path.dirname(process.execPath);
    var nwCwd = process.env.PWD;

    console.log(nwPath);
    console.log(nwDir);
    console.log(nwCwd);

    App.Config.execDir = process.cwd();
    App.Config.runDir = nwDir;
    App.ControlWindow = win;


    win.on("close", closeApp);


    try {
        App.Window.show(new App.View.MainWindow.Root());
    } catch (e) {
        win.error('Couldn\'t start app: ', e, e.stack);
    }
};


App.addRegions({
    Window: '.main-window-region'
});


App.addInitializer(function (options) {
    App.SplashScreen.open()
            .then(function () {
                App.SplashScreen.send_progress("Initializing", null);
            })
            .then(initTemplates)
            .then(getMac)
            .then(initApp);
});
