(function (App) {
    'use strict';

    var s_mover_prevX = 0;
    var s_mover_prevY = 0;
    var s_mout_prevX = 0;
    var s_mout_prevY = 0;
    var that = this;

    App.View.SongPart = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'songpart-item',
        template: '#songpart-itemview-tpl',
        block_opened: false,
        modelEvents: {
            'change': 'render'
        },
        events: {
            'click .songpart-container': 'editPart',
            'click .songpart-remove': 'removePart',
            'mouseover .songpart-container': 'overHandler',
            'mouseout .songpart-container': 'outHandler',
            'mousemove .songpart-container': 'moveHandler',
            'mouseleave .songpart-container': 'leaveHandler',
        },
        onRender: function () {
            that = this;
        },
        editPart: function () {

            if (this.block_opened == true) {
                return;
            }

            App.vent.trigger("modal:show_songpart", this.model);
        },
        removePart: function (e) {
            e.stopPropagation();
            App.vent.trigger("modal:remove_songpart", this.model);
        },
        overHandler: function (e) {
            if (e.pageX !== s_mover_prevX || e.pageY !== s_mover_prevY) {
                var elem = $(this.el);
                elem.removeClass('selected');
                elem.addClass('selected');
                s_mover_prevX = e.pageX;
                s_mover_prevY = e.pageY;
            }
        },
        outHandler: function (e) {
            if (e.pageX !== s_mout_prevX || e.pageY !== s_mout_prevY) {
                $(this.el).removeClass('selected');
                s_mout_prevX = e.pageX;
                s_mout_prevY = e.pageY;
            }
        },
        leaveHandler: function (e) {
            var scene = $(this.el);
            var block = scene.find(".songpart-remove");
            block.stop().animate({right: "-11%"}, {duration: 300});
            that.block_opened = false;
        },
        moveHandler: function (e) {

            var scene = $(this.el);
            var moveX = e.clientX - scene.offset().left;
            var block = scene.find(".songpart-remove");

            if (moveX > (scene.width() * 0.9) && !that.block_opened) {
                var list = scene.closest("ul")[0];
                var hasScrollbar = list.scrollHeight > list.clientHeight ? true : false;
                block.stop().animate({right: hasScrollbar ? "10px" : "0px"}, {duration: 300});
                that.block_opened = true;
            }

            if (moveX < (scene.width() * 0.9) && that.block_opened) {
                block.stop().animate({right: "-11%"}, {duration: 300});
                that.block_opened = false;
            }

        },
    });

    App.View.SongPartCollection = Backbone.Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'songparts list',
        behaviors: {
            Sortable: {
                containment: 'parent'
            }
        },
    });

})(window.App);
