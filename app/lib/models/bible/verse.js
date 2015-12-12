/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var Q = require('q');


    App.Model.Verse = Backbone.Model.extend({

        defaults: {

            text:"",
            bottom_text:"",
            verse:"",
            cid:"",
            slides:"",
        },

    });

    App.Model.VerseCollection = Backbone.Collection.extend({
        model: App.Model.Verse,
    });

})(window.App);
