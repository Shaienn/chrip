/**
 * Created by shaienn on 01.09.15.
 */

console.log("Start");

var gui = require('nw.gui');
var win = gui.Window.get();
var os = require('os');
var path = require('path');
var url = require('url');
var Q = require('q');
var base64 = require('node-base64-image');
var sizeOf = require('image-size');
var keypress = require('keypress');
var ColorPicker = require('simple-color-picker-jq');
var fse = require('fs-extra');
var FileReader = require('filereader');
var xml2js = require('xml2js');
var klaw = require('klaw');
var sqlite3 = require('sqlite3').verbose();
var assert = require('assert');
var http = require('http');
var restify = require('restify');
var fontManager = require('font-manager-nw');

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
    fse.appendFileSync(path.join(App.Config.runDir.toString(), '\logs.txt'), '\n\n' + (arguments[0].stack || arguments[0])); // log errors;
};

var App = new Backbone.Marionette.Application();

_.extend(App, {
    Controller: {},
    View: {
	MainWindow: {},
	SongService: {
	    Authors: {},
	    PlayList: {},
	    Songs: {},
	    Slides: {}
	},
	Bible: {
	    Slides: {},
	},
	Media: {
	    Elements: {},
	},
	Settings: {},
	Common: {
	    Slides: {},
	    ItemList: {},
	    Forms: {},
	},
	BlockScreens: {
	    Slides: {},
	    Elements: {},
	    Editor: {},
	    Groups: {},
	},
    },
    Model: {
	SongService: {
	    Authors: {},
	    PlayList: {},
	    Songs: {},
	    Slides: {},
	    Elements: {},
	},
	SongEditor: {},
	Bible: {
	    Slides: {},
	},
	Media: {
	    Elements: {},
	},
	Common: {
	    Slides: {},
	    ItemList: {}
	},
	BlockScreens: {
	    Editor: {},
	    Elements: {},
	    Groups: {},
	    Slides: {},
	},
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

    console.log("Init templates");

    /* Read all files from /templates directory */
    App.SplashScreen.send_progress("Init templates", null);

    function get_tpl_files() {
	var d = Q.defer();
	var f = [];
	klaw('./templates')
		.on('data', function (item) {
		    if (item.stats.isFile()) {
			f.push(item.path);
		    }
		})
		.on('error', function (err, item) {
		    win.error(err.message);
		    win.error(item.path); // the file the error occurred on
		    throw new Error(err);
		})
		.on('end', function () {
		    d.resolve(f);
		});

	return d.promise;
    }

    function add_tpl_into_dom(items) {
	var ts = []; // files, directories, symlinks, etc
	var d = Q.defer();
	console.log(items[0]);
	items.forEach(function (item) {
	    fse.readFile(item, function (err, data) {
		if (err) {
		    win.error(err);
		    throw new Error(err);
		}

		var tpl = document.createElement('script');
		tpl.setAttribute('type', "text/x-template");
		tpl.setAttribute('id', path.basename(item, '.tpl') + "-tpl");
		tpl.innerHTML = data;
		document.body.appendChild(tpl);
		win.log(path.basename(item, '.tpl') + "-tpl");
		d.resolve(true);
	    });

	    ts.push(d.promise);
	});
	return Q.all(ts);
    }

    var d = Q.defer();
    get_tpl_files().then(add_tpl_into_dom).then(function () {
	d.resolve(true);
    });

    return d.promise;
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

    win.log("getMac");

    var d = Q.defer();
    App.SplashScreen.send_progress("Get MAC address", null);
    require('getmac').getMac(
	    function (err, macAddress) {
		if (err) {
		    win.error(err);
		    throw new Error(err);
		}

		Settings.Config.mac = macAddress;
		App.SplashScreen.send_progress(null, "OK");
		d.resolve(macAddress);
	    }
    );
    return d.promise;
};

var initApp = function () {

    win.log("initApp");

    var nwPath = process.execPath;
    var nwDir = path.dirname(process.execPath);
    var nwCwd = process.env.PWD;

    win.log(nwPath);
    win.log(nwDir);
    win.log(nwCwd);
    win.log(process);

    if (process.platform === "linux") {
	App.Config.execDir = nwCwd;//process.cwd();
	App.Config.runDir = nwCwd;//nwDir;
    } else {
	App.Config.execDir = process.cwd();
	App.Config.runDir = nwDir;
    }

    App.ControlWindow = win;

    win.show();
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
	    .then(
		    function () {
			App.SplashScreen.send_progress("Initializing", null);
		    })
	    .then(initTemplates)
	    .catch(
		    function (err) {
			App.SplashScreen.send_progress("Init templates", err.toString() + " failed");
		    })
	    .then(getMac)
	    .then(initApp);
});
