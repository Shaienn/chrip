/**
 * Created by shaienn on 24.09.15.
 */

(function (App) {
    'use strict';

    var InputAreaView = Backbone.Marionette.ItemView.extend({

        template: '#inputarea-tpl',
        className: 'inputarea-contain',
        grammar_file: "./src/app/grammar.txt",
        grammar_loaded: false,
        background_song: {},
        refresh_timer: {},
        loaded_text: "",

        ui: {

            textarea: '#songeditor_input_textarea',
            chords: 'div span.chord',

        },

        events: {
            'input #songeditor_input_textarea': 'change_handler',
        },


        initialize: function () {
            this.load_grammar();

            if (this.options.loaded_text != "undefined") {
                this.loaded_text = this.options.loaded_text;
            }

        },

        onShow: function () {
            this.ui.textarea.val(this.loaded_text);
            this.insert_backgrounds();
            this.change_handler();
        },


        change_handler: function () {

            console.log("update");

            var that = this;
            window.clearTimeout(this.refresh_timer);

            this.refresh_timer = window.setTimeout(
                function () {
                    that.update_markup();
                }, 500);
        },


        update_markup: function () {

            var raw_text = this.ui.textarea.val();
            var clean_text = this.clean_newlines(raw_text);
            var parsed_text;
            var no_errors = true;
            try {
                parsed_text = this.peg.parse(clean_text);
            } catch (exception) {
                no_errors = false;
                parsed_text = this.insert_exception_markup(exception, clean_text);
            }

            var clean_parsed_text = this.clean_formatted_newlines(parsed_text);

            this.background_song.innerHTML = clean_parsed_text;
            $("p").find("s").each(function () {
                $(this).append("<div class='slide_mark'>slide</div>");
            });

            if (no_errors) {
                App.vent.trigger('preview:update_song', clean_parsed_text);
                App.vent.trigger('preview:update_slides', clean_text);
            } else {
                App.vent.trigger('preview:update_song', "");
                App.vent.trigger('preview:update_slides', "");
            }
        },

        insert_exception_markup: function (exception, text) {
            var line = exception.location.start.line - 1;
            var column = exception.location.start.column - 1;
            var max_line = (text.match(/\n/g) || []).length;
            if (line == max_line) {
                line -= 1;
            }

            var regex_model = '^((?:[^\\n]*\\n){@line})([^\\n]{@column})([^\\n]?)([^\\n]*)((?:\\n.*)*)$';
            regex_model = regex_model.replace('@line', line);
            regex_model = regex_model.replace('@column', column);
            var regex = new RegExp(regex_model);

            var matches = text.match(regex);

            var formatted_text = matches[1];
            formatted_text += '<span class="error-line">';
            formatted_text += matches[2];
            formatted_text += '<span class="error-char">';
            formatted_text += matches[3];
            formatted_text += '</span>';
            formatted_text += matches[4];
            formatted_text += '</span>';
            formatted_text += matches[5];

            return formatted_text;
        },


        insert_backgrounds: function () {

            var background_model = document.createElement('div');
            background_model.className = "chordpro-song-editor";

            var background_song = background_model.cloneNode(false);

            this.ui.textarea[0].parentNode.insertBefore(background_song, this.ui.textarea[0]);
            this.background_song = background_song;

        },

        clean_formatted_newlines: function (text) {
            // remove first newline and add a trailing newline
            return text.slice(1) + "\n";
        },

        clean_newlines: function (text) {
            var clean_text = "";
            // add a leading newline
            clean_text = '\n' + text;
            // only "\n" type are considered
            clean_text = clean_text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            // add a trailing newline if missing
            if (clean_text.slice(-1) != '\n') {
                clean_text += '\n';
            }
            return clean_text;
        },


        load_grammar: function () {
            this.load_file(this.grammar_file, this.parse_grammar);
        },

        parse_grammar: function (text) {

            win.log("Grammar init complete");
            //this.prevent_chord_overlapping();
        },

        load_file: function (filepath, success_callback) {

            win.log("load file: " + filepath);
            var that = this;
            fs.readFile(filepath, 'utf8', function (err, content) {

                if (err) {
                    console.log("err: " + err);
                    return;
                }

                console.log("content: " + content.toString());
                that.peg = PEG.buildParser(content.toString());
                that.grammar_loaded = true;

            });
        },

        prevent_chord_overlapping: function () {

            var line = -1;
            var offsetX = 0;
            var that = this;
            this.ui.chords.each(function () {

                var chord = $(this)[0];

                win.log(chord);

                if (chord.offsetWidth > 0) {
                    return setTimeout(that.prevent_chord_overlapping(), 500);
                }

                var rect = chord.getBoundingClientRect();
                if (rect.top == line && rect.left < offsetX) {
                    chord.style.marginLeft = (offsetX - rect.left) + "px";
                    rect = chord.getBoundingClientRect();
                }

                console.log(chord.textContent + ": " + rect.left + " w" + chord.scrollWidth + " o " + offsetX + " l" + rect.top);
                line = rect.top;
                offsetX = rect.left + chord.scrollWidth;
            });

        }

    });

    App.View.InputAreaView = InputAreaView;

}(window.App));