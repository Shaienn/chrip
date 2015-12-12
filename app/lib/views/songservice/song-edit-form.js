/**
 * Created by shaienn on 29.09.15.
 */

(function (App) {
    'use strict';

    App.View.SongSettingsModal = Backbone.Modal.extend({
        id: 'song-settings-modal',
        template: '#song-settings-modal-tpl',
        events: {
            'click #cancel-btn': 'cancelBtnHandler',
        },
        initialize: function (options) {

            if (options.song != "undefined") {
                this.song = options.song;
            }
        },
        beforeCancel: function () {

            /* It prevents close modal when we click outside */

            return false;
        },
        onShow: function () {

        },
        cancelBtnHandler: function () {
            this.cancel();
        },
        cancel: function () {
            this.destroy();
        }


    });

    App.View.SongDeleteModal = Backbone.Modal.extend({
        template: '#song-delete-modal-tpl',
        events: {
            'click #delete-btn': 'deleteBtnHandler',
            'click #cancel-btn': 'cancelBtnHandler',
        },
        serializeData: function () {
            return {
                "name": this.song.get('name')
            }
        },
        initialize: function (options) {

            if (options.song != "undefined") {
                this.song = options.song;
            }

            if (options.songbase != "undefined") {
                this.songbase = options.songbase;
            }

            if (options.author != "undefined") {
                this.author = options.author;
            }

        },
        onDestroy: function () {
            console.log('close');
        },
        beforeCancel: function () {

            /* It prevents close modal when we click outside */

            return false;
        },
        deleteBtnHandler: function () {

            win.log("delete");

            /* Delete authorname to db */

            App.Database.deleteSong(this.song);

            this.songbase.loadSongsLoader();

            var that = this;

            App.Database.close()
                    .then(function () {
                        App.Database.init().then(function () {

                            that.songbase.selectAuthor(that.author);

                        });
                    });

            this.cancel();

        },
        cancelBtnHandler: function () {
            this.cancel();
        },
        cancel: function () {
            win.log("cancel");
            this.destroy();
        }

    });

    App.View.SongEditForm = Backbone.Modal.extend({
        id: 'song-modal',
        template: '#song-edit-modal-tpl',
        slide_pattern: /\{(?:sos|start_of_slide)\}([\w\s\W\S]+?)\{(?:eos|end_of_slide)\}/g,
        song_parts_patterns: {
            chorus: {
                name: "chorus",
                pattern: /\{(?:soc|start_of_chorus)\}([\w\s\W\S]+?)\{(?:eoc|end_of_chorus)\}/
            },
            bridge: {
                name: "bridge",
                pattern: /\{(?:sob|start_of_bridge)\}([\w\s\W\S]+?)\{(?:eob|end_of_bridge)\}/
            },
            verse: {
                name: "verse",
                pattern: /([\w\s\W\S]+)/
            }
        },
        collection_view: null,
        ui: {
            songMeta: "#song-meta",
            songPartsList: "#song-parts-list",
            songPartDetails: '#songpart-details',
            songPartPreview: '#songpart-preview'
        },
        events: {
            'click #save-btn': 'saveBtnHandler',
            'click #cancel-btn': 'cancelBtnHandler',
        },
        initialize: function (options) {

            if (options.song != "undefined") {
                this.song = options.song;
            }

            if (options.songbase != "undefined") {
                this.songbase = options.songbase;
            }

            if (options.authors != "undefined") {
                this.authors = options.authors;
            }

            App.vent.on("modal:show_songpart", _.bind(this.showSongpartDetails, this));
            App.vent.on("modal:remove_songpart", _.bind(this.removeSongpart, this));

        },
        onShow: function () {

            var songPartCollection = this.getSongPartsCollection(this.song);

            this.collection_view = new App.View.SongPartCollection({
                collection: songPartCollection,
                childView: App.View.SongPart,
            });

            this.collection_view.render();
            $(this.ui.songPartsList).append(this.collection_view.el);

            var song_meta_template = _.template($('#song-meta-tpl').html());
            $(this.ui.songMeta).html(song_meta_template({
                authors: this.authors,
                song: this.song,
            }));


        },
        onDestroy: function () {
            App.vent.off("modal:show_songpart");
            App.vent.off("modal:remove_songpart");
        },
        /**********************************************/

        removeSongpart: function (songpart) {
            console.log("remove");
            this.collection_view.collection.remove(songpart);
            $(this.ui.songPartDetails).html("");
        },
        showSongpartDetails: function (songpart) {
            console.log("show details");
            var details_template = _.template($('#songpart-details-tpl').html());
            var details = $(this.ui.songPartDetails);
            details.html(details_template({
                types: this.song_parts_patterns,
                songpart: songpart,
            }));

            var input = details.find("textarea");
            var preview = details.find(".songpart-preview .slide-item");

            var slide_template = _.template($('#slide-tpl').html());
            var screen_bounds = ((Settings.Utils.getScreens())[Settings.presentation_monitor]).bounds;

            input.on("change keyup paste", function () {

                /* convert strings to slide representation */

                var text = $(this).val();

                /* Append some rules */

                var lines = text.split("\n");
                var corrected_text = "";

                for (var s in lines) {
                    var one_line_text = lines[s].trim();
                    corrected_text += one_line_text.charAt(0).toUpperCase() + one_line_text.slice(1) + '\n';
                }

                var preparedText = corrected_text.trim().replace(/\r\n|\n/g, "<br>");
                songpart.set('text', corrected_text.trim());
                songpart.set('text_visual', preparedText);

                preview.html(slide_template({
                    number: 0,
                    background: Settings.background,
                    height: screen_bounds.height,
                    width: screen_bounds.width,
                    text: preparedText
                }));

                var text_span = preview.find('.slide_text span');
                text_span.hide();
                preview.find('img').load(function () {
                    text_span.show();
                    text_span.bigText();
                });
            });

            input.trigger("change");

        },
        getSongPartsCollection: function (song) {
            /* {sos} ... {eos} */

            var res;
            var songPartCollection = new App.Model.SongPartCollection();

            while ((res = this.slide_pattern.exec(song.get('text'))) != null) {

                var raw_text = res[1].trim();

                for (var p in this.song_parts_patterns) {
                    var pattern = this.song_parts_patterns[p].pattern;
                    var part = pattern.exec(raw_text);

                    if (part == null) {
                        continue;
                    }

                    var songPart = new App.Model.SongPart();
                    var part_text = part[1].trim();

                    songPart.set('type', p);
                    songPart.set('type_visual', this.song_parts_patterns[p].name);
                    songPart.set('text', part_text);
                    songPart.set('text_visual', part_text.replace(/\r\n|\n/g, "<br>"));

                    /* Add to collection */

                    songPartCollection.add(songPart);
                }

            }

            return songPartCollection;

        },
        beforeCancel: function () {

            /* It prevents close modal when we click outside */

            return false;
        },
        saveBtnHandler: function () {

            win.log("save");


            var text = $(this.ui.textarea).val();
            var name = $(this.ui.Input).val();

            if (text == "") {
                return;
            }

            if (name == "") {
                return;
            }

            var author_key = $('.authors_selector option:selected').val();
            var author = this.authors.models[author_key];

            this.song.set('text', text);
            this.song.set('name', name);
            this.song.set('aid', author.attributes.aid);
            this.song.set('gaid', author.attributes.gaid);


            App.Database.saveSong(this.song);

            this.songbase.loadSongsLoader();

            var that = this;

            App.Database.close()
                    .then(function () {
                        App.Database.init().then(function () {

                            that.songbase.selectAuthor(author);

                        });
                    });

            this.cancel();
        },
        cancelBtnHandler: function () {
            this.cancel();
        },
        cancel: function () {
            win.log("cancel");
            this.destroy();
        }

    });


})(window.App);
