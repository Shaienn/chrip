(function (App) {
    'use strict'

    /* TODO remove boxfit and left only one fit text plugin for all purposes */

    App.View.Bible.SingleVerseSlide = App.View.Common.Slides.Slide.extend({
	template: "#chapter-slide-tpl",
	tagName: "div",
	className: 'bible-element-' + App.View.Common.Slides.Slide.prototype.className,
	ui: {
	    image: ".slide_image",
	    verse_text: ".slide-chapter-text",
	    verse_link: ".slide-chapter-link",
	},
	onShow: function () {
	    var that = this;
	    this.bindUIElements();

	    /* We wait first time until loading background image, 
	     * cause container dimensions for boxfit() depends on it */

	    if (this.image_loaded) {
		this.ui.verse_text.textFit({
		    multiline: true,
		});
	    } else {
		this.ui.verse_text.hide();
		this.ui.image.load(function () {
		    that.ui.verse_text.show();
		    that.ui.verse_text.textFit({
			multiline: true,
		    });
		    that.image_loaded = true;
		});
	    }

	}
    });

}(window.App));