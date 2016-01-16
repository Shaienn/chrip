(function (App) {
    'use strict'

    var BibleVerseSlideGeneral = Backbone.Marionette.ItemView.extend({
        template: "#verse-slide-tpl",
        className: 'bible-slide-item',
        background_loaded: false,
        ui: {
            background: ".slide_background",
            verse_text: ".slide-verse-text",
            verse_link: ".slide-verse-link",
        },
        initialize: function () {
            this.listenTo(App.vent, "resize", _.bind(this.onShow, this));
        },
        onShow: function () {
            var that = this;
            this.bindUIElements();

            /* We wait first time until loading background image, 
             * cause container dimensions for boxfit() depends on it */

            if (this.background_loaded) {
                this.ui.verse_text.boxfit({multiline: true});
            } else {
                this.ui.verse_text.hide();
                this.ui.background.load(function () {
                    that.ui.verse_text.show();
                    that.ui.verse_text.boxfit({multiline: true});
                    that.background_loaded = true;
                });
            }

        }
    });

    App.View.Bible.SingleVerseSlide = BibleVerseSlideGeneral.extend({});


}(window.App));