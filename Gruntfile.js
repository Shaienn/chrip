"use strict";

var path = require('path');

module.exports = function (grunt) {

    var os;
    switch (process.platform) {
        case 'win32':
            os = 'win';
            break;
        case 'linux':
            os = 'linux';
            break;
        default:
            os = process.platform;
    }


    require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), 'tasks'),
        init: true,
        data: {
            settings: {
                app: './app',
                dist: './dist',
                build_platform: 'linux64',
                arch: process.arch,
                os: os
            }
        }
    });

    require('time-grunt')(grunt);

};
