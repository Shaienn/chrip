/**
 * Created by shaienn on 02.09.15.
 */

var Q = require('q');
var os = require('os');
var Settings = {};
var gui = require('nw.gui');
var fontManager = require("font-manager-nw");
var fs = require('fs');
var path = require("path");

(function (App) {

    'use strict';
    gui.Screen.Init();

    var common_background_path = process.env.PWD + "/backgrounds";
    var common_bible_path = process.env.PWD + "/bible";

    /* User interface */

    Settings.GeneralSettings = {
        user_db: "/db/user.db",
        global_db: "/db/global.db",
        updateServer: "http://127.0.0.1:8080",
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

    Settings.Config = {
        version: 0,
        tmpPath: "./tmp",
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


