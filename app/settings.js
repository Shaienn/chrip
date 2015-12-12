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


    /* User interface */

    Settings.appDir = path.dirname( process.execPath );
    Settings.user_db = "/db/user.db";
    Settings.global_db = "/db/global.db";

    /* App settings */

    Settings.appMode = 'songservice';

    //TODO

    Settings.presentation_monitor = 1;
    Settings.slide_string_mode = 'one_font_size_per_slide';
    Settings.font_family = "Arial";
    Settings.backgrounds_path = "./src/app/backgrounds/";

    Settings.Utils = {

        backgroundRandom: [],

        getScreens: function () {

            return gui.Screen.screens;

        },

        getRandomBackground: function (reset) {

            if (reset == true) {
                Settings.Utils.backgroundRandom = [];
            }

            if (Settings.Utils.backgroundRandom.length == 0) {

                /* Reload background files */

                Settings.Utils.backgroundRandom = Settings.Utils.getBackgrounds();
            }

            var background = Settings.Utils.backgroundRandom[Math.floor(Math.random() * Settings.Utils.backgroundRandom.length)];
            var background_index = Settings.Utils.backgroundRandom.indexOf(background);
            Settings.Utils.backgroundRandom.splice(background_index, 1);
            return background.path;
        },

        getBackgrounds: function () {

            var extensions = [".png", ".jpg"];
            var imagesList = [];

            var files = fs.readdirSync(Settings.backgrounds_path);

            files.forEach(function (file) {

                if (extensions.indexOf(path.extname(file)) >= 0) {

                    var imgObj = {

                        name: file,
                        path: Settings.backgrounds_path + "/" + file,

                    };

                    imagesList.push(imgObj);
                }

            });

            return imagesList;

        },

    }


})(window.App);


