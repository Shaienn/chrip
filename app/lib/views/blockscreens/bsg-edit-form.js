/**
 * Created by shaienn on 28.09.15.
 */

(function (App) {
    'use strict';

    App.View.BlockScreenGroupDeleteModal = Backbone.Modal.extend({
	id: 'author-modal',
	template: '#author-delete-modal-tpl',
	events: {
	    'click #delete-btn': 'deleteBtnHandler',
	    'click #cancel-btn': 'cancelBtnHandler',
	},
	serializeData: function () {
	    return {
		"name": this.author.get('name')
	    }
	},
	initialize: function (options) {

	    if (options.author != "undefined") {
		this.author = options.author;
	    }

	    if (options.songbase != "undefined") {
		this.songbase = options.songbase;
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

	    App.Database.deleteAuthor(this.author);
	    this.songbase.loadAuthors();
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


    var self;
    App.View.BlockScreens.Groups.EditForm = Backbone.Modal.extend({
	id: 'bsg-modal',
	template: '#bsg-edit-modal-tpl',
	lock: false,
	ui: {
	    Input: '#bsg-name-input',
	},
	events: {
	    'click #save-btn': 'saveBtnHandler',
	    'click #cancel-btn': 'cancelBtnHandler',
	},
	initialize: function (options) {

	    if (typeof options.bsg != "undefined") {
		this.bsg = options.bsg;
	    }

	    if (typeof options.blockscreens != "undefined") {
		this.blockscreens = options.blockscreens;
	    }

	},
	onShow: function () {
	    self = this;
	    if (typeof this.bsg != "undefined") {
		var name = this.bsg.get('name');
		$(this.ui.Input).val(name);
	    }
	    $(App.ControlWindow.window.document).on('keydown', this.key_map);
	    $(this.ui.Input).focus();
	},
	key_map: function (event) {
	    var key = event.which;

	    /* Enter is OK */
	    /* ESC is Cancel */

	    switch (key) {
		case (13):
		    self.saveBtnHandler();
		    break;
		case (27):
		    self.cancel();
		    break;
	    }

	},
	onDestroy: function () {
	    $(App.ControlWindow.window.document).off('keydown', this.key_map);
	},
	beforeCancel: function () {

	    /* It prevents close modal when we click outside */

	    return false;
	},
	saveBtnHandler: function () {

	    if (self.lock)
		return;

	    self.lock = true;
	    var name = $(this.ui.Input).val();

	    if (name == "") {
		self.lock = false;
		return;
	    }

	    this.bsg.set('name', name);

	    /* Save bsg to db */

	    self.blockscreens.show_bsg_loader();
	    App.Database.saveBlockScreenGroup(this.bsg)
		    .then(function () {
			self.blockscreens.load_bs_groups();
			self.cancel();
		    });
	},
	cancelBtnHandler: function () {
	    this.cancel();
	},
	cancel: function () {
	    this.destroy();
	}
    });



})(window.App);


