/**
 * Created by shaienn on 02.09.15.
 */

(function (App) {
    'use strict';

    var ChurchServiceSongbase = Backbone.Marionette.LayoutView.extend({
        template: '#churchservice-songbase-tpl',
        className: 'churchservice-songbase-contain',
        ui: {
            A_Loader: '#songBaseAuthorsList .area .loader',
            S_Loader: '#songBaseSongsList .area .loader'
        },
        regions: {
            TopToolbar_r: '#songBaseToolbar',
            AuthorsList_r: '#songBaseAuthorsList .area .authors',
            AuthorsListControl_r: '#songBaseAuthorsList .control',
            SongList_r: '#songBaseSongsList .area .songs',
            SongListControl_r: '#songBaseSongsList .control',
            PlayList_r: '#songBasePlayList',
            Preview_r: '#songBaseSongPreview',
            modals: {
                selector: '#songBaseModal',
                regionClass: Backbone.Marionette.Modals
            }
        },
        events: {
            'click .close-icon': 'closeSongbase',
            'click #authorslist-add-btn': 'openAddAuthorWindow',
            'click #authorslist-remove-btn': 'openRemoveAuthorWindow',
            'click #authorslist-edit-btn': 'openEditAuthorWindow',
            'click #songslist-add-btn': 'openAddSongWindow',
            'click #songslist-remove-btn': 'openRemoveSongWindow',
            'click #songslist-edit-btn': 'openEditSongWindow'
        },
        loadedAuthors: [],
        selectedAuthor: {},
        selectedSong: {},
        initialize: function () {

            App.vent.on("songbase:loadsongs", _.bind(this.loadSongs, this));
            App.vent.on("churchservice:songbase:loadtext", _.bind(this.loadText, this));
            App.vent.on("songbase:search", _.bind(this.search, this));
            App.vent.on("songbase:selectAuthor", _.bind(this.selectAuthor, this));

        },
        onDestroy: function () {

            win.log("songbase destroy request");
            $('#churchservice-control').show();
            $('#appmode-menu').show();
            $('#main-window-toptoolbar').show();
            $('#header').removeClass('header-shadow');

            App.vent.off("songbase:loadsongs");
            App.vent.off("churchservice:songbase:loadtext");
            App.vent.off("songbase:selectAuthor");
            App.vent.off("songbase:search");
        },
        loadText: function (song) {

            if (!(song instanceof App.Model.Song)) {
                win.error("Wrong song object");
                return;
            }

            this.selectedSong = song;

            /* Clear song text */

            var preview_text = "";
            var res;

            while ((res = App.Config.slide_part.pattern.exec(song.get('text'))) != null) {

                var raw_text = res[1];

                for (var p in App.Config.song_parts_patterns) {

                    var part_pattern = App.Config.song_parts_patterns[p].pattern;
                    var part = part_pattern.exec(raw_text);

                    if (part == null) {
                        continue;
                    }

                    var songPart = new App.Model.SongPart();
                    var part_text = part[1].trim();

                    /* remove chords */

                    var pure_text = part_text.replace(App.Config.chord_pattern, "");
                    preview_text += pure_text;

                    break;
                }

                preview_text += require('os').EOL + require('os').EOL;

            }

            var previewModel = new App.Model.Preview({
                plaintext: preview_text
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
                    childView: App.View.ChurchService.Song,
                });

                that.SongList_r.show(songCollectionView);

            });

        },
        openAddAuthorWindow: function () {

            var form = new App.View.AuthorEditForm({
                author: new App.Model.Author(),
                songbase: this
            });

            this.modals.show(form);

        },
        openEditAuthorWindow: function () {

            if ($('#authorslist-edit-btn').hasClass('passive')) {
                return;
            }

            /* Get selected author */

            if (this.selectedAuthor == "undefined") {
                win.log("Select author first");
                return;
            }

            var form = new App.View.AuthorEditForm({
                author: this.selectedAuthor,
                songbase: this
            });

            this.modals.show(form);

        },
        openRemoveAuthorWindow: function () {

            if ($('#authorslist-remove-btn').hasClass('passive')) {
                return;
            }

            var form = new App.View.AuthorDeleteModal({
                author: this.selectedAuthor,
                songbase: this
            });

            this.modals.show(form);
        },
        openAddSongWindow: function () {

            var form = new App.View.SongEditForm({
                song: new App.Model.Song(),
                authors: this.loadedAuthors,
                songbase: this
            });

            this.modals.show(form);

        },
        openEditSongWindow: function () {

            var form = new App.View.SongEditForm({
                song: this.selectedSong,
                authors: this.loadedAuthors,
                songbase: this
            });

            this.modals.show(form);

        },
        openRemoveSongWindow: function () {

            if ($('#songslist-remove-btn').hasClass('passive')) {
                return;
            }

            var form = new App.View.SongDeleteModal({
                author: this.selectedAuthor,
                song: this.selectedSong,
                songbase: this
            });

            this.modals.show(form);
        },
        loadSongsLoader: function () {
            this.ui.S_Loader.show();
        },
        loadSongs: function (author) {

            this.loadSongsLoader();

            /* Assign buttons */

            switch (author.get('db')) {

                case('1'):

                    console.log("Global");
                    $('#authorslist-edit-btn').addClass('passive');
                    $('#authorslist-remove-btn').addClass('passive');

                    break;
                case('2'):

                    console.log("Local");
                    $('#authorslist-edit-btn').removeClass('passive');
                    $('#authorslist-remove-btn').removeClass('passive');

                    break;
                default:

                    console.log("Undefined");
                    $('#authorslist-edit-btn').addClass('passive');
                    $('#authorslist-remove-btn').addClass('passive');
            }

            /* Save selected author */

            this.selectedAuthor = author;

            var that = this;

            author.getSongs().then(function (loadedSongs) {

                //win.log(JSON.stringify(loadedSongs));

                var songCollection = new App.Model.SongCollection(loadedSongs);

                var songCollectionView = new App.View.SongCollection({
                    collection: songCollection,
                    childView: App.View.ChurchService.Song,
                });

                that.SongList_r.show(songCollectionView);
                that.ui.S_Loader.hide();
            });

        },
        onRender: function () {

            console.log("songbase render");

            //App.Database.convert();
            //
            //return;


        },
        loadAuthorsLoader: function () {
            this.ui.A_Loader.show();
        },
        selectAuthor: function (author) {

            var aid = author.get('aid');

            if (aid == "undefined") {
                return;
            }

            var authors_list = $('.authors ul');
            authors_list.find('li').removeClass('active');
            var item = authors_list.find('.authorItem[aid=' + aid + ']');
            item.trigger('click');
            item.parents('.item').addClass('active');
            authors_list.scrollTop(0).scrollTop(item.position().top);
        },
        loadAuthors: function () {

            this.loadAuthorsLoader();
            var that = this;

            App.Database.loadAuthors().then(function (loadedAuthors) {
                var authorCollection = new App.Model.AuthorCollection(loadedAuthors);
                var authorCollectionView = new App.View.AuthorCollection({
                    collection: authorCollection,
                });

                that.loadedAuthors = authorCollection;
                that.AuthorsList_r.show(authorCollectionView);
                that.ui.A_Loader.hide();
            });
        },
        onShow: function () {
            win.log("show songbase");

            this.loadAuthors();
            $('#header').addClass('header-shadow');
            $('#churchservice-control').hide();
            $('#appmode-menu').hide();
            $('#main-window-toptoolbar').hide();

            this.PlayList_r.show(new App.View.PlayListCollection({
                childView: App.View.PlayListSongBase,
                collection: App.Model.PlayListCollection,
            }));

            this.TopToolbar_r.show(new App.View.ChurchService.SongBaseToolbar());
        },
        closeSongbase: function () {
            App.vent.trigger('churchservice:songbase:close');
        },
    });

    App.View.ChurchService.SongBase = ChurchServiceSongbase;

}(window.App));
