/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';
    var Q = require('q');
    var xml2js = require('xml2js');
    var fs = require('fs');
    App.Model.XMLBible = Backbone.Model.extend({
        defaults: {
            xmlpath: null,
            bible: null,
            books: [],
            valid: false,
        },
        initialize: function (options) {
            console.log("init");
            this.xmlpath = options.xmlpath;
        },
        activate: function () {
            var that = this;
            var d = Q.defer();
            var parser = new xml2js.Parser();
            fs.readFile(this.xmlpath, function (err, data) {

                if (err != null) {
                    console.log("Load bible file: " + err);
                    that.valid = false;
                    d.reject(false);
                }

                console.log("Bible file: " + that.xmlpath);
                parser.parseString(data, function (err, result) {

                    if (err != null) {
                        console.log("Parse bible file: " + err);
                        that.valid = false;
                        d.reject(false);
                    }

                    console.log("Bible version: " + that.xmlpath);


                    var loadedBooks = [];
                    for (var b = 0; b < result.BIBLE.BOOK.length; b++) {
                        loadedBooks.push({
                            id: b,
                            full_name: result.BIBLE.BOOK[b].$.name,
                            short_name: result.BIBLE.BOOK[b].$.short,
                            chapters: result.BIBLE.BOOK[b].CHAPTER.length,
                        });
                    }
                    console.log(loadedBooks);

                    that.bible = result;
                    that.books = loadedBooks;
                    that.valid = true;
                    d.resolve(true);
                });
            });
            return d.promise;
        },
        getInfo: function () {
            if (this.valid) {
                var bible_obj = {
                    translate: this.bible.BIBLE.$.translate,
                    xmlpath: this.xmlpath
                };
                return bible_obj;
            }
        },
        getBook: function (bid) {
            if (this.valid == false)
                return null

            if (typeof (this.bible.BIBLE.BOOK[bid]) == "undefined") {
                console.log("There is no book with bid: " + bid);
                return null;
            }
            var book = {
                bid: bid,
                full_name: this.bible.BIBLE.BOOK[bid].$.name,
                short_name: this.bible.BIBLE.BOOK[bid].$.short
//                chapters: this.bible.BIBLE.BOOK[bid].CHAPTER,
            };

            return book;
        },
        getChapter: function (bid, cid) {
            if (this.valid == false)
                return null

            if (typeof (this.bible.BIBLE.BOOK[bid].CHAPTER[cid]) == "undefined") {
                console.log("There is no book with bid: " + bid + " and chapter with cid: " + cid);
                return null;
            }

            console.log(this.bible.BIBLE.BOOK[bid].CHAPTER[cid]);
            var chapter = {
                bid: bid,
                cid: cid,
                number: this.bible.BIBLE.BOOK[bid].CHAPTER[cid].$.number,
            };

            return chapter;
        },
        getChapterWithVerses: function (bid, cid) {
            if (this.valid == false)
                return null


            if (typeof (this.bible.BIBLE.BOOK[bid].CHAPTER[cid]) == "undefined") {
                console.log("There is no book with bid: " + bid + " and chapter with cid: " + cid);
                return null;
            }
            var chapter = {
                bid: bid,
                cid: cid,
                number: this.bible.BIBLE.BOOK[bid].CHAPTER[cid].$.number,
                verses: this.bible.BIBLE.BOOK[bid].CHAPTER[cid].LINE,
            };

            return chapter;
        },
        search: function (search_string) {
            if (this.valid) {

                console.log(search_string);
                var search_result = [];
                var search_regexp = new RegExp(search_string, 'i');

                for (var b in this.bible.BIBLE.BOOK) {

                    for (var c in this.bible.BIBLE.BOOK[b].CHAPTER) {

                        for (var l in this.bible.BIBLE.BOOK[b].CHAPTER[c].LINE) {

                            var line = this.bible.BIBLE.BOOK[b].CHAPTER[c].LINE[l];
                            var text = line._;
                            var found = text.match(search_regexp);

                            if (found) {
                                search_result.push({
                                    bid: b,
                                    cid: c,
                                    number: line.$.number,
                                    text: line._
                                });
                            }

                        }
                    }
                }
                return search_result;
            }
        }
    });
    App.Model.XMLBibleCollection = Backbone.Collection.extend({
        model: App.Model.XMLBible,
    });
})(window.App);
