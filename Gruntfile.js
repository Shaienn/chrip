"use strict";

var path = require('path');

module.exports = function (grunt) {

    require('load-grunt-config')(grunt, {
        // path to task.js files, defaults to grunt dir
        configPath: path.join(process.cwd(), 'tasks'),

        // auto grunt.initConfig
        init: true,

        // data passed into config.  Can use with <%= test %>
        data: {
            settings: {
                app: './app',
                dist: './dist'
            }
        }
    });

    require('time-grunt')(grunt);

};
