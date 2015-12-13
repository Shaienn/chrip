'use strict';

var renderer = require("wcjs-multiscreen-renderer");

(function (App) {

    var sl_prevX = 0;
    var sl_prevY = 0;
    var that;

    App.View.MediaControl = Marionette.ItemView.extend({
        template: "#media-control-tpl",
        className: "media-control",
        firstTime: true,
        seekDrag: false,
        volDrag: false,
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
                if (App.vlc.playing) {
                    button.removeClass("wcp-pause").addClass("wcp-play");
                    App.vlc.pause();
                }
                return;
            }

            if (button.hasClass("wcp-play")) {
                if (!App.vlc.playing) {
                    button.removeClass("wcp-play").addClass("wcp-pause");
                    App.vlc.play(that.media_element.get('mrl'));
                }
                return;
            }

        },
        initialize: function (options) {

            that = this;

            if (options.media_element != "undefined") {
                this.media_element = options.media_element;
            }

            App.vent.on("presentation:changed", _.bind(this.presentationContextHandler, this));
            App.ControlWindow.on("resize", this.onResize);

            this.presentationContextHandler();
        },
        onShow: function () {

            this.playerInterfaceInit();

            App.vlc.onTimeChanged = this.onTimeChanged;
            App.vlc.onPositionChanged = this.onPositionChanged;
            App.vlc.onPlaying = this.onPlaying;

            var main_context = {
                id: "main",
                window: App.ControlWindow.window,
                canvas: this.ui.canvas[0],
                wrapper: this.ui.wrapper[0],
            };

            renderer.setMainContext(main_context);
            renderer.init(App.vlc);

        },
        onDestroy: function () {

            App.vlc.stop();
            renderer.clearCanvas();

            /* Turn off events */

            App.ControlWindow.removeAllListeners("resize");

            for (var i = 0; i < App.PresentationWindows.length; i++) {
                var currentPresWindow = App.PresentationWindows[i];
                currentPresWindow.removeAllListeners("resize");
            }

            App.vent.off("presentation:changed");
        },
        onResize: function () {

            /* Get video aspect ratio from canvas.
             Renderer already set canvas to video dimension */

            var sourceAspect = that.ui.canvas.width() / that.ui.canvas.height();
            var destAspect = that.ui.wrapper.width() / that.ui.wrapper.height();
            var canvasParent = that.ui.canvas.parent();

            /*
             console.log("src: " + that.ui.canvas.width() + " " + that.ui.canvas.height());
             console.log("dest: " + that.ui.wrapper.width() + " " + that.ui.wrapper.height());
             console.log("sourceAspect" + sourceAspect);
             console.log("destAspect" + destAspect);
             */

            if (destAspect > sourceAspect) {

                canvasParent.css("height", "100%");
                canvasParent.css("width", ((that.ui.wrapper.height() * sourceAspect) / that.ui.wrapper.width()) * 100 + "%");

            } else {

                canvasParent.css("width", "100%");
                canvasParent.css("height", ((that.ui.wrapper.width() * sourceAspect) / that.ui.wrapper.height()) * 100 + "%");
            }

            that.ui.canvas.css("width", "100%");
        },
        onPresentationResize: function () {

            for (var i = 0; i < App.PresentationWindows.length; i++) {

                var currentContext = App.PresentationWindows[i].context;

                if (currentContext == null)
                    continue;

                var contextCanvas = $(currentContext.canvas);
                var contextWrapper = $(currentContext.wrapper)

                var canvasAspect = contextCanvas.width() / contextCanvas.height();
                var destAspect = contextWrapper.width() / contextWrapper.height();

                var p = contextCanvas.parent();

                if (destAspect > canvasAspect) {

                    p.css("height", "100%");
                    p.css("width", ((contextWrapper.height() * canvasAspect) / contextWrapper.width()) * 100 + "%");
                } else {

                    p.css("width", "100%");
                    p.css("height", ((contextWrapper.width() * canvasAspect) / contextWrapper.height()) * 100 + "%");
                }

                contextCanvas.css("width", "100%");
            }

        },
        presentationContextHandler: function () {

            for (var i = 0; i < App.PresentationWindows.length; i++) {
                this.presentationWindowSetup(App.PresentationWindows[i], i);
            }
        },
        presentationWindowSetup: function (presentationWindowObject, i) {

            var currentPresWindow = presentationWindowObject.window;


            if (App.presentation_state == true) {

                /* New player context on each presentation window */

                var newPlayerContext = {
                    id: "presentation" + i,
                    window: currentPresWindow,
                    canvas: currentPresWindow.document.getElementById("media-canvas"),
                    wrapper: currentPresWindow.document.getElementById("presentation-content"),
                }

                presentationWindowObject.context = newPlayerContext;
                renderer.addAdditionalContext(presentationWindowObject.context);
                presentationWindowObject.on("resize", _.bind(this.onPresentationResize, this));

            } else {

                if (presentationWindowObject.context != null)
                    renderer.removeContext(presentationWindowObject.context);
                presentationWindowObject.context = null;
                presentationWindowObject.removeAllListeners("resize");
            }


        },
        playerInterfaceInit: function () {

            /* General click and move over player surface  */

            this.ui.wrapper.mouseup(
                    this.mouseClickEnd
                    );

            this.ui.wrapper.mousemove(
                    this.mouseMoved
                    );

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

                var t_str = that.parseTime(t, App.vlc.length);
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

                var newtime = Math.floor(App.vlc.length * ((e.pageX - rect.left) / that.ui.wrapper.width()));
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
                App.vlc.position = p;
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
            if (App.vlc.length) {

                var rect = that.ui.wrapper[0].getBoundingClientRect();
                if (e.pageX >= rect.left && e.pageX <= rect.right) {

                    var newtime = Math.floor(App.vlc.length * ((e.pageX - rect.left) / that.ui.wrapper.width()));
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
                this.lastVolume = App.vlc.volume;
                App.vlc.volume = 0;

                if (!App.vlc.mute) {

                }

            } else if (newVolume && !isNaN(newVolume) && newVolume > 5 && newVolume <= 200) {

                if (App.vlc.mute) {
                    App.vlc.mute = false;
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
                App.vlc.volume = parseInt(newVolume);

            } else
                return App.vlc.volume;
        },
    });

})(window.App);
