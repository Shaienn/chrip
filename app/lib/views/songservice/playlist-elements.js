/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';

    App.View.PlayListSongBase = App.View.Common.ItemList.Element.extend({
	className: 'playlist-' + App.View.Common.ItemList.Element.prototype.className,
	clickReport: function () {
	    App.vent.trigger("songbase:loadtext", this.model);
	    App.vent.trigger("songbase:selectAuthor", this.model);
	},
	dblClickHandler: function () {
	    App.Model.PlayListCollection.remove(this.model);
	},
    });

    App.View.PlayListControl = App.View.Common.ItemList.Element.extend({
	className: 'playlist-' + App.View.Common.ItemList.Element.prototype.className,
	clickReport: function () {
	    App.vent.trigger("songservice:playlist:item_selected", this.model);
	},
	contextMenuHandler: function (e) {
	    e.stopPropagation();

	    var that = this;
	    var gui = require('nw.gui');
	    var menu = new gui.Menu();

	    var edit = new gui.MenuItem({
		label: 'Edit',
		click: function () {

		    /* Redraw slides */

		    if (!that.model instanceof App.Model.SongService.Elements.Element)
			return;

		    App.vent.trigger("songservice:control:context:edit_song", that.model);

		},
	    });

	    menu.append(edit);


	    var redraw = new gui.MenuItem({
		label: 'Redraw',
		click: function () {

		    /* Redraw slides */

		    if (!that.model instanceof App.Model.SongService.Elements.Element)
			return;

		    that.model.rebuild_slides().then(function () {
			App.vent.trigger("songservice:control:context:song_slides_redraw", that.model);
		    });
		},
	    });



	    menu.append(redraw);

	    /* Show menu */

	    menu.popup(e.originalEvent.x, e.originalEvent.y);
	},
    });


    App.View.SongService.PlayList.List = App.View.Common.ItemList.List.extend({
	className: 'playlist-' + App.View.Common.ItemList.List.prototype.className,
	behaviors: {
	    Sortable: {
		containment: 'parent'
	    }
	},
    });


})(window.App);
