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

	    if (typeof options.song != "undefined") {
		this.song = options.song;
	    }
	},
	beforeCancel: function () {

	    /* It prevents close modal when we click outside */

	    return false;
	},
	cancelBtnHandler: function () {
	    this.cancel();
	},
	cancel: function () {
	    this.destroy();
	}
    });

    App.View.SongService.Songs.RemoveForm = App.View.Common.Forms.SimpleForm.extend({
	template: '#remove-form-tpl',
	init: function (options) {

	    if (typeof options.song !== "undefined") {
		this.song = options.song;
	    }

	    if (typeof options.songbase !== "undefined") {
		this.songbase = options.songbase;
	    }

	    if (typeof options.author !== "undefined") {
		this.author = options.author;
	    }

	    this.text = "Вы уверены что хотите удалить песню: " + this.song.get('name');
	},
	actions: function () {
	    this.songbase.loadSongsLoader();
	    var self = this;
	    App.Database.deleteSong(this.song).then(
		    function () {
			App.Database.close().then(
				function () {
				    App.Database.init().then(
					    function () {
						self.selectedSong = null;
						self.songbase.selectAuthor(self.author);
					    });
				});
		    });
	    return true;
	},
	serializeData: function () {
	    return {
		"text": this.text
	    }
	},
    });

})(window.App);
