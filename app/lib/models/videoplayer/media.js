/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';
    App.Model.Media.Elements.Element = Backbone.Model.extend({
	defaults: {
	    mrl: "",
	    name: "",
	    type: "",
	    volume: null,
	},
    });

    var MediaList = Backbone.Collection.extend({
	model: App.Model.Media.Elements.Element,
    });

    App.Model.Media.Elements.List = new MediaList;

    App.Model.Media.Elements.List.reset([]);

})(window.App);
