/**
 * Created by shaienn on 29.09.15.
 */

(function (App) {
    'use strict';

    var self;
    App.View.SongService.Songs.EditForm = Backbone.Modal.extend({
	id: 'song-modal',
	template: '#song-edit-modal-tpl',
	lock: false,
	collection_view: null,
	chords_preview_mode: false,
	ui: {
	    songMeta: "#song-meta",
	    songPartsList: "#song-parts-list",
	    songPartDetails: '#songpart-details',
	    songPartPreview: '#songpart-preview'
	},
	events: {
	    'click #add-slide-btn': 'addSongPartHandler',
	    'click #save-btn': 'saveBtnHandler',
	    'click #cancel-btn': 'cancelBtnHandler',
	    'click #slide-preview-btn': 'slidePreviewHandler',
	    'click #chords-preview-btn': 'chordsPreviewHandler'
	},
	initialize: function (options) {

	    if (typeof options.song != "undefined") {
		this.song = options.song;
	    }

	    if (typeof options.songbase != "undefined") {
		this.songbase = options.songbase;
	    }

	    if (typeof options.control != "undefined") {
		this.control = options.control;
	    }

	    if (typeof options.authors != "undefined") {
		this.authors = options.authors;
	    }

	    this.listenTo(App.vent, "modal:show_songpart", _.bind(this.showSongpartDetails, this));
	    this.listenTo(App.vent, "modal:remove_songpart", _.bind(this.removeSongpart, this));

	    if (typeof this.control != "undefined") {

		/* Restore keydown events in parent window */

		this.control.offEvent();
	    }



	},
	onShow: function () {
	    self = this;
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
	/**********************************************/

	slidePreviewHandler: function () {
	    win.log("slidePreviewHandler");
	    self.chords_preview_mode = false;
	    $('#slide-preview-btn').addClass('active');
	    $('#chords-preview-btn').removeClass('active');
	    var details = $(this.ui.songPartDetails);
	    var input = details.find("textarea");
	    input.trigger("change");
	},
	chordsPreviewHandler: function () {
	    win.log("chordsPreviewHandler");
	    self.chords_preview_mode = true;
	    $('#slide-preview-btn').removeClass('active');
	    $('#chords-preview-btn').addClass('active');
	    var details = $(this.ui.songPartDetails);
	    var input = details.find("textarea");
	    input.trigger("change");
	},
	addSongPartHandler: function () {
	    win.log("Add song part handler");
	    var new_part = new App.Model.SongPart();
	    var default_type = "verse";
	    var default_type_index = 0;

	    for (var i in Settings.Config.song_parts_patterns) {
		if (Settings.Config.song_parts_patterns[i].name == default_type) {
		    default_type_index = i;
		}
	    }

	    new_part.set("type", default_type_index);
	    new_part.set("type_visual", default_type);

	    this.collection_view.collection.add(new_part);
	    $(this.ui.songPartDetails).html("");
	},
	removeSongpart: function (songpart) {
	    win.log("remove");
	    this.collection_view.collection.remove(songpart);
	    $(this.ui.songPartDetails).html("");
	},
	showSongpartDetails: function (songpart) {
	    win.log("show slide details");

	    var details_template = _.template($('#songpart-details-tpl').html());
	    var details = $(this.ui.songPartDetails);
	    details.html(details_template({
		types: Settings.Config.song_parts_patterns,
		songpart: songpart,
	    }));

	    var input = details.find("textarea");
	    var typeSelector = details.find(".songpart-type-selector select");
	    var preview = details.find(".songpart-preview .preview-area");

	    var slide_template = _.template($('#slide-tpl').html());
	    var screen_bounds = Settings.Utils.getPresentationScreen().bounds;

	    typeSelector.on("change", function () {

		var selected_type = $(this).val();
		var selected_type_text = $(this).find("option:selected").text();

		songpart.set('type', selected_type);
		songpart.set('type_visual', selected_type_text);

	    });

	    input.on("change keyup paste", function () {

		if (self.chords_preview_mode == false) {
		    $('#slide-preview-btn').addClass('active');
		    /* convert strings to slide representation */
		    preview.removeClass('chords-preview');
		    preview.addClass('slide-item');
		    var text = $(this).val();

		    /* Append some rules */

		    var lines = text.split("\n");
		    var corrected_text = "";

		    for (var s in lines) {
			var one_line_text = lines[s].trim();
			corrected_text += one_line_text.charAt(0).toUpperCase() + one_line_text.slice(1) + '\n';
		    }

		    var preparedText = corrected_text.trim()
			    .replace(Settings.Config.chord_pattern, "")
			    .replace(/\r\n|\n/g, "<br>");
		    songpart.set('text', corrected_text.trim());
		    songpart.set('text_visual', preparedText);

		    preview.html(slide_template({
			number: 0,
			background: Settings.SongserviceSettings.background,
			height: screen_bounds.height,
			width: screen_bounds.width,
			text: preparedText,
			font: Settings.SongserviceSettings.font_family
		    }));

		    var text_span = preview.find('.slide_text span');
		    text_span.hide();
		    preview.find('img').load(function () {
			text_span.show();
			text_span.bigText();
		    });
		} else {
		    /* convert strings to chords representation */
		    $('#chords-preview-btn').addClass('active');
		    preview.addClass('chords-preview');
		    preview.removeClass('slide-item');
		    var text = $(this).val();
		    text = text.trim();

		    var re = /(\[[\w\/#1-9\-+]+\])/g
		    var eol = /\r?\n/

		    var preview_html = "";
		    text.split(eol).map(
			    function (line) {

				var chord_line = "";
				var text_line = "";
				var chord = null;
				var chord_cursor_pos = 0;
				while ((chord = re.exec(line)) != null) {

				    var clear_chord
					    = chord[0].replace(/[\[\]]/g, "");

				    var str = new Array(chord.index - chord_cursor_pos).join(" ");
				    chord_cursor_pos = chord.index + clear_chord.length;
				    chord_line += "<span class='chord'>" + str + clear_chord + "</span>";
				}

				text_line = line.replace(re, "");

				preview_html += chord_line;
				preview_html += '\r\n';
				preview_html += text_line;
				preview_html += '\r\n';
			    }
		    );

		    preview.html(preview_html);
		}


	    });

	    input.trigger("change");
	},
	getSongPartsCollection: function (song) {
	    /* {sos} ... {eos} */

	    var res;
	    var songPartCollection = new App.Model.SongPartCollection();

	    while ((res = Settings.Config.slide_part.pattern.exec(song.get('text'))) != null) {

		var raw_text = res[1].trim();

		for (var p in Settings.Config.song_parts_patterns) {

		    var part_pattern = Settings.Config.song_parts_patterns[p].pattern;
		    var part = part_pattern.exec(raw_text);

		    if (part == null) {
			continue;
		    }

		    var songPart = new App.Model.SongPart();
		    var part_text = part[1].trim();

		    songPart.set('type', p);
		    songPart.set('type_visual', Settings.Config.song_parts_patterns[p].name);
		    songPart.set('text', part_text);
		    songPart.set('text_visual', part_text.
			    replace(Settings.Config.chord_pattern, "").
			    replace(/\r\n|\n/g, "<br>"));

		    /* Add to collection */

		    songPartCollection.add(songPart);
		    break;
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

	    var song_name = $(this.ui.songMeta).find(".song-name-input input").val();
	    if (song_name == "") {
		win.info("Song name should contain something");
		return;
	    }

	    if (this.lock == true)
		return;

	    this.lock = true;

	    /* Collect all slides contents */

	    var song_text = "";

	    for (var i = 0; i < this.collection_view.collection.length; i++) {

		var part = this.collection_view.collection.at(i);
		var part_wrapper = Settings.Config.song_parts_patterns[part.get('type')];

		song_text += Settings.Config.slide_part.init;
		song_text += part_wrapper.init;

		song_text += part.get('text');

		song_text += part_wrapper.end;
		song_text += Settings.Config.slide_part.end;
	    }


	    var author_key = $(this.ui.songMeta).find(".song-author-selector select").val();
	    this.author = this.authors.models[author_key];



	    this.song.set('text', song_text);
	    this.song.set('name', song_name);
	    this.song.set('uaid', this.author.attributes.uaid);
	    this.song.set('gaid', this.author.attributes.gaid);


	    /* Start waiting animation */

	    if (typeof this.songbase !== "undefined") {
		this.songbase.loadSongsLoader();
	    }

	    if (typeof this.control != "undefined") {
	    }

	    App.Database.saveSong(this.song).then(_.bind(this.closeDatabase, this));
	    this.cancel();
	},
	cancelBtnHandler: function () {
	    this.cancel();
	},
	cancel: function () {
	    if (typeof this.control != "undefined") {
		/* Restore keydown events in parent window */
		this.control.onEvent();
	    }
	    this.destroy();
	},
	closeDatabase: function () {
	    App.Database.close().then(_.bind(this.openDatabase, this));
	},
	openDatabase: function () {
	    App.Database.init().then(_.bind(this.onReloadReady, this));
	},
	onReloadReady: function () {
	    var that = this;

	    if (typeof this.songbase !== "undefined") {
		App.vent.trigger("songbase:selectAuthor", this.author);
	    }

	    if (typeof this.control !== "undefined") {
		this.song.rebuild_slides().then(function () {
		    that.control.onSongSlidesRedraw(that.song);
		});
	    }
	}
    });
})(window.App);
