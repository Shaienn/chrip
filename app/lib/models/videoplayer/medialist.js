/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    App.Model.MediaList = Backbone.Model.extend({});

    var MediaListCollection = Backbone.Collection.extend({});

    App.Model.MediaListCollection = new MediaListCollection({
	model: App.Model.Media.Elements.Element,
    });

    App.Model.MediaListCollection.reset([]);

})(window.App);
