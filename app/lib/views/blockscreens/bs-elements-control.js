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
	},
	initialize: function (options) {

	    if (typeof (options.collection) !== "undefined") {
		this.collection = options.collection;
	    }

	},
	onShow: function () {
	    this.List_r.show(this.collection);
	},
    });


})(window.App);
