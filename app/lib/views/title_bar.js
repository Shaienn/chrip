(function (App) {
    'use strict';

    App.View.TitleBar = Backbone.Marionette.ItemView.extend({
	template: '#header-tpl',
	className: "col-lg-12",
	events: {
	    'click #application-close-btn': 'closeWindow',
	},
	initialize: function () {
	    this.nativeWindow = require('nw.gui').Window.get();
	},
	closeWindow: function () {
	    this.nativeWindow.close();
	},
    });

})(window.App);
