/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var Q = require('q');


    App.Model.Media = Backbone.Model.extend({

        defaults: {

            mrl: "",
            name: "",
            type: "",
            volume: null,
        },

    });

    App.Model.MediaCollection = Backbone.Collection.extend({
        model: App.Model.Media,
    });

})(window.App);
