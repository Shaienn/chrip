(function (App) {
    'use strict';
    App.View.Common.Forms.RemoveForm = Backbone.Modal.extend({
	template: '#remove-form-tpl',
	text: null,
	events: {
	    'click #delete-btn': 'deleteBtnHandler',
	    'click #cancel-btn': 'cancelBtnHandler',
	},
	serializeData: function () {
	    return {
		"text": this.text
	    }
	},
	initialize: function (options) {
	    this.initial(options);
	    if (this.text === null) {
		console.log("Text should be provided by child view");
	    }
	},
	beforeCancel: function () {
	    /* It prevents close modal when we click outside */
	    return false;
	},
	deleteBtnHandler: function () {
	    this.deleteActions();
	    this.cancel();
	},
	cancelBtnHandler: function () {
	    this.cancel();
	},
	cancel: function () {
	    this.destroy();
	},
	/* Should be overrided on child view*/

	initial: function (options) {},
	deleteActions: function () {},
    });
})(window.App);