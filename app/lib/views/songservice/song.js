(function (App) {
    'use strict';

    var Q = require('q');

    var s_mover_prevX = 0;
    var s_mover_prevY = 0;
    var s_mout_prevX = 0;
    var s_mout_prevY = 0;

    var SongItemView = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'item',
        template: '#song-itemview-tpl',
        hoverSong: function (e) {
            if (e.pageX !== s_mover_prevX || e.pageY !== s_mover_prevY) {
                $('.songItem').parents('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                s_mover_prevX = e.pageX;
                s_mover_prevY = e.pageY;
            }
        },
        leaveSong: function (e) {
            if (e.pageX !== s_mout_prevX || e.pageY !== s_mout_prevY) {
                $(this.el).removeClass('selected');
                s_mout_prevX = e.pageX;
                s_mout_prevY = e.pageY;
            }
        },
    });

    App.View.SongService.Song = SongItemView.extend({
        events: {
            'click .songItem': 'previewSong',
            'dblclick .songItem': 'addToPlaylist',
            'mouseover .songItem': 'hoverSong',
            'mouseout .songItem': 'leaveSong',
        },
        addToPlaylist: function () {

            win.log("Add to play list request");
            App.Model.PlayListCollection.add(this.model);
        },
        previewSong: function (e) {

            var elem = $(this.el);
            $('.songItem').parents('.item.active').removeClass('active');
            elem.addClass('active');
            App.vent.trigger("songbase:loadtext", this.model);
        },
    });


    var SongCollectionView = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list',
    });

    App.View.SongCollection = SongCollectionView;


})(window.App);
