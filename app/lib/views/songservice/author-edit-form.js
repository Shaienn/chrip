/**
 * Created by shaienn on 28.09.15.
 */

(function (App) {
    'use strict';

    App.View.AuthorDeleteModal = App.View.Common.Forms.RemoveForm.extend({
	initial: function (options) {

	    if (typeof options.songbase !== "undefined") {
		this.songbase = options.songbase;
	    }

	    if (typeof options.author !== "undefined") {
		this.author = options.author;
	    }

	    this.text = "Вы уверены что хотите удалить автора: " + this.author.get('name');
	},
	deleteActions: function () {
	    this.songbase.loadAuthorsLoader(true);
	    var that = this;

	    App.Database.deleteAuthor(this.author).then(
		    function () {
			App.Database.close().then(
				function () {
				    App.Database.init().then(
					    function () {
						that.songbase.loadAuthors();
					    });
				});
		    });
	},
    });

    var AuthorEditForm = Backbone.Modal.extend({
	id: 'author-modal',
	template: '#author-edit-modal-tpl',
	ui: {
	    Input: '#author-name-input',
	},
	events: {
	    'click #save-btn': 'saveBtnHandler',
	    'click #cancel-btn': 'cancelBtnHandler',
	},
	initialize: function (options) {

	    if (options.author != "undefined") {
		this.author = options.author;
	    }

	    if (options.songbase != "undefined") {
		this.songbase = options.songbase;
	    }

	},
	onShow: function () {
	    if (this.author != "undefined") {
		var name = this.author.get('name');
		$(this.ui.Input).val(name);
	    }
	},
	onDestroy: function () {
	    console.log('close');
	},
	beforeCancel: function () {

	    /* It prevents close modal when we click outside */

	    return false;
	},
	saveBtnHandler: function () {

	    win.log("save");

	    var name = $(this.ui.Input).val();

	    if (name == "") {
		return;
	    }

	    this.author.set('name', name);

	    /* Save authorname to db */

	    App.Database.saveAuthor(this.author);

	    var that = this;

	    that.songbase.loadAuthorsLoader(true);

	    App.Database.close()
		    .then(function () {
			App.Database.init().then(function () {
			    that.songbase.loadAuthors();
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

    App.View.AuthorEditForm = AuthorEditForm;


})(window.App);


