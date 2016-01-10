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
        },
        initialize: function () {
        
        },
        onDestroy: function () {

        },
        onShow: function () {
            this.showControl();
        },
        /************ Regions part ************/

        showControl: function () {
            win.log("show bible control");
            this.Control_r.show(new App.View.Bible.Control());
        },
    });

}(window.App));
