/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {
    'use strict'

    App.View.MainWindow.BottomBar = Backbone.Marionette.ItemView.extend({
	template: '#main-window-bottom-bar-tpl',
	className: 'col-lg-12',
	events: {
	    'click #settings-btn': 'settingsBtnHandler',
	    'click #presentation-btn': 'presentationBtnHandler',
	    'click #update-btn': 'updateBtnHandler'
	},
	initialize: function () {
	    $("#presentation-btn").css("color", "gray");

	    this.listenTo(App.vent, 'active_mode_changed', _.bind(this.set_active_mode_indication, this));
	    this.listenTo(App.vent, "presentation:changed", _.bind(this.set_start_button_state, this));
	    this.listenTo(App.vent, "main_toolbar:set_update_mode_indication", _.bind(this.set_update_mode_indication, this));
	    this.listenTo(App.vent, "main_toolbar:set_black_mode_indication", _.bind(this.set_black_screen_mode_indication, this));
	},
	updateBtnHandler: function () {
	    App.vent.trigger("update:run_update");
	},
	settingsBtnHandler: function () {

	    win.log("settings button click");

	    /* Send broadcast <show settings> signal. And answer only current active part */

	    App.vent.trigger("settings:show");

	},
	presentationBtnHandler: function () {
	    App.Presentation.toggle_presentation();
	},
	set_update_mode_indication: function (state) {
	    if (state) {
		$("#update-btn").show();
	    } else {
		$("#update-btn").hide();
	    }
	},
	set_active_mode_indication: function (state) {
	    var container = $("#app-mode-btn-container");
	    if (state) {
		container.find("#passive_mode").hide();
		container.find("#active_mode").show();
	    } else {
		container.find("#active_mode").hide();
		container.find("#passive_mode").show();
	    }
	},
	set_black_screen_mode_indication: function (state) {
	    var container = $("#app-mode-btn-container");
	    if (state) {
		container.find("#black_mode").show();
	    } else {
		container.find("#black_mode").hide();
	    }
	},
	set_start_button_state: function (state) {
	    if (state) {
		$("#presentation-btn").css("color", "green");
	    } else {
		$("#presentation-btn").css("color", "gray");
	    }
	},
    });

})(window.App);
