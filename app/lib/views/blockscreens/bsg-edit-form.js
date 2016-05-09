/**
 * Created by shaienn on 28.09.15.
 */

(function (App) {
    'use strict';

    App.View.BlockScreens.Groups.RemoveForm = App.View.Common.Forms.SimpleForm.extend({
	template: '#remove-form-tpl',
	init: function (options) {
	    if (typeof options.bsg != "undefined") {
		this.bsg = options.bsg;
	    }
	    if (typeof options.blockscreens != "undefined") {
		this.blockscreens = options.blockscreens;
	    }
	},
	actions: function () {
	    //App.Database.deleteAuthor(this.author);
	    //this.songbase.loadAuthors();
	    return true;
	},
    });

    App.View.BlockScreens.Groups.EditForm = App.View.Common.Forms.SimpleForm.extend({
	id: 'bsg-modal',
	template: '#bsg-edit-modal-tpl',
	ui: {
	    Input: '#bsg-name-input',
	},
	init: function (options) {
	    if (typeof options.bsg != "undefined") {
		this.bsg = options.bsg;
	    }
	    if (typeof options.blockscreens != "undefined") {
		this.blockscreens = options.blockscreens;
	    }
	},
	show: function () {
	    if (typeof this.bsg != "undefined") {
		var name = this.bsg.get('name');
		$(this.ui.Input).val(name);
	    }
	    $(this.ui.Input).focus();
	},
	actions: function () {

	    var name = $(this.ui.Input).val();
	    if (name == "") {
		return false;
	    }

	    this.bsg.set('name', name);

	    /* Save bsg to db */

	    var self = this;
	    self.blockscreens.show_bsg_loader();
	    App.Database.saveBlockScreenGroup(this.bsg)
		    .then(function () {
			self.blockscreens.load_bs_groups();
			self.cancel();
		    });
	    return true;
	},
    });



})(window.App);


