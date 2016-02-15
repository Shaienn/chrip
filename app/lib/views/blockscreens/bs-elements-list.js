/**
 * Created by shaienn on 06.09.15.
 */

(function (App) {
    'use strict';

    App.View.BlockScreens.Elements.Element = Backbone.Marionette.ItemView.extend({
	tagName: 'li',
	className: 'bs-element-item',
	template: "#bs-element-tpl",
	initialize: function () {
	    console.log("initialize bs item", this.model);
	},
    });

    App.View.BlockScreens.Elements.List = Marionette.CollectionView.extend({
	tagName: 'ul',
	className: 'bs-elements-list',
	childView: App.View.BlockScreens.Element,
	initialize: function () {
	    this.listenTo(App.vent, "resize", _.bind(this.redrawSlides, this));
	},
	redrawSlides: function () {
	    var gridSize = 100 / Math.ceil(Math.sqrt(this.collection.length));
	    var slideItem = $('.bs-elements-list .bs-element-item');
	    slideItem.css("width", gridSize + "%");
	    slideItem.css("height", gridSize + "%");
	},
	onShow: function () {
	    this.redrawSlides();
	},
    });




})(window.App);
