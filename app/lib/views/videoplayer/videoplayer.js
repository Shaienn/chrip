/*
  Module that provides show videos on screen
*/

(function (App){
    'use strict'
    App.View.Videoplayer.Root = Backbone.Marionette.LayoutView.extend({

        template: '#videoplayer-tpl',
        id: 'videoplayer-main-window',

        regions: {
            Control_r: "#videoplayer-control",
            Settings_r: "#videoplayer-settings",
        },

        onShow: function(){
            this.showControl();
        },


        /************ Regions part ************/

        showControl: function(){
            this.Control_r.show(new App.View.Videoplayer.Control);
        },

    });

}(window.App));
