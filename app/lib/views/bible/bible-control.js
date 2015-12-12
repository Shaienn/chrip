/* Bible tab control screen */

(function (App) {
    'use strict'

    App.View.Bible.Control = Backbone.Marionette.LayoutView.extend({
        template: '#bible-control-tpl',
        id: 'bible-control-contain',
        regions: {
            Search_r: '#bible_search',
            VerseList_r: '#bible_verselist',
            VerseQueue_r: '#bible_versequeue',
            SlideControl_r: '#bible_slidecontrol',
        },
        /******************* Layout functions *******************/

        initialize: function () {

            App.vent.on("bible:control:verse_selected", _.bind(this.showVerseSlide, this));
            App.vent.on("bible:control:select_verse", _.bind(this.selectVerse, this));
            App.vent.on("bible:control:add_to_queue", _.bind(this.addVerseToQueue, this));
            App.vent.on("bible:control:remove_from_queue", _.bind(this.removeVerseFromQueue, this));
        },
        onShow: function () {

            /* Search input area */

            this.Search_r.show(new App.View.Bible.Control.Search());

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
        onDestroy: function () {

            App.vent.off("bible:control:verse_selected");
            App.vent.off("bible:control:select_verse");

        },
        /**************************************/

        addVerseToQueue: function (verse) {
            App.Model.QueueVerseListCollection.add(verse);
        },
        removeVerseFromQueue: function (verse) {
            App.Model.QueueVerseListCollection.remove(verse);
        },
        showVerseSlide: function (verse) {

//            var itemCollection = new App.Model.ControlPanelCollection(verse.slides);
//            var itemCollectionView = new App.View.BibleControlPanelCollection({
//                collection: itemCollection,
//            });
//            this.SlidesControl_r.show(itemCollectionView);

            this.SlideControl_r.show(new App.View.Bible.VerseSlide({
                model: verse.slide
            }));

        },
        selectVerse: function (verse_number) {

            /* Select verse */

            console.log("select verse request: " + verse_number);
            var verse_list = $('#bible_verselist ul');
            console.log(verse_list.length);
            var currentVerse = verse_list.find('li div[verse=' + verse_number + ']');
            currentVerse.parent().trigger('click');
            currentVerse.parent().addClass('active');

        },
    });

}(window.App));
