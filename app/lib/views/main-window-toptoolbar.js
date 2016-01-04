/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {
    'use strict'

    App.View.MainWindow.TopToolbar = Backbone.Marionette.ItemView.extend({
        template: '#main-window-toptoolbar-tpl',
        id: 'main-window-toptoolbar-contain',
        events: {
            'click #settings-btn': 'settingsBtnHandler',
            'click #presentation-btn': 'presentationBtnHandler',
            'click #update-btn': 'updateBtnHandler'
        },
        initialize: function () {
            $("#presentation-btn").css("color", "gray");
            App.vent.on("presentation:changed", _.bind(this.set_start_button_state, this));
            App.vent.on("main_toolbar:set_freeze_mode_indication", _.bind(this.set_freeze_mode_indication, this));
            App.vent.on("main_toolbar:set_update_mode_indication", _.bind(this.set_update_mode_indication, this));

        },
        onDestroy: function () {

            App.vent.off("presentation:changed");
            App.vent.off("main_toolbar:set_freeze_mode_indication");

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

            App.vent.trigger("main-window:toggle_presentation_state");

        },
        set_update_mode_indication: function (state) {
            if (state) {
                $("#update-btn").show();
            } else {
                $("#update-btn").hide();
            }
        },
        set_freeze_mode_indication: function (state) {
            console.log("set freeze mode: ", state);
            if (state) {
                $("#freeze-mode-btn-container").addClass("active");
            } else {
                $("#freeze-mode-btn-container").removeClass("active");
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
