/**
 * Created by shaienn on 25.09.15.
 */
(function (App) {
    'use strict';

    var SongeditorSongbase = Backbone.Marionette.LayoutView.extend({

        template: '#songeditor-songbase-tpl',
        className: 'songeditor-songbase-contain',

        regions: {
            TopToolbar_r: '#songBaseToolbar',
            AuthorsList_r: '#songBaseAuthorsList .area',
            AuthorsListControl_r: '#songBaseAuthorsList .control',
            SongList_r: '#songBaseSongsList .area',
            SongListControl_r: '#songBaseSongsList .control',
            Editor_r: '#songBaseSongEditor',
        },

        events: {
            'click .close-icon': 'closeSongbase',
        },

        initialize: function () {

            App.vent.on("songbase:loadsongs", _.bind(this.loadSongs, this));
            App.vent.on("songbase:search", _.bind(this.search, this));
            App.vent.on("songbase:edit", _.bind(this.openEditor, this));
        },

        openEditor: function (song) {
            win.log("openEditor request");

            this.Editor_r.show(new App.View.SongEditor.Root({
                loaded_text: song.get('text'),
            }));


        },

        onDestroy: function () {

            win.log("songbase destroy request");
            App.vent.off("songbase:loadsongs");
            App.vent.off("songbase:search");
            App.vent.off("songbase:edit");
        },


        loadText: function (song) {

            if (!(song instanceof App.Model.Song)) {
                win.error("Wrong song object");
                return;
            }

            var previewModel = new App.Model.Preview({
                plaintext: song.get('text')
            });

            this.Preview_r.show(new App.View.Preview({
                model: previewModel
            }));

        },

        search: function (search_string) {

            var that = this;

            App.Database.search(search_string).then(function (loadedSongs) {

                win.log(JSON.stringify(loadedSongs));

                var songCollection = new App.Model.SongCollection(loadedSongs);

                var songCollectionView = new App.View.SongCollection({
                    collection: songCollection,
                    childView: App.View.SongEditor.Song,
                });

                that.SongList_r.show(songCollectionView);

            });

        },

        loadSongs: function (author) {

            if (!(author instanceof App.Model.Author)) {

                win.error("Wrong author object");
                return;
            }

            var that = this;

            author.getSongs().then(function (loadedSongs) {

                //win.log(JSON.stringify(loadedSongs));

                var songCollection = new App.Model.SongCollection(loadedSongs);

                var songCollectionView = new App.View.SongCollection({
                    collection: songCollection,
                    childView: App.View.SongEditor.Song,
                });

                that.SongList_r.show(songCollectionView);

            });

        },

        onRender: function () {

            var that = this;

            //App.Database.convert();

            App.Database.loadAuthors().then(function (loadedAuthors) {

                var authorCollection = new App.Model.AuthorCollection(loadedAuthors);

                var authorCollectionView = new App.View.AuthorCollection({
                    collection: authorCollection,
                });

                that.AuthorsList_r.show(authorCollectionView);


            });
        },

        onShow: function () {

            $('#churchservice-control').hide();
            this.TopToolbar_r.show(new App.View.ChurchService.SongBaseToolbar());


        },


        closeSongbase: function () {

            win.log("songbase close button click");
            App.vent.trigger('churchservice:songbase:close');

        },

    });

    App.View.SongEditor.SongBase = SongeditorSongbase;

}(window.App));