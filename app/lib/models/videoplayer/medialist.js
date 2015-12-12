/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    App.Model.MediaList = Backbone.Model.extend({});

    var MediaListCollection = Backbone.Collection.extend({


        initialize: function () {
            this.on("add", _.bind(this.prepareObject, this));
        },

        onDestroy: function () {
            this.off("add");
        },

        prepareObject: function (model) {

        },

    });

    App.Model.MediaListCollection = new MediaListCollection({
        model: App.Model.Media
    });

    App.Model.MediaListCollection.reset([]);

})(window.App);
