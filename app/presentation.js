(function (App) {
    'use strict';


    var Presentation = {
	State: false,
	BlackMode: false,
	Windows: [],
	Elements: [
	    {
		element: "SongSlide",
		handler: function (slide) {
		    var slide_template = _.template($('#slide-tpl').html());
		    var element_body = slide_template(slide.attributes);
		    return element_body;
		},
		before: function (target) {
		    var d = Q.defer();
		    var text_span = target.find('.slide_text span');
		    var background = target.find('img.slide_image');
		    background.load(function () {
			text_span.bigText();
			d.resolve(true);
		    });

		    return d.promise;
		}
	    },
	    {
		element: "BibleSlide",
		handler: function (slide) {
		    var verse_template = _.template($('#chapter-slide-tpl').html());
		    var element_body = verse_template(slide.attributes);
		    return element_body;
		},
		before: function (target) {
		    var d = Q.defer();
		    var chapter_text = target.find('.slide-chapter-text');
		    var background = target.find('img.slide_image');
		    var chapter_link = target.find('.slide-chapter-link');

		    background.load(function () {

			chapter_link.textFit({
			    multiline: false,
			});

			chapter_text.textFit({
			    multiline: true,
			});

			d.resolve(true);
		    });

		    return d.promise;
		},
		after: function (target) {
		    var chapter_link = target.find('.slide-chapter-link');

		    chapter_link.delay(100).animate({left: 0}, {
			duration: 1500,
			specialEasing: {
			    left: "easeOutBounce"
			},
		    });
		}
	    },
	    {
		element: "Media",
		handler: function () {
		    return $("<canvas/>", {
			id: 'media-canvas'
		    })[0];
		},
		before: function (target) {
		    var d = Q.defer();
		    App.vent.trigger("mediaplayer:add_video_context", target[0]);
		    d.resolve(true);
		    return d.promise;
		}
	    }
	],
	toggle_black_mode: function () {

	    if (Presentation.State == false)
		return;

	    Presentation.BlackMode = Presentation.BlackMode == true ? false : true;

	    for (var i in Presentation.Windows) {

		var body = Presentation.Windows[i].window.document.body;
		var content = $(body).find("#presentation-content");

		if (Presentation.BlackMode) {
		    content.animate({opacity: 0.0}, {
			duration: Settings.GeneralSettings.transition_time,
			complete: function () {
			    App.vent.trigger("mediaplayer:pause");
			}});
		} else {
		    App.vent.trigger("mediaplayer:play");
		    content.animate({opacity: 1.0}, {duration: Settings.GeneralSettings.transition_time});
		}
	    }
	    App.vent.trigger("main_toolbar:set_black_mode_indication", Presentation.BlackMode);
	},
	set_new_element: function (new_element) {
	    win.log("set_new_element");

	    if (Presentation.State == false)
		return;

	    if (Presentation.BlackMode == true)
		return;

	    /* Just in case stop playing anything */

	    App.vent.trigger("mediaplayer:stop");

	    for (var i = 0; i < Presentation.Elements.length; i++) {
		if (new_element instanceof App.Model[Presentation.Elements[i].element]) {

		    var element_body = Presentation.Elements[i].handler(new_element);

		    for (var w in Presentation.Windows) {

			var body = Presentation.Windows[w].window.document.body;
			var content = $(body).find("#presentation-content");

			/* Find everything inside this container */

			var garbage = content.children().addClass("garbage");
			content.append(element_body);
			var newElement = content.children().not(".garbage");
			newElement.css("opacity", 0);
			Presentation.Elements[i].before(newElement)
				.then(function () {
				    newElement.animate({opacity: 1.0},
					    {
						duration: Settings.GeneralSettings.transition_time,
						queue: false,
						complete: function () {
						    garbage.remove();
						    Presentation.Elements[i].after(newElement);
						}
					    }
				    );
				});

		    }
		    break;
		}
	    }
	},
	toggle_presentation: function () {

	    /* Toggle presentation window */

	    if (Presentation.State == false) {

		win.log("presentation open");

		/* Create new windows */

		App.vent.on("presentation:set_new_element", Presentation.set_new_element);
		App.vent.on("presentation:toggle_black_mode", Presentation.toggle_black_mode);


		/* TODO maybe more than 1 presentation monitor... */

		var newPresentationWindow = gui.Window.get(
			window.open("./presentation.html", "presentation", {
			    "show": true,
			    "frame": false,
			    "position": "left",
			    "show_in_taskbar": false,
			})
			);

		newPresentationWindow.window.onload = function () {

		    newPresentationWindow.x = Settings.Utils.getPresentationScreen().bounds.x;
		    newPresentationWindow.enterFullscreen();
		    newPresentationWindow.setAlwaysOnTop(true);
		    newPresentationWindow.on("closed", function () {

			for (var i = 0; i < Presentation.Windows.length; i++) {
			    if (Presentation.Windows[i].routing_id == this.routing_id) {
				Presentation.Windows.splice(i, 1);
				break;
			    }
			}
			Presentation.State = false;
			App.vent.trigger("presentation:changed", false);
		    });


		    App.vent.trigger("presentation:changed", true);
		    Presentation.State = true;
		}
		Presentation.Windows.push(newPresentationWindow);
	    } else {

		win.log("Presentation window closing");

		App.vent.off("presentation:set_new_element");
		App.vent.off("presentation:toggle_black_mode");

		while (Presentation.Windows.length > 0) {
		    var openedPresentationWindow = Presentation.Windows.pop();
		    openedPresentationWindow.close();
		}
	    }

	},
    };


    App.Presentation = Presentation;

})(window.App);
