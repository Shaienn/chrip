/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';

    App.View.SongService.Control = Backbone.Marionette.LayoutView.extend({
	template: '#songservice-control-tpl',
	id: 'songservice-control-contain',
	collection: null,
	active_item: null,
	regions: {
	    BottomToolbar_r: '#playlist_bottomtoolbar',
	    List_r: '#playlist_list',
	    ControlPanel_r: "#controlPanel",
	    modals: {
		selector: '#songServiceModal',
		regionClass: Backbone.Marionette.Modals
	    }
	},
	/******************* Layout functions *******************/

	initialize: function () {
	    this.listenTo(App.vent, 'songservice:playlist:item_selected', _.bind(this.show_song_slides, this));
	    this.listenTo(App.vent, 'songservice:control:onEvent', _.bind(this.onEvent, this));
	    this.listenTo(App.vent, 'songservice:control:offEvent', _.bind(this.offEvent, this));
	    this.listenTo(App.vent, 'songservice:control:showslide', _.bind(this.showSlide, this));

	    /* Context menu */

	    this.listenTo(App.vent, "songservice:control:context:song_slides_redraw", _.bind(this.song_slides_redraw, this));
	    this.listenTo(App.vent, "songservice:control:context:edit_song", _.bind(this.openEditSongWindow, this));


	},
	onShow: function () {

	    var that = this;
	    this.BottomToolbar_r.show(new App.View.SongService.Control.BottomToolBar);

	    /* Add last songs */

	    App.Database.getLastSongs().then(function (lastSongs) {

		win.log(lastSongs);

		for (var i = 0; i < lastSongs.length; i++) {
		    lastSongs[i].rebuild_slides();
		    App.Model.PlayListCollection.add(lastSongs[i], {silent: true});
		}

		that.collection = new App.View.SongService.PlayList.List({
		    childView: App.View.PlayListControl,
		    collection: App.Model.PlayListCollection,
		});

		that.List_r.show(that.collection);
		_.bind(that.doOnShow, that)();
	    });
	},
	/**************************************/
	openEditSongWindow: function (song) {

	    var that = this;
	    console.log("authors loading");

	    /* get related info */

	    App.Database.loadAuthors().then(function (loadedAuthors) {

		var authorCollection = new App.Model.AuthorCollection(loadedAuthors);
		var form = new App.View.SongService.Songs.EditForm({
		    song: song,
		    authors: authorCollection,
		    control: that
		});

		/* Turn off keydown events while in modal */

		that.modals.show(form);
	    });
	},
	showSlide: function (slide) {

	    var slides_panel = this.ControlPanel_r.$el;

	    if (slides_panel.length !== 0) {
		slides_panel.find('.active').removeClass('active');
		slides_panel.find('div[number=' + slide.get('number') + ']')
			.parent().addClass("active");
	    }

	    if (App.active_mode == true) {
		App.vent.trigger("presentation:set_new_element", slide);
	    }

	},
	song_slides_redraw: function (song) {

	    /* Redraw control regiong only if we redraw active song */

	    if (this.active_item.cid != song.cid)
		return;

	    this.show_song_slides(song);

	},
	show_song_slides: function (item) {

	    if (item instanceof App.Model.SongService.Elements.Element) {

		this.active_item = item;

		/* Collection of itemviews */

		var itemCollection = new App.Model.SongService.Slides.List(item.slides);


		var itemCollectionView = new App.View.SongService.Slides.List({
		    collection: itemCollection,
		});

		this.keyAssign(item.slides.length);

	    }

	    this.ControlPanel_r.show(itemCollectionView);

	},
	onEvent: function () {
	    this.offEvent();
	    $(App.ControlWindow.window.document).on('keydown', this.keyHandler);
	    this.List_r.currentView.render();
	    App.vent.trigger("resize");
	},
	offEvent: function () {
	    $(App.ControlWindow.window.document).off('keydown', this.keyHandler);
	},
	keyHandler: function (event) {

	    event.preventDefault();
	    var key = event.which;

	    if (event.ctrlKey) {

		/* CTRL + O opens songbase */

		if (key == 79) {
		    win.log("Open songbase request");
		    App.vent.trigger("songservice:show_songbase");
		}
	    }

	    if ((key >= 97) && (key <= 105)) {

		this.keys.forEach(function (item) {

		    if (item.key == key) {

			var controlPanel = $('#controlPanel ul');
			controlPanel.find('.song-element-slide-preview-item').removeClass('active');
			var item = controlPanel.find('.slide-container[number=' + item.c + ']');
			item.trigger('click');
			item.parents('.song-element-slide-preview-item').addClass('active');
			return;

		    }
		});
	    }


	    if ((key >= 37) && (key <= 40)) {

		switch (key) {

		    case (37):

			/* Select previous slide */

			var controlPanel = $('#controlPanel ul');
			var currentSlide = controlPanel.find('li.active');
			var prevSlide = currentSlide.prev('#controlPanel ul li');
			if (prevSlide.length > 0) {

			    currentSlide.removeClass('active');
			    prevSlide.find('.slide-container').trigger('click');
			    prevSlide.addClass('active');

			}
			break;

		    case (39):

			/* Select next slide */

			var controlPanel = $('#controlPanel ul');
			var currentSlide = controlPanel.find('li.active');
			var nextSlide = currentSlide.next('#controlPanel ul li');
			if (nextSlide.length > 0) {

			    currentSlide.removeClass('active');
			    nextSlide.find('.slide-container').trigger('click');
			    nextSlide.addClass('active');

			}
			break;

		    case (38):

			/* Select previous song */

			var playlist_list = $('#playlist_list ul');
			var currentSong = playlist_list.find('li.active');
			var prevSong = currentSong.prev('#playlist_list ul li');
			if (prevSong.length > 0) {

			    currentSong.removeClass('active');
			    prevSong.find('.item-container').trigger('click');
			    prevSong.addClass('active');

			}
			break;

		    case (40):

			/* Select next song */

			var playlist_list = $('#playlist_list ul');
			var currentSong = playlist_list.find('li.active');
			var nextSong = currentSong.next('#playlist_list ul li');
			if (nextSong.length > 0) {

			    currentSong.removeClass('active');
			    nextSong.find('.item-container').trigger('click');
			    nextSong.addClass('active');

			}
			break;

		}
	    }
	},
	keyAssign: function (slides_count) {

	    this.keys = [];

	    if (slides_count > 0) {

		/* 7 or Home is it */

		this.keys.push({key: 103, c: 0});

		if (slides_count > 1) {

		    /* 8 or Up is it */

		    this.keys.push({key: 104, c: 1});

		    if (slides_count > 2) {

			if (slides_count > 4) {

			    /* 9 or PgUp is it */

			    this.keys.push({key: 105, c: 2});

			} else {

			    /* 4 or Left is it */

			    this.keys.push({key: 100, c: 2});

			}

			if (slides_count > 3) {

			    if (slides_count > 4) {

				/* 4 or Left is it */

				this.keys.push({key: 100, c: 3});

			    } else {

				/* 5 or Left is it */

				this.keys.push({key: 101, c: 3});

			    }

			    if (slides_count > 4) {

				/* 5 or Left is it */

				this.keys.push({key: 101, c: 4});

				if (slides_count > 5) {

				    /* 6 or Right is it */

				    this.keys.push({key: 102, c: 5});


				    if (slides_count > 6) {

					/* 1 or End is it */

					this.keys.push({key: 97, c: 6});

					if (slides_count > 7) {

					    /* 2 or Down is it */

					    this.keys.push({key: 98, c: 7});

					    if (slides_count > 8) {

						/* 3 or PgDn is it */

						this.keys.push({key: 99, c: 8});

					    }
					}
				    }
				}
			    }
			}
		    }
		}
	    }
	},
    });

})(window.App);
