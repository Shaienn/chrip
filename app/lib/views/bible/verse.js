(function (App) {
    'use strict'

    App.View.Bible.VerseSlide = Backbone.Marionette.ItemView.extend({
        template: "#verse-slide-tpl",
        className: 'bible-slide-item',
        background_loaded: false,
        ui: {
            background: ".slide_background",
            verse_text: ".slide-verse-text",
            verse_link: ".slide-verse-link",
        },
        initialize: function () {
            $(window).on("resize", _.bind(this.onShow, this));
        },
        onShow: function () {
            var that = this;

            /* We wait first time until loading background image, 
             * cause container dimensions for boxfit() depends on it */

            if (this.background_loaded) {
                console.log("ready");
                this.ui.verse_text.boxfit({multiline: true});
            } else {
                this.ui.verse_text.hide();
                this.ui.background.load(function () {
                    console.log("loaded");
                    that.ui.verse_text.show();
                    that.ui.verse_text.boxfit({multiline: true});
                    that.background_loaded = true;
                });
            }

        },
        onDestroy: function () {
            $(window).off("resize", this.onShow);
        },
    });
}(window.App));