(function (App) {
    'use strict';

    App.View.SongService.Songs.Element = App.View.Common.ItemList.Element.extend({
	className: 'song-' + App.View.Common.ItemList.Element.prototype.className,
	dblClickHandler: function () {
	    App.Model.PlayListCollection.add(this.model);
	},
	clickReport: function (e) {
	    App.vent.trigger("songbase:loadtext", this.model);
	},
    });


    App.View.SongService.Songs.List = App.View.Common.ItemList.List.extend({
	className: 'song-' + App.View.Common.ItemList.List.prototype.className,
	childView: App.View.SongService.Songs.Element,
    });

})(window.App);
