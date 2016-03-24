(function (App) {
    'use strict';
    var sl_prevX = 0;
    var sl_prevY = 0;
    App.View.Common.Slides.Slide = Backbone.Marionette.ItemView.extend({
	template: "#slide-tpl",
	tagName: 'li',
	className: 'slide-preview-item',
	image_loaded: false,
	ui: {
	    image: ".slide_image",
	    text_span: ".slide_text span",
	},
	modelEvents: {
	    "change": "render"
	},
	events: {
	    'click .slide-container': 'clickHandler',
	},
	initialize: function () {
	    this.listenTo(App.vent, "resize", _.bind(this.onShow, this));
	},
	onShow: function () {
	    var that = this;
	    this.bindUIElements();
	    /* We wait first time until loading background image, 
	     * cause container dimensions for bigText() depends on it */

	    if (this.image_loaded) {
		this.ui.text_span.bigText();
		return;
	    } else {
		this.ui.text_span.hide();
		this.ui.image.load(function () {
		    that.ui.text_span.show();
		    that.ui.text_span.bigText();
		    that.image_loaded = true;
		});
	    }
	},
	clickHandler: function (e) {

	    var elem = $(this.el);
	    if (e.pageX !== sl_prevX || e.pageY !== sl_prevY) {
		$('.' + this.className + '.active').removeClass('active');
		elem.addClass('active');
		sl_prevX = e.pageX;
		sl_prevY = e.pageY;
	    }

	    this.clickReport();
	},
	clickReport: function () {},
    });
    App.View.Common.Slides.List = Marionette.CollectionView.extend({
	tagName: 'ul',
	className: 'slide-preview-list',
	slideSelector: '',
	initialize: function () {
	    this.listenTo(App.vent, "resize", _.bind(this.redrawSlides, this));
	    this.slideSelector = '.' + this.className + ' .' + this.childView.prototype.className;
	},
	redrawSlides: function () {
	    var gridSize = 100 / Math.ceil(Math.sqrt(this.collection.length));
	    $(this.slideSelector)
		    .css("width", gridSize + "%")
		    .css("height", gridSize + "%");
	},
	onShow: function () {
	    this.redrawSlides();
	    this.readyReport();
	},
	readyReport: function () {}

    });
})(window.App);


