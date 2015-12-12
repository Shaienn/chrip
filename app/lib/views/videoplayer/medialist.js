/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';

    var v_mover_prevX = 0;
    var v_mover_prevY = 0;
    var v_mout_prevX = 0;
    var v_mout_prevY = 0;

    App.View.MediaList = Backbone.Marionette.ItemView.extend({

        template: '#medialist-itemview-tpl',
        tagName: 'li',
        className: 'item',

        initialize: function () {

        },

        onShow: function () {
            if (this.model.get('slides')==""){
                $(this.el).addClass('passive');
            } else {
                $(this.el).removeClass('passive');
            }
        },

        overHandler: function (e) {
            if (e.pageX !== v_mover_prevX || e.pageY !== v_mover_prevY) {
                $('.medialistItem').parents('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                v_mover_prevX = e.pageX;
                v_mover_prevY = e.pageY;
            }
        },

        outHandler: function (e) {
            if (e.pageX !== v_mout_prevX || e.pageY !== v_mout_prevY) {
                $(this.el).removeClass('selected');
                v_mout_prevX = e.pageX;
                v_mout_prevY = e.pageY;
            }
        },

    });

    App.View.MediaListControl = App.View.MediaList.extend({

        events: {
            'mouseover .medialistItem': 'overHandler',
            'mouseout .medialistItem': 'outHandler',
            'click .medialistItem': 'selectMedia',
        },

        selectMedia: function (e) {

            var elem = $(this.el);
            $('.medialistItem').parents('.item.active').removeClass('active');
            elem.addClass('active');
            App.vent.trigger("mediaplayer:control:media_selected", this.model);

        },
    });


    App.View.MediaListCollection = Marionette.CollectionView.extend({

        tagName: 'ul',
        className: 'list',

        initialize: function () {

        },

        onRender: function () {

        },

        onDestroy: function () {

        },

    });


})(window.App);
