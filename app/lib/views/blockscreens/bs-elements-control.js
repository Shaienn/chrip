/**
 * Created by shaienn on 06.09.15.
 */

(function (App) {
    'use strict';

    App.View.BlockScreens.Elements.Control = Backbone.Marionette.LayoutView.extend({
	template: '#blockscreen-control-tpl',
	collection: null,
	regions: {
	    List_r: '#bs-elements-list',
	    ToolBar_r: "#bs-elements-toolbar",
	    modals: {
		selector: '#bsElementsModal',
		regionClass: Backbone.Marionette.Modals
	    }
	},
	initialize: function (options) {

	    if (typeof (options.collection) !== "undefined") {
		this.collection = options.collection;
	    }

	},
	onShow: function () {
	    this.List_r.show(this.collection);
	    this.ToolBar_r.show(new App.View.BlockScreens.Elements.ToolBar());
	},
    });


})(window.App);
