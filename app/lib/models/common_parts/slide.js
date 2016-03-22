/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    App.Model.Common.Slides.Slide = Backbone.Model.extend({
    });

    App.Model.BibleSlide = App.Model.Common.Slides.Slide.extend({
	text: "",
	link: "",
    });

    App.Model.SongSlide = App.Model.Common.Slides.Slide.extend({
	text: "",
	number: 0,
    });

})(window.App);