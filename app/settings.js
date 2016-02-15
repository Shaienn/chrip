/**
 * Created by shaienn on 02.09.15.
 */

var os = require('os');
var Settings = {};
var gui = require('nw.gui');
var fontManager = require("font-manager-nw");
var fs = require('fs');
var path = require("path");

(function (App) {

    'use strict';
    gui.Screen.Init();

    var common_background_path = path.dirname(process.execPath) + "/backgrounds";
    var common_bible_path = path.dirname(process.execPath) + "/bible";
    var common_blockscreens_path = path.dirname(process.execPath) + "/blockscreens";

    /* User interface */

    Settings.GeneralSettings = {
	user_db: "/db/user.db",
	global_db: "/db/global.db",
	updateServer: "http://185.46.9.150:8080",
	update_period: 300000,
	appMode: 'songservice',
	presentation_monitor: 0,
	transition_time: 300
    };

    Settings.BibleSettings = {
	background_mode: 'all_slides_has_random_back',
	font_family: "Arial",
	backgrounds_path: common_background_path,
	background: common_background_path + "/1.jpg",
	bible_path: common_bible_path,
	bible_xml: common_bible_path + "/sinoid_utf.xml",
	Utils: {
	    backgroundRandom: [],
	    getRandomBackground: function (reset) {
		return Settings.Utils.getRandomBackground(
			Settings.BibleSettings.backgrounds_path,
			Settings.BibleSettings.Utils.backgroundRandom, reset);
	    }
	}
    };

    Settings.SongserviceSettings = {
	background_mode: 'all_slides_has_random_back',
	font_family: "Arial",
	backgrounds_path: common_background_path,
	background: common_background_path + "/1.jpg",
	Utils: {
	    backgroundRandom: [],
	    getRandomBackground: function (reset) {
		return Settings.Utils.getRandomBackground(
			Settings.SongserviceSettings.backgrounds_path,
			Settings.SongserviceSettings.Utils.backgroundRandom, reset);
	    }
	}
    };

    Settings.BlockScreensSettings = {
	show_time: 1500,
	transition_time: 300,
	order: 'random',
    };

    Settings.Config = {
	version: 0,
	tmpPath: "./tmp",
	chord_pattern: /\[[\w\W\s\S]+?\]/g,
	slide_part: {
	    init: "{start_of_slide}",
	    end: "{end_of_slide}",
	    pattern: /\{(?:sos|start_of_slide)\}([\w\s\W\S]+?)\{(?:eos|end_of_slide)\}/g
	},
	song_parts_patterns: {
	    chorus: {
		name: "chorus",
		init: "{soc}",
		end: "{eoc}",
		pattern: /\{(?:soc|start_of_chorus)\}([\w\s\W\S]+?)\{(?:eoc|end_of_chorus)\}/
	    },
	    bridge: {
		name: "bridge",
		init: "{sob}",
		end: "{eob}",
		pattern: /\{(?:sob|start_of_bridge)\}([\w\s\W\S]+?)\{(?:eob|end_of_bridge)\}/
	    },
	    verse: {
		name: "verse",
		init: "",
		end: "",
		pattern: /([\w\s\W\S]+)/
	    }
	}
    };

    Settings.Utils = {
	getScreens: function () {
	    return gui.Screen.screens;
	},
	getPresentationScreen: function () {
	    var screens = Settings.Utils.getScreens();
	    if (typeof screens[Settings.GeneralSettings.presentation_monitor] == "undefined") {
		return screens[0];
	    } else {
		return screens[Settings.GeneralSettings.presentation_monitor];
	    }
	},
	getRandomBackground: function (path, array, reset) {

	    if (reset == true) {
		array = [];
	    }

	    if (array.length == 0) {

		/* Reload background files */

		array = Settings.Utils.getBackgrounds(path);
	    }

	    var background = array[Math.floor(Math.random() * array.length)];
	    var background_index = array.indexOf(background);
	    array.splice(background_index, 1);
	    return background.path;
	},
	getBackgrounds: function (background_path) {

	    var extensions = [".png", ".jpg"];
	    var imagesList = [];

	    var files = fs.readdirSync(background_path);

	    files.forEach(function (file) {

		if (extensions.indexOf(path.extname(file)) >= 0) {

		    var imgObj = {
			name: file,
			path: background_path + "/" + file,
		    };

		    imagesList.push(imgObj);
		}

	    });

	    return imagesList;
	},
	getBlockscreens: function (bs_path) {
	    var extensions = [".bs"];
	    var blocscreensList = [];

	    var files = fs.readdirSync(bs_path);

	    files.forEach(function (file) {

		if (extensions.indexOf(path.extname(file)) >= 0) {

		    var bsObj = {
			name: file,
			path: bs_path + "/" + file,
		    };

		    blocscreensList.push(bsObj);
		}

	    });

	    return blocscreensList;
	},
	getBibles: function () {
	    var extensions = [".xml"];
	    var bibleList = [];

	    var files = fs.readdirSync(Settings.BibleSettings.bible_path);

	    files.forEach(function (file) {

		if (extensions.indexOf(path.extname(file)) >= 0) {

		    var bibleObj = {
			name: file,
			path: Settings.BibleSettings.bible_path + "/" + file,
		    };

		    bibleList.push(bibleObj);
		}

	    });

	    return bibleList;
	}
    }



})(window.App);


