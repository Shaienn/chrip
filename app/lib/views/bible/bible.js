/* Bible tab control screen */

(function (App) {
    'use strict'

    App.View.Bible.Root = Backbone.Marionette.LayoutView.extend({
	template: '#bible-tpl',
	id: 'bible-main-window',
	regions: {
	    Search_r: '#bible_search',
	    VerseList_r: '#bible_verselist',
	    VerseQueue_r: '#bible_versequeue',
	    SlideControl_r: '#bible_slidecontrol',
	},
	/******************* Layout functions *******************/

	initialize: function () {
	    this.listenTo(App.vent, 'bible:control:verse_selected', _.bind(this.showVerseSlide, this));
	    this.listenTo(App.vent, 'bible:control:select_verse', _.bind(this.selectVerse, this));
	    this.listenTo(App.vent, 'bible:control:add_to_queue', _.bind(this.addVerseToQueue, this));
	    this.listenTo(App.vent, 'bible:control:remove_from_queue', _.bind(this.removeVerseFromQueue, this));
	},
	onShow: function () {

	    /* Search input area */

	    this.Search_r.show(new App.View.Bible.Search());

	    /* Verse queue */

	    this.VerseQueue_r.show(new App.View.QueueVerseListCollection({
		childView: App.View.QueueVerseListControl,
		collection: App.Model.QueueVerseListCollection,
	    }));

	    /* Verse list */

	    this.VerseList_r.show(new App.View.SearchVerseListCollection({
		childView: App.View.SearchVerseListControl,
		collection: App.Model.SearchVerseListCollection,
	    }));

	},
	/**************************************/

	addVerseToQueue: function (verse) {
	    App.Model.QueueVerseListCollection.add(verse);
	},
	removeVerseFromQueue: function (verse) {
	    App.Model.QueueVerseListCollection.remove(verse);
	},
	showVerseSlide: function (verse) {
//	    this.SlideControl_r.show(new App.View.Bible.Slides.Slide({
//		model: verse.slide
//	    }));

	    if (App.active_mode == true) {
		App.vent.trigger("presentation:set_new_element", verse.slide);
	    }
	},
	selectVerse: function (verse_number) {

	    /* Select verse */

	    var verse_list = this.VerseList_r.$el.find('ul');
	    var currentVerse = verse_list.find('li div[verse=' + verse_number + ']');
	    currentVerse.parent().trigger('click');
	    currentVerse.parent().addClass('active');

	},
    });

}(window.App));
