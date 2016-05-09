(function (App) {
    'use strict';

    App.View.SongService.Authors.Element = App.View.Common.ItemList.Element.extend({
	className: 'author-' + App.View.Common.ItemList.Element.prototype.className,
	template: '#author-itemview-tpl',
	clickReport: function (e) {
	    App.vent.trigger("songbase:selectAuthor", this.model);
	},
    });


    App.View.SongService.Authors.List = App.View.Common.ItemList.List.extend({
	className: 'author-' + App.View.Common.ItemList.List.prototype.className,
	childView: App.View.SongService.Authors.Element
    });


})(window.App);


