/**
 * Created by shaienn on 06.09.15.
 */

(function (App) {
    'use strict';

    var ControlPanelCollection = Marionette.CollectionView.extend({
        tagName: 'ul',
        className: 'control-panel-list',
        childView: App.View.SongService.GroupSlide,
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
