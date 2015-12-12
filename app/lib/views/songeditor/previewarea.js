/**
 * Created by shaienn on 25.09.15.
 */

(function (App) {
    'use strict';

    var PreviewAreaView = Backbone.Marionette.ItemView.extend({

        template: '#previewarea-tpl',
        className: 'previewarea-contain',

        ui: {
            preview_content_text: '#preview_content_text',
            preview_content_slide: '#preview_content_slide'
        },

        events: {
            'click #switch_preview_content': 'switchContentHandler',
        },

        preview_mode: {},

        initialize: function () {

            App.vent.on('preview:update_song', _.bind(this.update_song, this));
            App.vent.on('preview:update_slides', _.bind(this.update_slides, this));
        },

        switchContentHandler: function () {

            if (this.preview_mode != "print") {

                this.ui.preview_content_text.css("display", "block");
                this.ui.preview_content_slide.css("display", "none");
                this.preview_mode = "print";

            } else {

                this.ui.preview_content_slide.css("display", "block");
                this.ui.preview_content_text.css("display", "none");
                this.preview_mode = "slide";

            }

        },

        onDestroy: function () {

            App.vent.off('preview:update_song');
            App.vent.off('preview:update_slides');
        },

        update_song: function (text) {

            console.log("update_song");
            this.ui.preview_content_text.html(text);


        },

        update_slides: function (text) {

            console.log("udpate slides");

            /* Get texts between slides tags */

            var that = this;
            var pattern = /\{(?:sos|start_of_slide)\}([\w\s\W\S]+?)\{(?:eos|end_of_slide)\}/g;
            var chord_pattern = /\[[\w\W\s\S]+?\]/g;
            var res;
            var promises = [];

            this.ui.preview_content_slide.html("");

            while ((res = pattern.exec(text)) != null) {

                var raw_text = res[1];

                /* remove chords */

                var pure_text = raw_text.replace(chord_pattern, "");
                promises.push(App.SlideGenerator.fromText_promise(pure_text));
            }

            Q.all(promises).then(function (slides) {
                slides.forEach(function (item) {
                    var img_container = '<img src="data:image/jpg;base64, ' + item.get('slide') + ' ">';
                    that.ui.preview_content_slide.append(img_container);
                });
            });
        },

        onShow: function () {

            console.log("preview");
        },


    });
    App.View.PreviewAreaView = PreviewAreaView;

}(window.App));
