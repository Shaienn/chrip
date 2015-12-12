/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {
    'use strict'

    App.View.MainWindow.TopToolbar  = Backbone.Marionette.ItemView.extend({

        template: '#main-window-toptoolbar-tpl',
        id: 'main-window-toptoolbar-contain',

        events: {
            'click #settings-btn': 'settingsBtnHandler',
            'click #presentation-btn': 'presentationBtnHandler',
        },


        initialize: function(){
            $("#presentation-btn").css("color", "gray");
            App.vent.on("presentation:changed", _.bind(this.set_start_button_state, this));
        },

        onDestroy: function(){

            App.vent.off("presentation:changed");
        },

        settingsBtnHandler: function () {

            win.log("settings button click");

            /* Send broadcast <show settings> signal. And answer only current active part */

            App.vent.trigger("settings:show");

        },

        presentationBtnHandler: function () {

            App.vent.trigger("main-window:toggle_presentation_state");

        },

        set_start_button_state: function(state){

            if (state){
                $("#presentation-btn").css("color", "green");
            } else {
                $("#presentation-btn").css("color", "gray");
            }

        },




    });

})(window.App);
