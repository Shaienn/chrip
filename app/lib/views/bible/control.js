/**
 * Created by shaienn on 06.09.15.
 */

(function (App) {
    'use strict';

    var sl_prevX = 0;
    var sl_prevY = 0;

    var ControlPanelView = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'bible-slide-item',
        template: "#slide-tpl",
        events: {
            'click .slide-container': 'showSlide',
            'dblclick .slide-item': 'quickShowSlide',
            'mouseover .slide-item': 'hoverSlide',
        },
        showSlide: function (e) {

            var elem = $(this.el);

            if (e.pageX !== sl_prevX || e.pageY !== sl_prevY) {
                $('.bible-slide-item.active').removeClass('active');
                elem.addClass('active');
                sl_prevX = e.pageX;
                sl_prevY = e.pageY;
            }

            App.vent.trigger("bible:control:showslide", this.model);

        },
        quickShowSlide: function () {

        },
        hoverSlide: function () {

        },
        initialize: function () {

        },
        onShow: function () {
            $('.bible-slide-item').first().addClass('active');
        }

    });

    App.View.ControlPanel = ControlPanelView;


    var ControlPanelCollection = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'control-panel-list',
        childView: App.View.ControlPanel,
        initialize: function () {

            $(window).on("resize", _.bind(this.redrawSlides, this));
            App.vent.on("bible:control:showActiveSlide", _.bind(this.showActiveSlide, this));

        },
        onDestroy: function () {
            $(window).off("resize");
            App.vent.off("bible:control:showActiveSlide");
        },
        showActiveSlide: function () {

            win.log("showActiveSlide");

            var controlPanel = $('#controlPanel ul');
            var currentSlide = controlPanel.find('li.active');
            currentSlide.find('.slide-container').addClass("test");
            currentSlide.find('.slide-container').trigger('click');

        },
        redrawSlides: function () {
            win.log("redraw slides");
            var gridSize = 100 / Math.ceil(Math.sqrt(this.collection.length));
            $('.control-panel-list .bible-slide-item').css("width", gridSize + "%");
            $('.control-panel-list .bible-slide-item').css("height", gridSize + "%");
        },
        onShow: function () {
            win.log("show control");
            this.redrawSlides();
            App.vent.trigger("bible:control:showslide", this.collection.at(0));

        },
    });

    App.View.BibleControlPanelCollection = ControlPanelCollection;


})(window.App);
