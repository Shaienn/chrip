/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var PlayListModel = Backbone.Model.extend({});
    App.Model.PlayList = PlayListModel;

    var PlayListCollection = Backbone.Collection.extend({
        initialize: function () {
            this.on("add", _.bind(this.addToPlaylist, this));
            this.on("change", _.bind(this.changePlaylist, this));
            this.on("remove", _.bind(this.removeFromPlaylist, this));
        },
        onDestroy: function () {
            this.off("add");
            this.off("change");
            this.off("remove");
        },
        changePlaylist: function () {
            App.Database.removeAllFromLastSongs().then(function () {
                App.Model.PlayListCollection.each(function (model) {
                    App.Database.addSongToLastSongs(model);
                });
            });
        },
        addToPlaylist: function (song) {
            App.SlideGenerator.makeSlidesFromSong(song).then(function (slides) {
                song.slides = slides;
            });
            
            App.Database.addSongToLastSongs(song);
        },
        removeFromPlaylist: function (song) {
            App.Database.removeSongFromLastSongs(song);
        },
    });

    App.Model.PlayListCollection = new PlayListCollection({
        model: App.Model.Song,
    })

    App.Model.PlayListCollection.reset([]);

})(window.App);
