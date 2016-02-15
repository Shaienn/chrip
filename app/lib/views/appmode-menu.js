/**
 * Created by shaienn on 13.09.15.
 */

(function (App) {
    'use strict'

    var AppModeMenu = Backbone.Marionette.ItemView.extend({
        template: '#appmode-menu-tpl',
        id: 'appmode-menu-container',
        events: {
            'click #appmode-menu-songservice-btn': 'presentationBtnHandler',
            'click #appmode-menu-bible-btn': 'bibleBtnHandler',
            'click #appmode-menu-videoplayer-btn': 'videoplayerBtnHandler',
            'click #appmode-menu-settings-btn': 'settingsBtnHandler',
        },
        presentationBtnHandler: function () {

            win.log("presentation button click");
            App.vent.trigger("appmode:switch_tab_to", "songservice");

        },
        bibleBtnHandler: function () {
            win.log(" bible button click");
            App.vent.trigger("appmode:switch_tab_to", "bible");
            //App.vent.trigger("appmode:bible:show");
        },
        videoplayerBtnHandler: function () {

            win.log("videoplayer button click");
            App.vent.trigger("appmode:switch_tab_to", "mediaplayer");
            //App.vent.trigger("appmode:videoplayer:show");

        },
        settingsBtnHandler: function () {
            win.log("Settings button click");
            App.vent.trigger("appmode:switch_tab_to", "settings");

        }

    });

    App.View.AppModeMenu = AppModeMenu;


})(window.App);
