/**
 * Created by shaienn on 13.09.15.
 */

(function (App) {
    'use strict'

    var AppModeMenu = Backbone.Marionette.ItemView.extend({
	template: '#appmode-menu-tpl',
	id: 'appmode-menu-container',
	className: 'col-lg-12',
	events: {
	    'click #appmode-menu-songservice-btn': 'songsBtnHandler',
	    'click #appmode-menu-bible-btn': 'bibleBtnHandler',
	    'click #appmode-menu-media-btn': 'mediaBtnHandler',
	    'click #appmode-menu-slides-btn': 'slidesBtnHandler',
	    'click #appmode-menu-settings-btn': 'settingsBtnHandler',
	},
	songsBtnHandler: function () {

	    win.log("presentation button click");
	    App.vent.trigger("appmode:switch_tab_to", "songservice");
	},
	bibleBtnHandler: function () {
	    win.log(" bible button click");
	    App.vent.trigger("appmode:switch_tab_to", "bible");
	    //App.vent.trigger("appmode:bible:show");
	},
	mediaBtnHandler: function () {

	    win.log("media button click");
	    App.vent.trigger("appmode:switch_tab_to", "media");
	    //App.vent.trigger("appmode:videoplayer:show");

	},
	slidesBtnHandler: function () {

	    win.log("slides button click");
	    App.vent.trigger("appmode:switch_tab_to", "blockscreens");

	},
	settingsBtnHandler: function () {
	    win.log("Settings button click");
	    App.vent.trigger("appmode:switch_tab_to", "settings");
	}

    });
    App.View.AppModeMenu = AppModeMenu;
})(window.App);
