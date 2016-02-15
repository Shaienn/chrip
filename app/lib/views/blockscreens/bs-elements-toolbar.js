/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {

    'use strict'

    App.View.BlockScreens.Elements.ToolBar = Backbone.Marionette.ItemView.extend({
	template: '#bs-elements-toolbar-tpl',
	className: 'bs-elements-toolbar',
	events: {
	    'click #bs-open-bs-element-btn': 'openBsElementFile',
	    'click #bs-add-bs-element-btn': 'createBsElement'
	},
	openBsElementFile: function () {
	    App.vent.trigger('blockscreens:elements:openElement');
	},
	createBsElement: function () {
	    App.vent.trigger('blockscreens:elements:addElement');
	}
    });

})(window.App);
