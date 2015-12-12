/**
 * Created by shaienn on 02.09.15.
 */
(function (App) {
    'use strict';

    var Config = {

        title: 'Chrip',
        platform: process.platform,

        /* Db */
        db_user: './db/user.db',
        db_global: './db/global.db',
        db_bible: './db/bible.db',

        partOpenTag: '\[part\]',
        partCloseTag: '\[\/part\]',

    };

    App.Config = Config;
})(window.App);
