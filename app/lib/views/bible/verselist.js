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
    var that;


    App.View.VerseList = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'item',
        initialize: function () {

        },
        onShow: function () {
            if (this.model.get('slides') == "") {
                $(this.el).addClass('passive');
            } else {
                $(this.el).removeClass('passive');
            }
        },
        overHandler: function (e) {
            if (e.pageX !== v_mover_prevX || e.pageY !== v_mover_prevY) {
                $('.verselistItem').parents('.item.selected').removeClass('selected');
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
        sendToScreen: function (e) {
            if (!that.block_opened) {
                var elem = $(this.el);
                $('.verselistItem').parents('.item.active').removeClass('active');
                elem.addClass('active');
                App.vent.trigger("bible:control:verse_selected", this.model);
            }
        },
    });

    App.View.QueueVerseListControl = App.View.VerseList.extend({
        template: '#queue-itemview-tpl',
        block_opened: false,
        events: {
            'mouseover .verselistItem': 'overHandler',
            'mouseout .verselistItem': 'outHandler',
            'mousemove .verselistItem': 'moveHandler',
            'mouseleave .verselistItem': 'leaveHandler',
            'click .verselistItem': 'sendToScreen',
            'click .verse_remove_from_queue': 'removeFromQueue',
        },
        onShow: function () {
            that = this;
        },
        leaveHandler: function (e) {
            var scene = $(this.el);
            var block = scene.find(".verse_remove_from_queue");
            block.stop().animate({right: "-11%"}, {duration: 300});
            that.block_opened = false;
        },
        moveHandler: function (e) {

            var scene = $(this.el);
            var moveX = e.clientX - scene.offset().left;
            var block = scene.find(".verse_remove_from_queue");

            if (moveX > (scene.width() * 0.9) && !that.block_opened) {
                var list = scene.closest("ul")[0];
                var hasScrollbar = list.scrollHeight > list.clientHeight ? true : false;
                block.stop().animate({right: hasScrollbar ? "10px" : "0px"}, {duration: 300});
                that.block_opened = true;
            }

            if (moveX < (scene.width() * 0.9) && that.block_opened) {
                win.log("close");
                block.stop().animate({right: "-11%"}, {duration: 300});
                that.block_opened = false;
            }

        },
        removeFromQueue: function (e) {
            App.vent.trigger("bible:control:remove_from_queue", this.model);
        },
    });

    App.View.SearchVerseListControl = App.View.VerseList.extend({
        template: '#search-itemview-tpl',
        block_opened: false,
        events: {
            'mouseover .verselistItem': 'overHandler',
            'mouseout .verselistItem': 'outHandler',
            'mousemove .verselistItem': 'moveHandler',
            'mouseleave .verselistItem': 'leaveHandler',
            'click .verselistItem': 'sendToScreen',
            'click .verse_add_to_queue': 'addVerseToQueue',
        },
        onShow: function () {
            that = this;
        },
        leaveHandler: function (e) {
            var scene = $(this.el);
            var block = scene.find(".verse_add_to_queue");
            block.stop().animate({right: "-11%"}, {duration: 300});
            that.block_opened = false;
        },
        moveHandler: function (e) {

            var scene = $(this.el);
            var moveX = e.clientX - scene.offset().left;
            var block = scene.find(".verse_add_to_queue");

            if (moveX > (scene.width() * 0.9) && !that.block_opened) {
                var list = scene.closest("ul")[0];
                var hasScrollbar = list.scrollHeight > list.clientHeight ? true : false;
                block.stop().animate({right: hasScrollbar ? "10px" : "0px"}, {duration: 300});
                that.block_opened = true;
            }

            if (moveX < (scene.width() * 0.9) && that.block_opened) {
                win.log("close");
                block.stop().animate({right: "-11%"}, {duration: 300});
                that.block_opened = false;
            }
        },
        addVerseToQueue: function (e) {
            App.vent.trigger("bible:control:add_to_queue", this.model);
        },
    });


    App.View.QueueVerseListCollection = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list',
        behaviors: {
            Sortable: {
                containment: 'parent'
            }
        },
    });
    
    App.View.SearchVerseListCollection = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'list',
    });


})(window.App);
