/* Bible tab control screen */

(function (App) {
    'use strict'

    App.View.Bible.Control.Search = Backbone.Marionette.ItemView.extend({
        template: '#bible-search-tpl',
        id: 'bible-search-contain',
        Bible: {
            Self: null,
            Shorts: [],
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

            this.listenTo(App.vent, "bible:control:onEvent", _.bind(this.onEvent, this));
            this.listenTo(App.vent, "bible:control:changeBibleXml", _.bind(this.activate, this));

        },
        onShow: function () {
            this.activate(Settings.BibleSettings.bible_xml);
        },
        onDestroy: function () {
        },
        /******************/
        activate: function (bible_xmlpath) {

            this.Bible.Self = new App.Model.XMLBible({
                xmlpath: bible_xmlpath
            });

            var that = this;
            this.Bible.Shorts = [];

            this.Bible.Self.activate().then(function (res, err) {
                var books = that.Bible.Self.books;
                for (var o in books) {
                    that.Bible.Shorts.push(books[o].short_name);
                }
                that.ui.searchInput.suggest(that.Bible.Shorts, {});
            });
        },
        onEvent: function () {
            this.ui.searchInput.focus();
        },
        getChapter: function (bid, cid) {
            return this.Bible.Self.getChapter(bid, cid);
        },
        getChapterWithVerses: function (bid, cid) {
            return this.Bible.Self.getChapterWithVerses(bid, cid);
        },
        getBook: function (bid) {
            return this.Bible.Self.getBook(bid);
        },
        search: function (string) {
            return this.Bible.Self.search(string);
        },
        /******************/

        prepareVerses: function (e) {
            e.preventDefault();
            App.Model.SearchVerseListCollection.reset([]);

            if (this.Bible.Valid == false) {

                var value = this.ui.searchInput.val();
                var result = this.search(value);

                for (var v = 0; v < result.length; v++) {

                    var verse = result[v];
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

                    win.log(this.getBook(this.Bible.Book));
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
            if (found) {

                if (this.book_validate(found[1]) == false) {
                    win.log("Book validation failed");
                    this.Bible.Valid = false;
                    return;
                }

                var chapter_number = parseInt(found[2], 10) - 1;
                var chapter = this.getChapterWithVerses(this.Bible.Book, chapter_number);

                /* If ordered only one verse */

                if (found[3]) {
                    var verse_number = parseInt(found[3], 10) - 1;
                    if (verse_number > chapter.verses.length) {
                        win.log("There is no " + verse_number + " verse");
                        this.Bible.Valid = false;
                        return;
                    }

                    this.Bible.Chapter = chapter_number;
                    this.Bible.Verse = verse_number;
                    this.Bible.Valid = true;
                    return;
                }

                win.log("Verses validation failed");
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
