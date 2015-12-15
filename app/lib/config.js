/**
 * Created by shaienn on 02.09.15.
 */
(function (App) {
    'use strict';

    var Config = {
        title: 'Chrip',
        platform: process.platform,
        /* */
        execDir: './',
        /* Db */
        db_user: './db/user.db',
        db_global: './db/global.db',
        db_bible: './db/bible.db',
        /* Song part wrappers */

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

    App.Config = Config;
})(window.App);
