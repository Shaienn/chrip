(function (App) {

    'use strict'

    App.View.BlockScreens.Elements.ToolBar = Backbone.Marionette.ItemView.extend({
	template: '#bs-elements-toolbar-tpl',
	className: 'row',
	ui: {
	    editBtn: '#bs-edit-element-btn',
	    removeBtn: '#bs-remove-element-btn',
	    openBtn: '#bs-open-element-btn',
	    addBtn: '#bs-add-element-btn'
	},
	events: {
	    'click @ui.openBtn': 'openBsElementFile',
	    'click @ui.addBtn': 'createBsElement',
	    'click @ui.removeBtn': 'removeBtnHandler',
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
	removeBtnHandler: function () {
	    App.vent.trigger('blockscreens:removeElement');
	},
    });
})(window.App);
