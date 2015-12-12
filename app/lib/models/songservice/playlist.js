/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var PlayListModel = Backbone.Model.extend({});
    App.Model.PlayList = PlayListModel;

    var PlayListCollection = Backbone.Collection.extend({
        initialize: function () {
            this.on("add", _.bind(this.prepareObject, this));
        },
        onDestroy: function () {
            this.off("add");
        },
        prepareObject: function (model) {
            App.SlideGenerator.makeSlidesFromSong(model).then(function (slides) {
                model.slides = slides;
            });
        },
    });

    App.Model.PlayListCollection = new PlayListCollection({
        model: App.Model.Song,
    })

    App.Model.PlayListCollection.reset([]);

})(window.App);
