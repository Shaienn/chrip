/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {
    'use strict'

    var TopToolbarItemView = Backbone.Marionette.ItemView.extend({

        template: '#churchservice-control-toptoolbar-tpl',
        id: 'churchservice-control-toptoolbar',

        events: {
            'click #churchservice-settings-btn': 'settingsBtnHandler',
            'click #churchservice-presentation-btn': 'presentationBtnHandler',

        },


        settingsBtnHandler: function () {

            win.log("settings button click");
            App.vent.trigger("churchservice:settings:show");

        },

        presentationBtnHandler: function () {

            if (App.Settings.presentation_window != true){

                win.log("start button click: show");
                App.vent.trigger("churchservice:presentation:show");
                App.Settings.presentation_window = true;

            } else {
                win.log("start button click: close");
                App.vent.trigger("churchservice:presentation:close");
                App.Settings.presentation_window = false;
            }

        }


    });

    App.View.ChurchService.Control.TopToolbar = TopToolbarItemView;


})(window.App);