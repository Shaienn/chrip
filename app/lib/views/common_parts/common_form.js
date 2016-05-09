(function (App) {
    'use strict';
    var __self;
    App.View.Common.Forms.SimpleForm = Backbone.Modal.extend({
	template: null,
	lock: false,
	events: {
	    'click #action-btn': 'doActionsBtnHandler',
	    'click #cancel-btn': 'cancelBtnHandler',
	},
	initialize: function (options) {
	    __self = this;
	    __self.init(options);
	    if (__self.template == null) {
		win.error("template should be redefined in child view");
	    }
	},
	beforeCancel: function () {
	    /* It prevents close modal when we click outside */
	    return false;
	},
	doActionsBtnHandler: function () {
	    console.log('doActionsBtnHandle');
	    if (this.lock === false) {
		this.lock = true;
		if (__self.actions()) {
		    __self.cancel();
		}
	    }

	    this.lock = false;
	},
	cancelBtnHandler: function () {
	    console.log("cancel handler");
	    __self.cancel();
	},
	cancel: function () {
	    console.log('cancel');
	    __self.destroy();
	},
	key_map: function (event) {
	    var key = event.which;

	    /* Enter is OK */
	    /* ESC is Cancel */

	    switch (key) {
		case (13):
		    __self.doActionsBtnHandler();
		    break;
		case (27):
		    __self.cancel();
		    break;
	    }
	},
	onShow: function () {
	    $(App.ControlWindow.window.document).on('keydown', __self.key_map);
	    if (typeof __self.show !== 'undefined') {
		__self.show();
	    }
	},
	onDestroy: function () {
	    console.log('destroy');
	    $(App.ControlWindow.window.document).off('keydown', __self.key_map);
	    if (typeof __self.destroy_actions !== 'undefined') {
		__self.destroy_actions();
	    }
	},
	/* Can be overrided on child view */

	init: function (options) {},
	show: function () {},
	destroy_actions: function () {},
	actions: function () {},
    });
})(window.App);