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

var keypress = require('keypress');
var wcjs = require("wcjs-prebuilt");

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
        ChurchService: {},
        SongEditor: {},
        Bible: {},
        Videoplayer: {},
    },
    Model: {
        ChurchService: {},
        SongEditor: {},
        Bible: {},
        Videoplayer: {},
    },
    ControlWindow: null,
    PresentationWindows: [],
    Settings: {},
    Localization: {},
    Database: {},
    presentation_state: false,
    vlc: null,
    video_contexts: [],
    freeze_mode: false,
    black_mode: false
});

App.ViewStack = [];

var initTemplates = function () {

    // Load in external templates

    win.info("Start init templates");

    var ts = [];

    _.each(document.querySelectorAll('[type="text/x-template"]'), function (el) {
        var d = Q.defer();
        $.get(el.src, function (res) {
            el.innerHTML = res;
            d.resolve(true);
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

    require('getmac').getMac(
            function (err, macAddress) {
                if (err)
                    throw err

                console.log(macAddress);
                Settings.Config.mac = macAddress;
                d.resolve(macAddress);
            }
    );

    return d.promise;

};

var initApp = function () {

    win.info("Start init app");

    var nwPath = process.execPath;
    var nwDir = path.dirname(nwPath);
    var nwCwd = process.env.PWD;

    console.log(nwPath);
    console.log(nwDir);
    console.log(nwCwd);

    App.Config.execDir = process.cwd();
    App.Config.runDir = nwCwd;
    App.ControlWindow = win;
    App.vlc = wcjs.createPlayer();

    win.maximize();
    win.show();
    win.on("close", closeApp);

    try {
        App.Window.show(new App.View.MainWindow.Root());
    } catch (e) {
        console.error('Couldn\'t start app: ', e, e.stack);
    }
};




App.addRegions({
    Window: '.main-window-region'
});


App.addInitializer(function (options) {

    win.info("Start init");
    initTemplates()
            .then(getMac)
            .then(initApp);
});
