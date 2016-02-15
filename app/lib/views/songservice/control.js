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
            this.listenTo(App.vent, "resize", _.bind(this.redrawSlides, this));
            this.listenTo(App.vent, "control:showActiveSlide", _.bind(this.showActiveSlide, this));
        },
        showActiveSlide: function () {
            var controlPanel = $('#controlPanel ul');
            var currentSlide = controlPanel.find('li.active');
            currentSlide.find('.slide-container').trigger('click');
        },
        redrawSlides: function () {
            var gridSize = 100 / Math.ceil(Math.sqrt(this.collection.length));
            var slideItem = $('.control-panel-list .slide-item');
            slideItem.css("width", gridSize + "%");
            slideItem.css("height", gridSize + "%");
        },
        onShow: function () {
            this.redrawSlides();
            App.vent.trigger("songservice:control:showslide", this.collection.at(0));
        },
    });

    App.View.SongControlPanelCollection = ControlPanelCollection;


})(window.App);
