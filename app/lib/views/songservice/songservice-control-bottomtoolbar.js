/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {

    'use strict'

    App.View.SongService.Control.BottomToolBar = Backbone.Marionette.ItemView.extend({
	template: '#songservice-playlist-bottomtoolbar-tpl',
	className: 'row',
	events: {
	    'click #songservice-openbase-btn': 'openSongBase'
	},
	openSongBase: function () {
	    win.log("open songbase button click");
	    App.vent.trigger("songservice:show_songbase");
	},
    });

})(window.App);
