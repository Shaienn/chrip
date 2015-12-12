/*
  Module that provides show bible quote on screen
*/

(function (App){
    'use strict'

    var _this;
    App.View.Bible.Root = Backbone.Marionette.LayoutView.extend({

        template: '#bible-tpl',
        id: 'bible-main-window',

        regions: {
            Control_r: "#bible-control",
            Settings_r: "#bible-settings",
        },

        initialize: function(){

        },

        onDestroy: function(){

        },

        onShow: function(){

            this.showControl();

        },


        /************ Regions part ************/

        showControl: function(){
            win.log("show bible control");
            this.Control_r.show(new App.View.Bible.Control());
        },

        showSettings: function(){

        },

    });

}(window.App));
