/*
 Module that provides show bible quote on screen
 */

(function (App) {
    'use strict'

    App.View.Bible.Root = Backbone.Marionette.LayoutView.extend({
        template: '#bible-tpl',
        id: 'bible-main-window',
        regions: {
            Control_r: "#bible-control",
            Settings_r: "#bible-settings",
        },
        initialize: function () {
            App.vent.on('settings:show', _.bind(this.showSettings, this));
            App.vent.on('settings:close', _.bind(this.Settings_r.destroy, this.Settings_r));
        },
        onDestroy: function () {
            App.vent.off('settings:show');
            App.vent.off('settings:close');
        },
        onShow: function () {
            this.showControl();
        },
        /************ Regions part ************/

        showControl: function () {
            win.log("show bible control");
            this.Control_r.show(new App.View.Bible.Control());
        },
        showSettings: function () {
            win.log("show settings request");
            this.Settings_r.show(new App.View.Bible.Settings({
                model: settingsModel
            }));
        },
    });

}(window.App));
