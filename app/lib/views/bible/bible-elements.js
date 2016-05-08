(function (App) {
    'use strict'

    App.View.Bible.Slides.Slide = App.View.Common.Slides.Slide.extend({
	template: "#chapter-slide-tpl",
	tagName: "div",
	className: 'bible-element-' + App.View.Common.Slides.Slide.prototype.className,
	ui: {
	    image: ".slide_image",
	    verse_text: ".slide-chapter-text",
	    verse_link: ".slide-chapter-link",
	},
	onShow: function () {
	    var self = this;
	    this.bindUIElements();

	    /* We wait first time until loading background image, 
	     * cause container dimensions for textFit() depends on it */

	    if (this.image_loaded) {
		this.ui.verse_text.textFit({
		    multiline: true,
		});
	    } else {
		this.ui.verse_text.hide();
		this.ui.image.load(function () {
		    self.ui.verse_text.show();
		    self.ui.verse_text.textFit({
			multiline: true,
		    });
		    self.image_loaded = true;
		});
	    }

	}
    });

}(window.App));