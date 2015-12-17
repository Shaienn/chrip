/* Bible tab control screen */

(function (App) {
    'use strict'

    App.View.Bible.Control.Search = Backbone.Marionette.ItemView.extend({
        template: '#bible-search-tpl',
        id: 'bible-search-contain',
        Bible: {
            /* Came from database */

            Books: [],
            Shorts: [],
            Chapters: 0,
            Verses: [],
            /* Parsed numbers */

            Book: 0,
            Chapter: {},
            Selected: [],
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

        },
        onShow: function () {

            this.loadBooks();

        },
        onDestroy: function () {

            App.vent.off("bible:control:onEvent");
        },
        /******************/

        onEvent: function () {
            this.ui.searchInput.focus();
        },
        loadBooks: function () {
            var that = this;
            App.Database.loadBibleBooks().then(function (loadedBooks) {
                that.Bible.Books = loadedBooks;
                for (var o in loadedBooks) {
                    that.Bible.Shorts.push(loadedBooks[o].short_name)
                }

                that.ui.searchInput.suggest(that.Bible.Shorts, {});

            });
        },
        loadChapter: function (bid, cid) {
            var that = this;

            var d = Q.defer();
            App.Database.loadBibleChapter(bid, cid).then(function (loadedChapter) {

                /* Parse chapter for verses */

                that.Bible.Verses = loadedChapter.split('\n');
                d.resolve(true);
            });

            return d.promise;
        },
        /******************/

        prepareVerses: function (e) {
            e.preventDefault();
            var pattern = /([0-9]+)(.+)/i
            var that = this;
            App.Model.SearchVerseListCollection.reset([]);

            if (this.Bible.Valid == false) {

                /* Here we just search input text in bible */

                var value = this.ui.searchInput.val();
                var check_value = value.replace(/[*^+?]/g, "").toLowerCase();
                console.log(value);

                App.Database.searchBibleVerse(value).then(function (loadedChapters) {

                    for (var i = 0; i < loadedChapters.length; i++) {

                        var current_lines = loadedChapters[i].content.split('\n');

                        /* Find exact verse that contain searching string */

                        for (var j = 0; j < current_lines.length; j++) {
                            if (current_lines[j].toString().toLowerCase().indexOf(check_value) > -1) {

                                var found = current_lines[j].match(pattern);
                                if (found) {
                                    var text = found[2].trim();
                                    console.log(that.Bible.Shorts);
                                    console.log(loadedChapters[i].bid);
                                    var bottom_text = that.Bible.Shorts[loadedChapters[i].bid] + " " + loadedChapters[i].cid + ":" + found[1].trim();

                                    var verse = new App.Model.Verse();

                                    verse.set('text', text);
                                    verse.set('bottom_text', bottom_text);
                                    verse.set('cid', loadedChapters[i].cid);
                                    verse.set('verse', found[1].trim());

                                    App.Model.SearchVerseListCollection.add(verse);
                                }
                            }

                        }
                    }
                });

                return;

            } else {

                /* Create Verse models from strings */

                var verses_lines = this.Bible.Chapter.content.split('\n');


                for (var s in verses_lines) {
                    var found = verses_lines[s].match(pattern);
                    if (found) {
                        var text = found[2].trim();
                        var bottom_text = this.Bible.Shorts[this.Bible.Book] + " " + this.Bible.Chapter.cid + ":" + found[1].trim();

                        var verse = new App.Model.Verse();

                        verse.set('text', text);
                        verse.set('bottom_text', bottom_text);
                        verse.set('cid', this.Bible.Chapter.cid);
                        verse.set('verse', found[1].trim());

                        App.Model.SearchVerseListCollection.add(verse);
                    }
                }
            }
        },
        input: function (e) {

            var that = this;
            var full_pattern = /([0-9]?[А-Яа-яЁё]+) ([0-9]+) ([0-9]+)/i
            var first_pattern = /([0-9]?[А-Яа-яЁё]+)/i
            var value = this.ui.searchInput.val();

            var found = value.match(full_pattern);
            if (found) {

                if (this.book_validate(found[1]) == false) {
                    this.Bible.Valid = false;
                    return;
                }

                var chapter = parseInt(found[2], 10);

                App.Database.loadBibleChapter(this.Bible.Books[this.Bible.Book].id, chapter).then(function (loadedChapter) {

                    /* Parse chapter for verses */

                    that.Bible.Chapter = loadedChapter;

                    /* If ordered only one verse */

                    if (found[3]) {
                        var verse = parseInt(found[3], 10);
                        if (verse > that.Bible.Chapter.verses) {
                            console.log("There is no " + verse + " verse");
                            that.Bible.Valid = false;
                            return;
                        }

                        that.Bible.Selected = verse;
                        that.Bible.Valid = true;
                        return;
                    }

                    console.log("Verses validation failed");
                    that.Bible.Valid = false;
                    return;

                }, function (err) {
                    console.log("got error");
                });

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
                    that.Bible.Chapters = that.Bible.Books[i].chapters;
                    return;
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
