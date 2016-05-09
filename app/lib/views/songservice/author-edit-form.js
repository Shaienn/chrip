/**
 * Created by shaienn on 28.09.15.
 */

(function (App) {
    'use strict';
    App.View.SongService.Authors.EditForm = App.View.Common.Forms.SimpleForm.extend({
	id: 'author-modal',
	template: '#author-edit-modal-tpl',
	ui: {
	    Input: '#author-name-input',
	},
	init: function (options) {
	    if (typeof options.author !== "undefined") {
		this.author = options.author;
	    }

	    if (typeof options.songbase !== "undefined") {
		this.songbase = options.songbase;
	    }
	},
	show: function () {
	    if (typeof this.author !== "undefined") {
		var name = this.author.get('name');
		$(this.ui.Input).val(name);
	    }
	    $(this.ui.Input).focus();
	},
	actions: function () {
	    var name = $(this.ui.Input).val();
	    if (name == "") {
		return false;
	    }

	    this.author.set('name', name);

	    /* Save authorname to db */

	    var self = this;
	    App.Database.saveAuthor(this.author);
	    self.songbase.loadAuthorsLoader(true);
	    App.Database.close()
		    .then(function () {
			App.Database.init().then(function () {
			    self.songbase.loadAuthors();
			});
		    });
	    return true;
	}
    });
})(window.App);


