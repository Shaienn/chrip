/*
  Module that provides show videos on screen
*/

(function (App){

    'use strict'

    var _this;
    App.View.Videoplayer.Root = Backbone.Marionette.LayoutView.extend({

        template: '#videoplayer-tpl',
        id: 'videoplayer-main-window',

        regions: {
            Control_r: "#videoplayer-control",
            Settings_r: "#videoplayer-settings",
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

            this.Control_r.show(new App.View.Videoplayer.Control);
        },

        showSettings: function(){

        },

    });

}(window.App));
