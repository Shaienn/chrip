/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    App.Model.Common.Slides.Slide = Backbone.Model.extend({
    });

    App.Model.Bible.Slides.Slide = App.Model.Common.Slides.Slide.extend({
	text: "",
	link: "",
    });

    App.Model.SongService.Slides.Slide = App.Model.Common.Slides.Slide.extend({
	text: "",
	number: 0,
    });

    App.Model.BlockScreens.Slides.Slide = App.Model.Common.Slides.Slide.extend({
	text: "",
	number: 0,
    });

})(window.App);