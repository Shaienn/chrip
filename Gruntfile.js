"use strict";

var path = require('path');

module.exports = function (grunt) {

    var target = grunt.option('target');
    var available = ['win32', 'linux32', 'win64', 'linux64'];

    if (available.indexOf(target) == -1) {
        console.log("--target should be a one of: " + available.toString());
        return;
    }

    require('load-grunt-config')(grunt, {
        // path to task.js files, defaults to grunt dir
        configPath: path.join(process.cwd(), 'tasks'),
        // auto grunt.initConfig
        init: true,
        // data passed into config.  Can use with <%= test %>
        data: {
            settings: {
                app: './app',
                dist: './dist',
                build_platform: target,
                
            }
        }
    });

    require('time-grunt')(grunt);

};
