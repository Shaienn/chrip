/**
 * Created by shaienn on 01.09.15.
 */

console.log("Start");

var
	gui = require('nw.gui'),
	win = gui.Window.get(),
	os = require('os'),
	path = require('path'),
	url = require('url'),
	Q = require('q'),
	PEG = require("pegjs");

var base64 = require('node-base64-image');
var sizeOf = require('image-size');
//var intel = require('intel');
var keypress = require('keypress');
var ColorPicker = require('simple-color-picker-jq');
var fs = require('fs-extra');
var FileReader = require('filereader');
var xml2js = require('xml2js');
var klaw = require('klaw');

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
	SongService: {
	    Authors: {},
	    PlayList: {},
	    Songs: {},
	    Slides: {}
	},
	Bible: {},
	Media: {
	    Elements: {},
	},
	Settings: {},
	Common: {
	    Slides: {},
	    ItemList: {}
	},
	BlockScreens: {
	    Editor: {},
	    Elements: {},
	    Groups: {},
	},
    },
    Model: {
	SongService: {
	    Authors: {},
	    PlayList: {},
	    Songs: {},
	    Slides: {}
	},
	SongEditor: {},
	Bible: {},
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
		    console.log(err.message);
		    console.log(item.path); // the file the error occurred on
		    d.reject(err);
		})
		.on('end', function () {
		    d.resolve(f);
		});

	return d.promise;
    }

    function add_tpl_into_dom(items) {
	var ts = []; // files, directories, symlinks, etc
	var d = Q.defer();

	items.forEach(function (item) {
	    fs.readFile(item, function (err, data) {
		if (err) {
		    d.reject(err);
		}

		var tpl = document.createElement('script');
		tpl.setAttribute('type', "text/x-template");
		tpl.setAttribute('id', path.basename(item, '.tpl') + "-tpl");
		tpl.innerHTML = data;
		document.body.appendChild(tpl);
		console.log(path.basename(item, '.tpl') + "-tpl");
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

    App.Config.execDir = nwCwd;//process.cwd();
    App.Config.runDir = nwCwd;//nwDir;
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
	    .then(function () {
		App.SplashScreen.send_progress("Initializing", null);
	    })
	    .then(initTemplates)
	    .catch(function (err) {
		App.SplashScreen.send_progress("Init templates", err.toString() + " failed");
	    })
	    .then(getMac)
	    .then(initApp);
});
