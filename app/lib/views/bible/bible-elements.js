(function (App) {
    'use strict'

    /* TODO remove boxfit and left only one fit text plugin for all purposes */

    App.View.Bible.SingleVerseSlide = App.View.Common.Slides.Slide.extend({
	template: "#verse-slide-tpl",
	className: 'bible-element-' + App.View.Common.Slides.Slide.prototype.className,
	background_loaded: false,
	ui: {
	    image: ".slide_image",
	    verse_text: ".slide-verse-text",
	    verse_link: ".slide-verse-link",
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

}(window.App));