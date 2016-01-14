(function (App) {
    'use strict';

    var Presentation = {
        State: false,
        BlackMode: false,
        Windows: [],
        Elements: [],
        toggle_black_mode: function () {

            if (Presentation.State == false)
                return;

            Presentation.BlackMode = Presentation.BlackMode == true ? false : true;

            for (var i in Presentation.Windows) {

                var body = Presentation.Windows[i].window.document.body;
                var content = $(body).find("#presentation-content");

                if (Presentation.BlackMode) {
                    content.animate({opacity: 0.0}, {duration: 600});
                } else {
                    content.animate({opacity: 1.0}, {duration: 600});
                }
            }

            App.vent.trigger("main_toolbar:set_black_mode_indication", Presentation.BlackMode);
        },
        set_new_element: function (new_element) {

            if (Presentation.State == false)
                return;

            if (Presentation.BlackMode == true)
                return;

            for (var i = 0; i < Presentation.Elements; i++) {
                if (new_element instanceof Presentation.Elements[i].element) {
                    Presentation.Elements[i].handler(new_element);
                    break;
                }
            }
        },
        set_new_slide: function (slide) {
            for (var i in App.PresentationWindows) {

                var body = App.PresentationWindows[i].window.document.body;
                var content = $(body).find("#presentation-content");

                /* Find everything inside this container */

                var garbage = content.children().addClass("garbage");

                var slide_template = _.template($('#slide-tpl').html());
                content.append(slide_template({
                    background: slide.get("background"),
                    text: slide.get("text"),
                    height: slide.get("height"),
                    width: slide.get("width"),
                    number: slide.get("number"),
                    font: slide.get("font"),
                }));
                var newSlide = content.find('div.slide-container').not(".garbage");
                newSlide.find("div.slide_text span").bigText();
                newSlide.css("opacity", 0);

                newSlide.animate({opacity: 1.0}, {duration: 600, queue: false});
                garbage.animate({opacity: 0.0},
                        {
                            duration: 600,
                            queue: false,
                            complete: function () {
                                $(this).remove();
                            }
                        }
                );
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

                    newPresentationWindow.x = ((Settings.Utils.getScreens())[Settings.GeneralSettings.presentation_monitor]).bounds.x;
                    newPresentationWindow.enterFullscreen();
//                    newPresentationWindow.setAlwaysOnTop(true);
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
                }

                App.vent.trigger("presentation:changed", true);
                Presentation.State = true;
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

    Presentation.Elements = [
        {element: App.Model.SongSlide, handler: Presentation.set_new_slide},
        {element: App.Model.BibleSlide, handler: Presentation.set_new_slide}
    ];

    App.Presentation = Presentation;

})(window.App);
