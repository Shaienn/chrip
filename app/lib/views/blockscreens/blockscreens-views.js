/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';
    var s_mover_prevX = 0;
    var s_mover_prevY = 0;
    var s_mout_prevX = 0;
    var s_mout_prevY = 0;
    var that = this;
    App.View.BlockScreens.Editor.Element = Backbone.Marionette.ItemView.extend({
	tagName: 'li',
	className: 'bs-text-item',
	template: '#bs-text-itemview-tpl',
	block_opened: false,
	ui: {
	    bsSettings: ".bs-ui-element-settings",
	    bsRemove: ".remove",
	},
	modelEvents: {
	    'change': 'render'
	},
	events: {
	    'click .bs-ui-editor-item-container': 'selectPart',
	    'click .remove': 'removePart',
	    'mouseover .bs-ui-editor-item-container': 'overHandler',
	    'mouseout .bs-ui-editor-item-container': 'outHandler',
	    'mousemove .bs-ui-editor-item-container': 'moveHandler',
	    'mouseleave .bs-ui-editor-item-container': 'leaveHandler',
	},
	overHandler: function (e) {
	    if (e.pageX !== s_mover_prevX || e.pageY !== s_mover_prevY) {
		var elem = $(this.el);
		elem.removeClass('selected');
		elem.addClass('selected');
		s_mover_prevX = e.pageX;
		s_mover_prevY = e.pageY;
	    }
	},
	outHandler: function (e) {
	    if (e.pageX !== s_mout_prevX || e.pageY !== s_mout_prevY) {
		$(this.el).removeClass('selected');
		s_mout_prevX = e.pageX;
		s_mout_prevY = e.pageY;
	    }
	},
	leaveHandler: function (e) {
	    if (this.ui.bsRemove.length === 1) {
		this.ui.bsRemove.stop().animate({right: "-11%"}, {duration: 300});
		that.block_opened = false;
	    }
	},
	moveHandler: function (e) {

	    if (this.ui.bsRemove.length === 1) {
		var scene = $(this.el);
		var moveX = e.clientX - scene.offset().left;

		if (moveX > (scene.width() * 0.9) && !that.block_opened) {
		    var list = scene.closest("ul")[0];
		    var hasScrollbar = list.scrollHeight > list.clientHeight ? true : false;
		    this.ui.bsRemove.stop().animate({right: hasScrollbar ? "10px" : "0px"}, {duration: 300});
		    that.block_opened = true;
		}

		if (moveX < (scene.width() * 0.9) && that.block_opened) {
		    this.ui.bsRemove.stop().animate({right: "-11%"}, {duration: 300});
		    that.block_opened = false;
		}
	    }
	},
	onRender: function () {
	    that = this;
	    this.constructToolbar();
	},
	selectPart: function () {
	    if (this.block_opened === true) {
		return;
	    }
	    App.vent.trigger("blockscreens:modal:select_item", this.model);
	},
	removePart: function (e) {
	    e.stopPropagation();
	    App.vent.trigger("blockscreens:modal:remove_item", this.model);
	},
	constructToolbar: function () {
	    var toolbar = this.ui.bsSettings;
	    var settings = this.model.get('settings');
	    toolbar.html('');
	    switch (this.model.get('type')) {
		case ('background'):
		    var colorPicker = new ColorPicker({
			width: 100,
			height: 100
		    });

		    if (typeof (settings.color) == 'undefined') {
			settings.color = "#000000"
		    }

		    colorPicker.setColor(settings.color);
		    colorPicker.onChange(function () {
			settings.color = colorPicker.getHexString();
			App.vent.trigger("blockscreens:modal:edit_item:set_color", settings.color);
		    });

		    colorPicker.appendTo(toolbar);

		    this.model.set('settings', settings);
		    break;
		case ('text'):

		    var align_left = $('<div/>', {
			class: "bs-text-align-left-btn",
			html: '<i class="fa fa-align-left button"></i>',
			css: {
			    float: "left"
			}
		    });
		    var align_center = $('<div/>', {
			class: "bs-text-align-center-btn",
			html: '<i class="fa fa-align-center button"></i>',
			css: {
			    float: "left"
			}
		    });
		    var align_right = $('<div/>', {
			class: "bs-text-align-right-btn",
			html: '<i class="fa fa-align-right button"></i>',
			css: {
			    float: "left"
			}
		    });

		    align_left.click(function () {
			App.vent.trigger("blockscreens:modal:edit_item:set_text_align", "left");
		    });
		    align_center.click(function () {
			App.vent.trigger("blockscreens:modal:edit_item:set_text_align", "center");
		    });
		    align_right.click(function () {
			App.vent.trigger("blockscreens:modal:edit_item:set_text_align", "right");
		    });


		    var colorPicker = new ColorPicker({
			width: 100,
			height: 100
		    });


		    if (typeof (settings.color) == 'undefined') {
			settings.color = "#000000"
		    }

		    colorPicker.setColor(settings.color);
		    colorPicker.onChange(function () {
			settings.color = colorPicker.getHexString();
			App.vent.trigger("blockscreens:modal:edit_item:set_color", settings.color);
		    });

		    colorPicker.appendTo(toolbar);
		    toolbar.append(align_left);
		    toolbar.append(align_center);
		    toolbar.append(align_right);

		    this.model.set('settings', settings);

		    break;
	    }

	}

    });

    App.View.BlockScreens.Editor.List = Backbone.Marionette.CollectionView.extend({
	tagName: 'ul',
	className: 'bs_elements list',
	selectedElement: null,
	behaviors: {
	    Sortable: {
		containment: 'parent'
	    }
	},
    });
})(window.App);
