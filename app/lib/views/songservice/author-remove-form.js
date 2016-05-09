/**
 * Created by shaienn on 28.09.15.
 */

(function (App) {
    'use strict';
    App.View.SongService.Authors.RemoveForm = App.View.Common.Forms.SimpleForm.extend({
	template: '#remove-form-tpl',
	init: function (options) {
	    if (typeof options.songbase !== "undefined") {
		this.songbase = options.songbase;
	    }
	    if (typeof options.author !== "undefined") {
		this.author = options.author;
	    }
	    this.text = "Вы уверены что хотите удалить автора: " + this.author.get('name');
	},
	actions: function () {
	    this.songbase.loadAuthorsLoader(true);
	    var self = this;
	    App.Database.deleteAuthor(this.author).then(
		    function () {
			App.Database.close().then(
				function () {
				    App.Database.init().then(
					    function () {
						self.songbase.loadAuthors();
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


