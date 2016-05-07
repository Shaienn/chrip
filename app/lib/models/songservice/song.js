/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';
    App.Model.SongService.Elements.Element = Backbone.Model.extend({
	defaults: {
	    name: "",
	    db: "0",
	    uaid: "",
	    gaid: "",
	    usid: "",
	    gsid: "",
	    text: "",
	},
	rebuild_slides: function () {
	    var d = Q.defer();
	    var that = this;
	    App.SlideGenerator.makeSlidesFromSong(this).then(function (slides) {
		that.slides = slides;
		d.resolve(true);
	    });
	    return d.promise;
	}

    });

    App.Model.SongService.Elements.List = Backbone.Collection.extend({
	model: App.Model.SongService.Elements.Element,
	comparator: 'name'
    });


//    App.Model.SongCollection = SongCollection;
})(window.App);