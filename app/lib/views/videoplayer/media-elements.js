/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';

    App.View.Media.Elements.Element = App.View.Common.ItemList.Element.extend({
	className: 'media-' + App.View.Common.ItemList.Element.prototype.className,
	clickReport: function () {
	    App.vent.trigger("media:control:media_selected", this.model);
	},
    });

    App.View.Media.Elements.List = App.View.Common.ItemList.List.extend({
	className: 'media-' + App.View.Common.ItemList.List.prototype.className,
	childView: App.View.Media.Elements.Element
    });


})(window.App);
