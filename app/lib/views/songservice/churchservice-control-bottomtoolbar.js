/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {

    'use strict'

    App.View.SongService.Control.BottomToolBar = Backbone.Marionette.ItemView.extend({

        template: '#churchservice-playlist-bottomtoolbar-tpl',
        className: 'churchservice-playlist-bottomtoolbar',

        events: {

            'click #churchservice-openbase-btn': 'openSongBase'

        },

        openSongBase: function () {

            win.log("open songbase button click");
            App.vent.trigger("churchservice:songbase:show");

        },

    });

})(window.App);
