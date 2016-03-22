/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {

    'use strict'

    App.View.BlockScreens.Elements.ToolBar = Backbone.Marionette.ItemView.extend({
	template: '#bs-elements-toolbar-tpl',
	className: 'row',
	events: {
	    'click #bs-open-element-btn': 'openBsElementFile',
	    'click #bs-add-element-btn': 'createBsElement'
	},
	initialize: function (options) {
	    if (typeof options.group !== "undefined") {
		this.group = options.group;
	    }
	},
	openBsElementFile: function () {
	    App.vent.trigger('blockscreens:openElement');
	},
	createBsElement: function () {
	    App.vent.trigger('blockscreens:createElement', this.group);
	}
    });

})(window.App);
