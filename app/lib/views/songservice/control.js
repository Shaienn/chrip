/**
 * Created by shaienn on 06.09.15.
 */

(function (App) {
    'use strict';


    App.View.SongService.Slides.SingleSlide = App.View.Common.Slides.Slide.extend({
	className: 'song-element-' + App.View.Common.Slides.Slide.prototype.className,
    });

    App.View.SongService.Slides.GroupSlide = App.View.Common.Slides.Slide.extend({
	className: 'song-element-' + App.View.Common.Slides.Slide.prototype.className,
	clickReport: function () {
	    App.vent.trigger("songservice:control:showslide", this.model);
	}
    });

    App.View.SongService.Slides.List = App.View.Common.Slides.List.extend({
	className: 'song-elements-' + App.View.Common.Slides.List.prototype.className,
	childView: App.View.SongService.Slides.GroupSlide,
    });


})(window.App);
