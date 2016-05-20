'use strict';
(function (App) {

    var that;
    App.View.Media.Control = Marionette.ItemView.extend({
	template: "#media-control-tpl",
	className: "media-control",
	firstTime: true,
	seekDrag: false,
	volDrag: false,
	main_context: null,
	vlc_not_installed: false,
	contexts: [],
	vlc: null,
	ui: {
	    wrapper: '.wcp-wrapper',
	    center: '.wcp-center',
	    canvas: '#media-control-canvas',
	    time_current: '.wcp-time-current',
	    time_total: '.wcp-time-total',
	    progress_seen: ".wcp-progress-seen",
	    progress_bar: ".wcp-progress-bar",
	    tooltip: ".wcp-tooltip",
	    tooltip_inner: ".wcp-tooltip-inner",
	    vol_bar: ".wcp-vol-bar",
	    vol_bar_full: ".wcp-vol-bar-full",
	    vol_bar_pointer: ".wcp-vol-bar-pointer",
	    vol_control: ".wcp-vol-control",
	    vol_button: ".wcp-vol-button",
	    play_button: ".wcp-play",
	},
	events: {
	    'click .wcp-button': 'generalBtnHandler',
	},
	generalBtnHandler: function (e) {
	    var button = $(e.currentTarget);

	    if (button.hasClass("wcp-pause")) {
		that.mediaPause();
		return;
	    }

	    if (button.hasClass("wcp-play")) {
		that.mediaPlay();
		return;
	    }
	},
	mediaPlay: function () {
	    var button = $(".wcp-button.wcp-play");
	    if (button.length > 0) {

		if (this.vlc.playing == false) {

		    win.log("mediaPlay");

		    if (this.contexts.length == 0 && App.active_mode == true) {
			App.vent.trigger("presentation:set_new_element", this.media_element);
		    }

		    /* Stopped */

		    if (this.vlc.state == 5 || this.vlc.state == 0) {
			win.log("stopped");
			this.vlc.play(this.media_element.get('mrl'));
		    }

		    /* Paused */

		    else if (this.vlc.state == 4) {
			win.log("paused");
			this.vlc.play();
		    }

		    button.removeClass("wcp-play").addClass("wcp-pause");
		}
	    }
	},
	mediaPause: function () {
	    var button = $(".wcp-button.wcp-pause");
	    if (button.length > 0) {
		if (this.vlc.playing) {
		    win.log("mediaPause");
		    button.removeClass("wcp-pause").addClass("wcp-play");
		    this.vlc.pause();
		}
	    }
	},
	mediaStop: function () {
	    var button = $(".wcp-button.wcp-pause");
	    if (button.length > 0) {
		if (this.vlc.playing) {
		    win.log("mediaStop");
		    button.removeClass("wcp-pause").addClass("wcp-play");
		    this.vlc.stop();
		    this.contexts = [];
		}
	    }
	},
	initialize: function (options) {
	    that = this;
	    if (options.media_element != "undefined") {
		this.media_element = options.media_element;
	    }

	    try {
		this.wcjs = require("WebChimera.js");
		this.vlc_not_installed = false;
		this.listenTo(App.vent, "mediaplayer:pause", _.bind(this.mediaPause, this));
		this.listenTo(App.vent, "mediaplayer:play", _.bind(this.mediaPlay, this));
		this.listenTo(App.vent, "mediaplayer:stop", _.bind(this.mediaStop, this));

		this.listenTo(App.vent, "mediaplayer:add_video_context", _.bind(this.addVideoContext, this));
		this.listenTo(App.vent, "resize", _.bind(this.onResize, this));
		this.listenTo(App.vent, "active_mode_changed", _.bind(this.onResize, this));

		this.vlc = this.wcjs.createPlayer();

		this.vlc.onFrameReady = function (frame) {
		    that.main_context.render(frame, frame.width, frame.height, frame.uOffset, frame.vOffset);
		    for (var i = 0; i < that.contexts.length; i++) {
			that.contexts[i].render(frame, frame.width, frame.height, frame.uOffset, frame.vOffset);
		    }
		}
	    } catch (e) {
		console.log(e);
		this.wcjs = null;
		this.vlc_not_installed = true;
	    }
	},
	onShow: function () {
	    console.log("onShow");

	    if (this.vlc_not_installed) {
		this.ui.center.html('VLC player is not installed. Please install for media funcionality.');
	    } else {
		this.main_context = require("webgl-video-renderer").setupCanvas(this.ui.canvas[0]);
		if (typeof this.main_context == "undefined") {
		    console.log("We can`t configure GL context. Sorry");
		    return;
		}

		this.playerInterfaceInit();
		this.vlc.onTimeChanged = this.onTimeChanged;
		this.vlc.onPositionChanged = this.onPositionChanged;
		this.vlc.onPlaying = this.onPlaying;
		this.vlc.onPaused = this.onPaused;
		this.vlc.onStopped = this.onStopped;
	    }


	},
	onDestroy: function () {
	    if (this.vlc_not_installed) {

	    } else {
		this.vlc.stop();
	    }
	},
	onActiveModeChanged: function (new_state) {

	    /* If active mode changed while player was stopped */

	    if (new_state === false && this.vlc.playing === false) {

		/* Remove additional context */

		that.contexts = [];

	    }
	},
	onPaused: function () {
	    if (App.active_mode === false) {
		that.contexts = [];
	    }
	},
	onStopped: function () {
	    if (App.active_mode === false) {
		that.contexts = [];
	    }
	},
	onResize: function () {

	    /* Get video aspect ratio from canvas.
	     Renderer already set canvas to video dimension */

	    var sourceAspect = this.ui.canvas.width() / this.ui.canvas.height();
	    var destAspect = this.ui.wrapper.width() / this.ui.wrapper.height();
	    var canvasParent = this.ui.canvas.parent();

	    if (destAspect > sourceAspect) {

		canvasParent.css("height", "100%");
		canvasParent.css("width", ((this.ui.wrapper.height() * sourceAspect) / this.ui.wrapper.width()) * 100 + "%");

	    } else {

		canvasParent.css("width", "100%");
		canvasParent.css("height", ((this.ui.wrapper.width() * sourceAspect) / this.ui.wrapper.height()) * 100 + "%");
	    }

	    this.ui.canvas.css("width", "100%");
	},
	addVideoContext: function (context_canvas) {
	    var new_context = require("webgl-video-renderer").setupCanvas(context_canvas);
	    if (typeof new_context != "undefined") {
		this.contexts.push(new_context);
	    } else {
		console.log("We can`t configure GL context. Sorry");
	    }
	},
	playerInterfaceInit: function () {

	    /* General click and move over player surface  */

	    this.ui.wrapper.mouseup(this.mouseClickEnd);

	    this.ui.wrapper.mousemove(this.mouseMoved);

	    /* Bars */

	    this.ui.progress_bar.hover(
		    this.selectNewProgressPosition,
		    this.hideNewProgressPosition
		    );

	    this.ui.progress_bar.mousemove(
		    this.selectNewProgressPosition
		    );

	    this.ui.progress_bar.mousedown(
		    function (e) {
			that.seekDrag = true;
			var rect = that.ui.wrapper[0].getBoundingClientRect();
			var p = (e.pageX - rect.left) / that.ui.progress_bar.width();
			that.ui.progress_seen.css("width", (p * 100) + "%");
		    }
	    );

	    this.ui.vol_control.mouseout(
		    function () {
			if (
				!(that.ui.vol_control.is(":hover")) &&
				!(that.ui.vol_bar.is(":hover")) &&
				!(that.ui.vol_button.is(":hover")) &&
				!that.volDrag) {

			    that.ui.vol_control.animate({width: 0}, 200);
			}
		    }
	    );

	    this.ui.vol_button.hover(
		    function () {
			that.ui.vol_control.animate({width: 133}, 200);
		    },
		    function () {
			setTimeout(
				function () {
				    if (!(that.ui.vol_control.is(":hover")) && !that.volDrag) {
					that.ui.vol_control.animate({width: 0}, 200);
				    }
				}, 500);
		    });

	    this.ui.vol_bar.mousedown(
		    function (e) {
			that.volDrag = true;
			var rect = that.ui.vol_bar[0].getBoundingClientRect();
			var p = (e.pageX - rect.left) / that.ui.vol_bar.width();
			that.changeVolume(Math.floor(p * 200) + 5);
		    }
	    );


	},
	/************************* Helpers ***************************/

	parseTime: function (t, total) {

	    if (typeof total === 'undefined')
		total = t;
	    var tempHour = ("0" + Math.floor(t / 3600000)).slice(-2);
	    var tempMinute = ("0" + (Math.floor(t / 60000) % 60)).slice(-2);
	    var tempSecond = ("0" + (Math.floor(t / 1000) % 60)).slice(-2);
	    if (total >= 3600000)
		return tempHour + ":" + tempMinute + ":" + tempSecond;
	    else
		return tempMinute + ":" + tempSecond;
	},
	/******************* Player control ********************/

	onPlaying: function () {

	    if (that.firstTime) {
		console.log("Playing");
		that.onResize();
		that.firstTime = false;
	    }

	},
	onPositionChanged: function (position) {

	    $(that.ui.progress_seen).css("width", (position * 100) + "%");

	},
	onTimeChanged: function (t) {

	    if (t > 0) {

		var t_str = that.parseTime(t, that.vlc.length);
		$(that.ui.time_current).text(t_str);

	    } else if ($(that.ui.time_current).text() != ""
		    && $(that.ui.time_total).text() != "") {

		$(that.ui.time_current).text("");
	    }

	},
	/******************* Player interface ********************/

	mouseMoved: function (e) {
	    if (that.seekDrag) {
		var rect = that.ui.wrapper[0].getBoundingClientRect();
		var p = (e.pageX - rect.left) / (rect.right - rect.left);
		that.ui.progress_seen.css("width", (p * 100) + "%");

		var newtime = Math.floor(this.vlc.length * ((e.pageX - rect.left) / that.ui.wrapper.width()));
		if (newtime > 0) {
		    that.ui.tooltip_inner.text(that.parseTime(newtime));
		    var offset = Math.floor(that.ui.tooltip.width() / 2);
		    if (e.pageX >= (offset + rect.left) && e.pageX <= (rect.right - offset)) {

			that.ui.tooltip.css("left", ((e.pageX - rect.left) - offset) + "px");
		    } else if (e.pageX < (rect.left + offset)) {

			that.ui.tooltip.css("left", rect.left + "px");
		    } else if (e.pageX > (rect.right - offset)) {

			that.ui.tooltip.css("left", (rect.right - that.ui.tooltip.width()) + "px");
		    }

		    that.ui.tooltip.show();
		}
	    }

	    if (that.volDrag) {
		var rect = that.ui.vol_bar[0].getBoundingClientRect();
		p = (e.pageX - rect.left) / (rect.right - rect.left);
		that.changeVolume(Math.floor(200 * p) + 5);
	    }
	},
	mouseClickEnd: function (e) {


	    if (that.seekDrag) {
		var rect = that.ui.wrapper[0].getBoundingClientRect();
		that.seekDrag = false;
		var p = (e.pageX - rect.left) / (rect.right - rect.left);
		that.ui.progress_seen.css("width", (p * 100) + "%");
		that.vlc.position = p;
		that.ui.time_current.text(that.ui.tooltip_inner.text());
	    }

	    if (that.volDrag) {
		that.volDrag = false;
		var rect = that.ui.vol_bar[0].getBoundingClientRect();

		if (e.pageX >= rect.right) {
		    p = 1;
		    setTimeout(function () {
			that.ui.vol_control.animate({width: 0}, 200);
		    }, 1500);

		} else if (e.pageX <= rect.left) {
		    p = 0;
		    setTimeout(function () {
			that.ui.vol_control.animate({width: 0}, 200);
		    }, 1500);
		} else {

		    p = (e.pageX - rect.left) / (rect.right - rect.left);
		    if (e.pageY < rect.top)
			setTimeout(function () {
			    that.ui.vol_control.animate({width: 0}, 200);
			}, 1500);
		    else if (e.pageY > rect.bottom)
			setTimeout(function () {
			    that.ui.vol_control.animate({width: 0}, 200);
			}, 1500);
		}
		that.changeVolume(Math.floor(200 * p) + 5);
	    }

	},
	hideNewProgressPosition: function (e) {
	    if (that.seekDrag == false) {
		that.ui.tooltip.hide();
	    }
	},
	selectNewProgressPosition: function (e) {
	    if (that.vlc.length) {

		var rect = that.ui.wrapper[0].getBoundingClientRect();
		if (e.pageX >= rect.left && e.pageX <= rect.right) {

		    var newtime = Math.floor(that.vlc.length * ((e.pageX - rect.left) / that.ui.wrapper.width()));
		    if (newtime > 0) {

			that.ui.tooltip_inner.text(that.parseTime(newtime));
			var offset = Math.floor(that.ui.tooltip.width() / 2);
			if (e.pageX >= (offset + rect.left) && e.pageX <= (rect.right - offset)) {

			    that.ui.tooltip.css("left", ((e.pageX - rect.left) - offset) + "px");
			} else if (e.pageX < (rect.left + offset)) {

			    that.ui.tooltip.css("left", rect.left + "px");
			} else if (e.pageX > (rect.right - offset)) {

			    that.ui.tooltip.css("left", (rect.right - that.ui.tooltip.width()) + "px");
			}

			that.ui.tooltip.show();
		    }
		} else {

		    that.ui.tooltip.hide();
		}
	    }
	},
	changeVolume: function (newVolume) {

	    if (typeof newVolume !== 'undefined' && !isNaN(newVolume) && newVolume >= 0 && newVolume <= 5) {
		this.lastVolume = this.vlc.volume;
		this.vlc.volume = 0;

		if (!this.vlc.mute) {

		}

	    } else if (newVolume && !isNaN(newVolume) && newVolume > 5 && newVolume <= 200) {

		if (this.vlc.mute) {
		    this.vlc.mute = false;
		}

		this.ui.vol_button.removeClass("wcp-mute");

		if (newVolume > 150) {

		    this.ui.vol_button
			    .removeClass("wcp-volume-medium")
			    .removeClass("wcp-volume-low")
			    .addClass("wcp-volume-high");

		} else if (newVolume > 50) {

		    this.ui.vol_button
			    .removeClass("wcp-volume-high")
			    .removeClass("wcp-volume-low")
			    .addClass("wcp-volume-medium");

		} else {

		    this.ui.vol_button
			    .removeClass("wcp-volume-medium")
			    .removeClass("wcp-volume-high")
			    .addClass("wcp-volume-low");
		}

		this.ui.vol_bar_full.css("width", (((newVolume / 200) * parseInt(this.ui.vol_bar.css("width"))) - parseInt(this.ui.vol_bar_pointer.css("width"))) + "px");
		this.vlc.volume = parseInt(newVolume);

	    } else
		return this.vlc.volume;
	},
    });

})(window.App);
