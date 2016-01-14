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
            Settings_Tab_r: '#settings_tab',
            Content: '#content',
            TopToolbar_r: '#main-window-toptoolbar',
            InitModal: '#initializing',
        },
        tabs: [
            {
                region: "Song_Tab_r",
                startPoint: "SongService",
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
            },
            {
                region: "Settings_Tab_r",
                startPoint: "Settings",
                button: "#appmode-menu-settings-btn",
                setting: "settings",
                onEvent: "settings:control:onEvent",
                offEvent: "settings:control:offEvent",
            },
        ],
        initialize: function () {

            that = this;
            this.nativeWindow = require('nw.gui').Window.get();

            /* Assign events */

            this.listenTo(App.vent, 'appmode:switch_tab_to', this.switchTabTo);
//            this.listenTo($(App.ControlWindow.window.document), 'keydown', this.keyHandler);


//            App.vent.on('appmode:switch_tab_to', this.switchTabTo);
//            App.vent.on('main-window:toggle_presentation_state', _.bind(this.togglePresentationState, this));
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
                    App.active_mode = App.active_mode == true ? false : true;
                    console.log("Freeze is " + App.active_mode);
                    App.vent.trigger("main_toolbar:set_freeze_mode_indication", App.active_mode);
                }

                /* CTRL + B => switch black screen mode */

                if (key == 66) {
                    App.vent.trigger("presentation:toggle_black_mode");
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
                    App.Database.getVersion().then(function () {

                        App.Update.init();

                        /* Menu */

                        that.Menu.show(new App.View.AppModeMenu());

                        /* Top toolbar */

                        that.TopToolbar_r.show(new App.View.MainWindow.TopToolbar);

                        App.vent.trigger("main_toolbar:set_freeze_mode_indication", App.freeze_mode);
                        App.vent.trigger("main_toolbar:set_black_mode_indication", App.black_mode);

                        for (var i in that.tabs) {
                            var tab = that.tabs[i];
                            var region = that.getRegion(tab.region);
                            var view = new App.View[tab.startPoint].Root;
                            region.show(view);
                            var tabContainer = $(that.getRegion(tab.region).el);
                            tabContainer.hide();
                            $(tab.button).removeClass('active');
                        }

                        that.switchTabTo("songservice");



                        /* Application is ready to work */

//                        App.vent.trigger('main:ready');

                        console.log("Ready");

                    });
                });
            });
        }
    });

}(window.App));
