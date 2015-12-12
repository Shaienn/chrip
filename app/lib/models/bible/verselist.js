/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    App.Model.VerseList = Backbone.Model.extend({});

    var SearchVerseListCollection = Backbone.Collection.extend({
        
        initialize: function () {
            this.on("add", _.bind(this.prepareObject, this));
        },
        onDestroy: function () {
            this.off("add");
        },
        prepareObject: function (model) {

            if (model instanceof App.Model.Verse) {
                App.SlideGenerator.makeSlideFromVerse(model).then(function (slide) {
                    model.slide = slide;
                });
            }
        },
    });

    App.Model.SearchVerseListCollection = new SearchVerseListCollection({
        model: App.Model.Verse,
    });
    App.Model.SearchVerseListCollection.reset([]);

    /* Queue result collection */

    var QueueVerseListCollection = Backbone.Collection.extend({});
    App.Model.QueueVerseListCollection = new QueueVerseListCollection({
        model: App.Model.Verse,
    });
    App.Model.QueueVerseListCollection.reset([]);

})(window.App);
