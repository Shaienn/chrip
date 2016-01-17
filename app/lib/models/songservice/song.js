/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var Q = require('q');


    var Song = Backbone.Model.extend({
        defaults: {
            name: "",
            db: "0",
            aid: "",
            gaid: "",
            sid: "",
            gsid: "",
            text: "",
        },
        rebuild_slides: function () {
            var d = Q.defer();
            var that = this;
            App.SlideGenerator.makeSlidesFromSong(this).then(function (slides) {
                that.slides = slides;
                d.resolve(true);
            });
            return d.promise;
        }

    });
    App.Model.Song = Song;

    var SongCollection = Backbone.Collection.extend({
        model: App.Model.Song,
        comparator: 'name'
    });


    App.Model.SongCollection = SongCollection;


})(window.App);