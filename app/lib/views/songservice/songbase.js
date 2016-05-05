/**
 * Created by shaienn on 02.09.15.
 */

(function (App) {
    'use strict';

    App.View.SongService.SongBase = Backbone.Marionette.LayoutView.extend({
	template: '#songbase-tpl',
	className: 'row',
	ui: {
	    A_Loader: '#songBaseAuthorsList .area .loader',
	    S_Loader: '#songBaseSongsList .area .loader',
	    searchInput: '.search input',
	    searchForm: '.search form',
	},
	regions: {
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
	    'click #songslist-edit-btn': 'openEditSongWindow',
	    'submit @ui.searchForm': 'search',
	},
	loadedAuthors: [],
	selectedAuthor: {},
	selectedSong: {},
	initialize: function () {
	    this.listenTo(App.vent, "songbase:loadsongs", _.bind(this.loadSongs, this));
	    this.listenTo(App.vent, "songbase:search", _.bind(this.search, this));
	    this.listenTo(App.vent, "songbase:selectAuthor", _.bind(this.selectAuthor, this));
	    this.listenTo(App.vent, "songbase:loadtext", _.bind(this.loadText, this));
	},
	onDestroy: function () {
	    $('#songservice-control').show();
	    $('#appmode-menu').show();
	    $('#main-window-toptoolbar').show();
	    $('#header').removeClass('header-shadow');
	},
	loadText: function (song) {

	    if (!(song instanceof App.Model.Song)) {
		win.error("Wrong song object");
		return;
	    }

	    /* Assign buttons */

	    switch (song.get('db')) {

		case('1'):

		    console.log("Global");
		    $('#songslist-remove-btn').addClass('disabled');

		    break;
		case('2'):

		    console.log("Local");
		    $('#songslist-remove-btn').removeClass('disabled');

		    break;
		default:

		    console.log("Undefined");
		    $('#songslist-remove-btn').addClass('disabled');
	    }
	    $('#songslist-edit-btn').removeClass('disabled');

	    this.selectedSong = song;

	    /* Clear song text */

	    var preview_text = "";
	    var res;

	    while ((res = Settings.Config.slide_part.pattern.exec(song.get('text'))) != null) {

		var raw_text = res[1];

		for (var p in Settings.Config.song_parts_patterns) {

		    var part_pattern = Settings.Config.song_parts_patterns[p].pattern;
		    var part = part_pattern.exec(raw_text);

		    if (part == null) {
			continue;
		    }

		    var part_text = part[1].trim();

		    /* remove chords */

		    var pure_text = part_text.replace(Settings.Config.chord_pattern, "");
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
	search: function (e) {
	    e.preventDefault();
	    var that = this;
	    var search_string = this.ui.searchInput.val();
	    this.ui.searchInput.blur();
	    App.Database.search(search_string).then(function (loadedSongs) {

		win.log(JSON.stringify(loadedSongs));

		var songCollection = new App.Model.SongCollection(loadedSongs);

		var songCollectionView = new App.View.SongService.Songs.List({
		    collection: songCollection
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

	    if ($('#authorslist-edit-btn').hasClass('disabled')) {
		return;
	    }

	    /* Get selected author */

	    if (typeof this.selectedAuthor == "undefined") {
		return;
	    }


	    var form = new App.View.AuthorEditForm({
		author: this.selectedAuthor,
		songbase: this
	    });

	    this.modals.show(form);

	},
	openRemoveAuthorWindow: function () {

	    if ($('#authorslist-remove-btn').hasClass('disabled')) {
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
	hideSongsLoader: function () {
	    console.log("hide loader");
	    this.ui.S_Loader.hide();
	},
	loadSongs: function (author) {

	    this.loadSongsLoader();

	    /* Assign buttons */

	    switch (author.get('db')) {

		case('1'):

		    console.log("Global");
		    $('#authorslist-remove-btn').addClass('disabled');

		    break;
		case('2'):

		    console.log("Local");
		    $('#authorslist-remove-btn').removeClass('disabled');

		    break;
		default:

		    console.log("Undefined");
		    $('#authorslist-remove-btn').addClass('disabled');
	    }
	    $('#authorslist-edit-btn').removeClass('disabled');

	    var self = this;

	    author.getSongs().then(function (loadedSongs) {

		//win.log(JSON.stringify(loadedSongs));

		var songCollection = new App.Model.SongCollection(loadedSongs);

		var songCollectionView = new App.View.SongService.Songs.List({
		    collection: songCollection,
		});

		self.SongList_r.show(songCollectionView);
		self.hideSongsLoader();
	    });

	},
	loadAuthorsLoader: function () {
	    this.ui.A_Loader.show();
	},
	hideAuthorsLoader: function () {
	    this.ui.A_Loader.hide();
	},
	selectAuthor: function (author) {

	    var uaid = author.get('uaid');
	    var gaid = author.get('gaid');

	    if (typeof uaid == "undefined" || typeof gaid == "undefined") {
		return;
	    }

	    /* Save selected author */

	    this.selectedAuthor = author;

	    var authors_list = $('.author-element-list');
	    authors_list.children('li.active').removeClass('active');
	    var item = authors_list.find('.item-container[uaid=' + uaid + '][gaid=' + gaid + ']');
	    item.trigger('click');
	    item.parent('.author-element-item').addClass('active');
	    authors_list.scrollTop(0).scrollTop(item.position().top);
	},
	loadAuthors: function () {

	    this.loadAuthorsLoader();
	    var self = this;

	    App.Database.loadAuthors().then(function (loadedAuthors) {
		var authorCollection = new App.Model.AuthorCollection(loadedAuthors);
		var authorCollectionView = new App.View.SongService.Authors.List({
		    collection: authorCollection,
		});

		self.loadedAuthors = authorCollection;
		self.AuthorsList_r.show(authorCollectionView);
		self.hideAuthorsLoader();
	    });
	},
	onShow: function () {
	    win.log("show songbase");

	    this.loadAuthors();
	    $('#header').addClass('header-shadow');
	    $('#songservice-control').hide();
	    $('#appmode-menu').hide();
	    $('#main-window-toptoolbar').hide();
	    $('#songslist-edit-btn').addClass('disabled');
	    $('#songslist-remove-btn').addClass('disabled');
	    $('#authorslist-edit-btn').addClass('disabled');
	    $('#authorslist-remove-btn').addClass('disabled');

	    this.PlayList_r.show(new App.View.SongService.PlayList.List({
		childView: App.View.PlayListSongBase,
		collection: App.Model.PlayListCollection,
	    }));

	},
	closeSongbase: function () {
	    App.vent.trigger('songservice:close_songbase');
	},
    });



}(window.App));
