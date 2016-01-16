/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';

    var p_mover_prevX = 0;
    var p_mover_prevY = 0;
    var p_mout_prevX = 0;
    var p_mout_prevY = 0;


    var PlayListView = Backbone.Marionette.ItemView.extend({
        template: '#playlist-itemview-tpl',
        tagName: 'li',
        className: 'item',
        initialize: function () {

        },
        onShow: function () {

        },
        overHandler: function (e) {
            if (e.pageX !== p_mover_prevX || e.pageY !== p_mover_prevY) {
                $('.playlistItem').parents('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                p_mover_prevX = e.pageX;
                p_mover_prevY = e.pageY;
            }
        },
        outHandler: function (e) {
            if (e.pageX !== p_mout_prevX || e.pageY !== p_mout_prevY) {
                $(this.el).removeClass('selected');
                p_mout_prevX = e.pageX;
                p_mout_prevY = e.pageY;
            }
        },
    });
    App.View.PlayList = PlayListView;


    App.View.PlayListSongBase = PlayListView.extend({
        events: {
            'click .playlistItem': 'previewSong',
            'dblclick .playlistItem': 'removeFromPlaylist',
            'mouseover .playlistItem': 'overHandler',
            'mouseout .playlistItem': 'outHandler',
        },
        previewSong: function (e) {
            var elem = $(this.el);
            $('.playlistItem').parents('.item.active').removeClass('active');
            elem.addClass('active');
            App.vent.trigger("songbase:loadtext", this.model);
            App.vent.trigger("songbase:selectAuthor", this.model);
        },
        removeFromPlaylist: function () {
            App.Model.PlayListCollection.remove(this.model);
        },
    });

    App.View.PlayListControl = PlayListView.extend({
        events: {
            'mouseover .playlistItem': 'overHandler',
            'mouseout .playlistItem': 'outHandler',
            'click .playlistItem': 'select_song',
            'contextmenu .playlistItem': 'show_context_menu',
        },
        select_song: function (e) {

            var elem = $(this.el);
            $('.playlistItem').parents('.item.active').removeClass('active');
            elem.addClass('active');
            App.vent.trigger("songservice:playlist:item_selected", this.model);

        },
        show_context_menu: function (e) {
            e.stopPropagation();

            var gui = require('nw.gui');
            var menu = new gui.Menu();

            var settings = new gui.MenuItem({
                label: 'Settings',
                click: function () {
                    console.log("settings");
                },
            });

            menu.append(settings);

            /* Show menu */

            menu.popup(e.originalEvent.x, e.originalEvent.y);
        },
    });


    var PlayListCollection = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list',
        behaviors: {
            Sortable: {
                containment: 'parent'
            }
        },
    });

    App.View.PlayListCollection = PlayListCollection;

})(window.App);
