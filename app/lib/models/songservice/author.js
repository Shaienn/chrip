/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var Q = require('q');


    var Author = Backbone.Model.extend({

        defaults: {

            name: "",
            db: "0",
            uaid: 0,
            gaid: 0,
            text: "",

        },


        initialize: function () {

        },

        getSongs: function () {

            return App.Database.loadSongs(this);

        }


    });
    App.Model.Author = Author;


    var AuthorCollection = Backbone.Collection.extend({
        model: Author,
        comparator: 'name'
    });
    App.Model.AuthorCollection = AuthorCollection;


})(window.App);