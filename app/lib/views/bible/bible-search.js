/* Bible tab control screen */

(function (App) {
    'use strict'

    App.View.Bible.Control.Search = Backbone.Marionette.ItemView.extend({
        template: '#bible-search-tpl',
        id: 'bible-search-contain',
        Bible: {
            versions: [],
            active_bible_index: null,
            /* Came from database */

            Books: [],
            Shorts: [],
            Chapters: 0,
            Verses: [],
            /* Parsed numbers */

            Book: null,
            Chapter: null,
            Verse: null,
            Valid: false,
        },
        ui: {
            searchForm: '#bible-search-form',
            searchInput: '#bible-searchbox',
        },
        events: {
            'hover @ui.searchInput': 'focus',
            'input @ui.searchInput': 'input',
            'submit @ui.searchForm': 'prepareVerses',
        },
        initialize: function () {

            App.vent.on("bible:control:onEvent", _.bind(this.onEvent, this));

            /* Load all bibles version */
            this.Bible.versions = new App.Model.XMLBibleCollection();
            this.Bible.versions.add(new App.Model.XMLBible({
                xmlpath: "./xml/sinoid_utf.xml"
            }));

            this.Bible.active_bible_index = 0;
        },
        onShow: function () {
            var that = this;
            var active_bible = this.Bible.versions.at(this.Bible.active_bible_index);
            active_bible.activate().then(function (res, err) {
                var books = active_bible.books;
                for (var o in books) {
                    that.Bible.Shorts.push(books[o].short_name);
                }
                that.ui.searchInput.suggest(that.Bible.Shorts, {});
            });
        },
        onDestroy: function () {
            App.vent.off("bible:control:onEvent");
        },
        /******************/
        onEvent: function () {
            this.ui.searchInput.focus();
        },
        getChapter: function (bid, cid) {
            return this.Bible.versions.at(this.Bible.active_bible_index).getChapter(bid, cid);
        },
        getChapterWithVerses: function (bid, cid) {
            return this.Bible.versions.at(this.Bible.active_bible_index).getChapterWithVerses(bid, cid);
        },
        getBook: function (bid) {
            return this.Bible.versions.at(this.Bible.active_bible_index).getBook(bid);
        },
        search: function (string) {
            return this.Bible.versions.at(this.Bible.active_bible_index).search(string);
        },
        /********ч**********/

        prepareVerses: function (e) {
            e.preventDefault();
            App.Model.SearchVerseListCollection.reset([]);

            if (this.Bible.Valid == false) {

                var value = this.ui.searchInput.val();
                var result = this.search(value);

                for (var v = 0; v < result.length; v++) {

                    var verse = result[v];
                    console.log(verse);
                    var verse_book = this.getBook(verse.bid);
                    var verse_chapter = this.getChapter(verse.bid, verse.cid);

                    var bottom_text = verse_book.full_name + " " + verse_chapter.number + ":" + verse.number;
                    var short_link = verse_book.short_name + " " + verse_chapter.number + ":" + verse.number;
                    var verse_model = new App.Model.Verse();

                    verse_model.set('text', verse.text);
                    verse_model.set('bottom_text', bottom_text);
                    verse_model.set('short_link', short_link);
                    verse_model.set('cid', verse_chapter.number);
                    verse_model.set('verse', verse.number);

                    App.Model.SearchVerseListCollection.add(verse_model);
                }
                
            } else {

                /* Create Verse models from strings */

                var chapter = this.getChapterWithVerses(this.Bible.Book, this.Bible.Chapter);
                for (var v in chapter.verses) {

                    console.log(this.getBook(this.Bible.Book));
                    var bottom_text = this.getBook(this.Bible.Book).full_name + " " + chapter.number + ":" + chapter.verses[v].$.number;
                    var short_link = this.getBook(this.Bible.Book).short_name + " " + chapter.number + ":" + chapter.verses[v].$.number;
                    var verse = new App.Model.Verse();

                    verse.set('text', chapter.verses[v]._);
                    verse.set('bottom_text', bottom_text);
                    verse.set('short_link', short_link);
                    verse.set('cid', chapter.number);
                    verse.set('verse', chapter.verses[v].$.number);

                    App.Model.SearchVerseListCollection.add(verse);
                }
            }
        },
        input: function (e) {
            var full_pattern = /([0-9]?[А-Яа-яЁё]+) ([0-9]+) ([0-9]+)/i
            var first_pattern = /([0-9]?[А-Яа-яЁё]+)/i
            var value = this.ui.searchInput.val();
            var found = value.match(full_pattern);
            console.log(found);
            if (found) {

                if (this.book_validate(found[1]) == false) {
                    console.log("Book validation failed");
                    this.Bible.Valid = false;
                    return;
                }

                var chapter_number = parseInt(found[2], 10) - 1;
                var chapter = this.getChapterWithVerses(this.Bible.Book, chapter_number);

                /* If ordered only one verse */

                if (found[3]) {
                    var verse_number = parseInt(found[3], 10) - 1;
                    if (verse_number > chapter.verses.length) {
                        console.log("There is no " + verse_number + " verse");
                        this.Bible.Valid = false;
                        return;
                    }

                    this.Bible.Chapter = chapter_number;
                    this.Bible.Verse = verse_number;
                    this.Bible.Valid = true;
                    return;
                }

                console.log("Verses validation failed");
                this.Bible.Valid = false;
                return;
            }
            found = value.match(first_pattern);
            if (found) {

                if (this.book_validate(found[1]) == false) {
                    this.Bible.Valid = false;
                }
            }
        },
        book_validate: function (found) {

            /* Check for valid book */

            var that = this;
            var lowercase_input = found.toLowerCase();
            var short_valid = false;

            this.Bible.Shorts.forEach(function (item, i) {
                var lowercase_short = item.toLowerCase();
                if (lowercase_input == lowercase_short) {
                    short_valid = true;
                    that.Bible.Book = i;
                    return short_valid;
                }
            });

            return short_valid;
        },
        focus: function (e) {

            win.log("focus request");
            e.focus();
        },
    });

}(window.App));
