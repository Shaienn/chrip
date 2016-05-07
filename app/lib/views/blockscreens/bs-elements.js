/**
 * Created by shaienn on 06.09.15.
 */

(function (App) {
    'use strict';

    //App.View.BlockScreens.Elements.Element = App.View.Common.Slides.Slide.extend({
    App.View.BlockScreens.Slides.Slide = App.View.Common.Slides.Slide.extend({
	template: "#bs-element-tpl",
	className: 'bs-element-' + App.View.Common.Slides.Slide.prototype.className,
	clickReport: function () {
	    App.vent.trigger("blockscreens:selectElement", this.model);
	}
    });

    //App.View.BlockScreens.Elements.List = App.View.Common.Slides.List.extend({
    App.View.BlockScreens.Slides.List = App.View.Common.Slides.List.extend({
	className: 'bs-element-' + App.View.Common.Slides.List.prototype.className,
	childView: App.View.BlockScreens.Slides.Slide,
	behaviors: {
	    Sortable: {
		containment: 'parent'
	    }
	},
    });




})(window.App);
