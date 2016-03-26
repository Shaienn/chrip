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
	    BlockScreens_Tab_r: '#blockscreens_tab',
	    Settings_Tab_r: '#settings_tab',
	    Content: '#content',
	    BottomBar_r: '#main-window-bottom-bar',
	    InitModal: '#initializing',
	},
	tabs: [
	    {
		region: "Song_Tab_r",
		startPoint: "SongService",
		button: "#appmode-menu-songservice-btn",
		setting: "songservice",
		onEvent: "songservice:control:onEvent",
		offEvent: "songservice:control:offEvent",
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
		startPoint: "Media",
		button: "#appmode-menu-media-btn",
		setting: "media",
		onEvent: "media:control:assignKeys",
		offEvent: "media:control:freeKeys",
	    },
	    {
		region: "BlockScreens_Tab_r",
		startPoint: "BlockScreens",
		button: "#appmode-menu-slides-btn",
		setting: "blockscreens",
		onEvent: "blockscreens:control:onEvent",
		offEvent: "blockscreens:control:offEvent",
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
	    $(App.ControlWindow.window.document).on('keydown', this.keyHandler);
	    $(App.ControlWindow.window).on("resize", function () {
		App.vent.trigger("resize");
	    });


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
		    App.vent.trigger("active_mode_changed", App.active_mode);
		}

		/* CTRL + B => switch black screen mode */

		if (key == 66) {
		    App.vent.trigger("presentation:toggle_black_mode");
		}
	    } else {

		/* F5 */

		if (key == 116) {
		    App.Presentation.toggle_presentation();
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

		    App.Update.init();

		    /* Menu */

		    that.Menu.show(new App.View.AppModeMenu());

		    /* Top toolbar */

		    that.BottomBar_r.show(new App.View.MainWindow.BottomBar);

		    App.vent.trigger("active_mode_changed", App.active_mode);
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

		    App.SplashScreen.close();
		    //win.show();
		    win.maximize();
		    win.setResizable(false);

		    that.switchTabTo("songservice");

		});
	    });
	}
    });
}(window.App));
