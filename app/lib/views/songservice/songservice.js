/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';

    var _this;
    App.View.SongService.Root = Backbone.Marionette.LayoutView.extend({
	template: '#songservice-tpl',
	id: 'songservice-main-window',
	regions: {
	    Control_r: "#songservice-control",
	    Settings_r: "#songservice-settings",
	    Songbase_r: "#songservice-songbase"
	},
	initialize: function () {

	    _this = this;

	    _.each(_this.regionManager._regions, function (element, index) {

		element.on('show', function (view) {
		    if (view.className && App.ViewStack[0] !== view.className) {
			App.ViewStack.push(view.className);
		    }
		    App.vent.trigger('viewstack:push', view.className);
		});

		/**
		 * Marionette 2.x changed close to destroy, and doesn't pass along a view anymore.
		 * TODO: Find better solution
		 */
		element.on('destroy', function (view) {

		    if (typeof view === 'undefined' && element.currentView !== null) {
			view = element.currentView;
		    }

		    var viewName = (typeof view !== 'undefined' ? view.className : 'unknown');

		    App.ViewStack.pop();
		    App.vent.trigger('viewstack:pop', viewName);

		    if (typeof element.currentView !== 'undefined') {
			element.currentView.destroy();
		    }

		    if (!App.ViewStack[0]) {
			App.ViewStack = ['songservice-main-window'];
		    }
		});

	    });

	    this.nativeWindow = require('nw.gui').Window.get();

	    /* Assign events */

	    this.listenTo(App.vent, 'songservice:show_songbase', _.bind(this.showSongbase, this));
	    this.listenTo(App.vent, 'songservice:close_songbase', _.bind(this.closeSongbase, this));

	},
	onShow: function () {
	    this.showControl();
	},
	/************ Regions part ************/

	showControl: function () {
	    win.log("show control request");
	    this.Control_r.show(new App.View.SongService.Control);
	},
	showSongbase: function () {
	    App.vent.trigger('songservice:control:offEvent');
	    this.Songbase_r.show(new App.View.SongService.SongBase);
	},
	closeSongbase: function () {
	    this.Songbase_r.destroy();
	    App.vent.trigger('songservice:control:onEvent');
	},
    });



}(window.App));
