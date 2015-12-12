'use strict';

(function (App) {

    var that;
    App.View.MainWindow.Root = Backbone.Marionette.LayoutView.extend({
        template: '#main-window-tpl',
        id: 'main-window',
        regions: {
            Header: '#header',
            Menu: '#appmode-menu',
            Area: '#app-area',
            Song_Tab_r: '#song_tab',
            Bible_Tab_r: '#bible_tab',
            Media_Tab_r: '#media_tab',
            Content: '#content',
            TopToolbar_r: '#main-window-toptoolbar',
            InitModal: '#initializing',
        },
        tabs: [
            {
                region: "Song_Tab_r",
                startPoint: "ChurchService",
                button: "#appmode-menu-churchservice-btn",
                setting: "songservice",
                onEvent: "songservice:control:do_on_show",
                offEvent: "songservice:control:do_on_hide",
            },
            {
                region: "Bible_Tab_r",
                startPoint: "Bible",
                button: "#appmode-menu-bible-btn",
                setting: "bible",
                onEvent: "bible:control:onEvent",
                offEvent: "bible:control:freeKeys",
            },
            {
                region: "Media_Tab_r",
                startPoint: "Videoplayer",
                button: "#appmode-menu-videoplayer-btn",
                setting: "mediaplayer",
                onEvent: "mediaplayer:control:assignKeys",
                offEvent: "mediaplayer:control:freeKeys",
            }
        ],
        initialize: function () {

            that = this;
            this.nativeWindow = require('nw.gui').Window.get();

            /* Assign events */

            App.vent.on('appmode:switch_tab_to', this.switchTabTo);
            App.vent.on('main-window:toggle_presentation_state', _.bind(this.togglePresentationState, this));

            $(App.ControlWindow.window.document).on('keydown', this.keyHandler);

        },
        keyHandler: function (event) {

            /* Here we assign keys from F1 to length of tabs as F1 - first tab,
             * F2 - second etc... */

            event.stopPropagation();
            var key = event.which;

            if (event.ctrlKey) {
                if ((key >= 112) && (key < 112 + that.tabs.length)) {
                    var target = that.tabs[key - 112].setting;
                    if (target != "undefined") {
                        that.switchTabTo(target);
                    }
                }

                /* CTRL + SPACE => switch freeze mode */

                if (key == 32) {
                    App.freeze_mode = App.freeze_mode == true ? false : true;
                    console.log("Freeze is " + App.freeze_mode);
                    /* TODO call event to change indocation */
                }

            }

        },
        switchTabTo: function (target) {

            for (var i in that.tabs) {
                var tab = that.tabs[i];
                var tabContainer = $(that.getRegion(tab.region).el);

                if (target == tab.setting) {
                    tabContainer.show();
                    $(tab.button).addClass('active');
                    App.vent.trigger(tab.onEvent);
                    Settings.appMode = tab.setting;
                } else {
                    tabContainer.hide();
                    $(tab.button).removeClass('active');
                    App.vent.trigger(tab.offEvent);
                }
            }

        },
        onShow: function () {

            var that = this;

            /* Header */

            this.Header.show(new App.View.TitleBar());
            this.nativeWindow.title = App.Config.title;


            App.Database.init().then(function () {
                App.Database.loadSettings().then(function () {

                    /* Menu */

                    that.Menu.show(new App.View.AppModeMenu());

                    /* Top toolbar */

                    that.TopToolbar_r.show(new App.View.MainWindow.TopToolbar);

                    for (var i in that.tabs) {
                        var tab = that.tabs[i];
                        that.getRegion(tab.region).show(new App.View[tab.startPoint].Root());
                        var tabContainer = $(that.getRegion(tab.region).el);

                        if (Settings.appMode == tab.setting) {
                            tabContainer.show();
                            $(tab.button).addClass('active');
                        } else {
                            tabContainer.hide();
                            $(tab.button).removeClass('active');
                        }
                    }

                    that.switchTabTo(Settins.appMode);

                    /* Application is ready to work */

                    App.vent.trigger('main:ready');

                    console.log("Ready");

                });
            });
        },
        togglePresentationState: function () {

            /* Toggle presentation window */

            if (App.presentation_state == false) {

                console.log("presentation open");

                /* Create new windows */

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

                    newPresentationWindow.x = ((Settings.Utils.getScreens())[Settings.presentation_monitor]).bounds.x;
                    //App.P_Window.enterFullscreen();
                    newPresentationWindow.setAlwaysOnTop(true);
                    App.presentation_state = true;
                    App.vent.trigger("presentation:changed", true);

                    newPresentationWindow.on("closed", function () {

                        for (var i = 0; i < App.PresentationWindows.length; i++) {
                            if (App.PresentationWindows[i].routing_id == this.routing_id) {
                                App.PresentationWindows.splice(i, 1);
                                break;
                            }
                        }

                        App.presentation_state = false;
                        App.vent.trigger("presentation:changed", false);
                    });
                }

                App.PresentationWindows.push(newPresentationWindow);

            } else {

                console.log("presentation close");

                while (App.PresentationWindows.length > 0) {
                    var openedPresentationWindow = App.PresentationWindows.pop();
                    openedPresentationWindow.close();
                }
            }

        },
    });

}(window.App));
