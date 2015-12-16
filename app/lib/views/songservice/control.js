/**
 * Created by shaienn on 06.09.15.
 */

(function (App) {
    'use strict';

    var sl_prevX = 0;
    var sl_prevY = 0;

    var ControlPanelView = Marionette.ItemView.extend({
        tagName: 'li',
        className: 'slide-item',
        template: "#slide-tpl",
        background_loaded: false,
        ui: {
            background: ".slide_background",
            text_span: ".slide_text span",
        },
        events: {
            'click .slide-container': 'showSlide',
        },
        showSlide: function (e) {

            console.log("showslide");
            var elem = $(this.el);

            if (e.pageX !== sl_prevX || e.pageY !== sl_prevY) {
                $('.slide-item.active').removeClass('active');
                elem.addClass('active');
                sl_prevX = e.pageX;
                sl_prevY = e.pageY;
            }

            App.vent.trigger("songservice:control:showslide", this.model);

        },
        initialize: function () {
            $(window).on("resize", _.bind(this.onShow, this));


        },
        onShow: function () {

            var that = this;

            /* We wait first time until loading background image, 
             * cause container dimensions for bigText() depends on it */

            if (this.background_loaded) {
                this.ui.text_span.bigText();
                return;
            } else {
                
                this.ui.text_span.hide();
                
                this.ui.background.load(function () {
                    console.log("loaded");
                    that.ui.text_span.show();
                    that.ui.text_span.bigText();
                    that.background_loaded = true;
                });
            }
        },
        onDestroy: function () {
            $(window).off("resize", this.onShow);
        },
    });

    App.View.ControlPanel = ControlPanelView;


    var ControlPanelCollection = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'control-panel-list',
        childView: App.View.ControlPanel,
        initialize: function () {

            $(window).on("resize", _.bind(this.redrawSlides, this));
            App.vent.on("control:showActiveSlide", _.bind(this.showActiveSlide, this));

        },
        onDestroy: function () {
            $(window).off("resize", this.redrawSlides);
            App.vent.off("control:showActiveSlide");
        },
        showActiveSlide: function () {

            win.log("showActiveSlide");

            var controlPanel = $('#controlPanel ul');
            var currentSlide = controlPanel.find('li.active');
            currentSlide.find('.slide-container').trigger('click');

        },
        redrawSlides: function () {
            win.log("redraw slides");
            var gridSize = 100 / Math.ceil(Math.sqrt(this.collection.length));
            var slideItem = $('.control-panel-list .slide-item');
            slideItem.css("width", gridSize + "%");
            slideItem.css("height", gridSize + "%");
        },
        onShow: function () {
            win.log("show control");
            this.redrawSlides();
            App.vent.trigger("songservice:control:showslide", this.collection.at(0));
            
        },
    });

    App.View.SongControlPanelCollection = ControlPanelCollection;


})(window.App);
