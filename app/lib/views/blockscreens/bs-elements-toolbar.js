/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {

    'use strict'

    App.View.BlockScreens.Elements.ToolBar = Backbone.Marionette.ItemView.extend({
	template: '#bs-elements-toolbar-tpl',
	className: 'row',
	ui: {
	    editBtn: '#bs-edit-element-btn',
	},
	events: {
	    'click #bs-open-element-btn': 'openBsElementFile',
	    'click #bs-add-element-btn': 'createBsElement',
	    'click @ui.editBtn': 'editBtnHandler'
	},
	openBsElementFile: function () {
	    App.vent.trigger('blockscreens:openElement');
	},
	createBsElement: function () {
	    App.vent.trigger('blockscreens:createElement');
	},
	editBtnHandler: function () {
	    App.vent.trigger('blockscreens:editElement');
	},
    });
})(window.App);
