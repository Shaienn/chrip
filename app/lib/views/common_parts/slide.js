(function (App) {
    'use strict';
    var sl_prevX = 0;
    var sl_prevY = 0;
    var SongServiceSlideGeneral = Backbone.Marionette.ItemView.extend({
        className: 'slide-item',
        template: "#slide-tpl",
        background_loaded: false,
        ui: {
            background: ".slide_background",
            text_span: ".slide_text span",
        },
        initialize: function () {
            this.listenTo(App.vent, "resize", _.bind(this.onShow, this));
        },
        onShow: function () {
            var that = this;
            this.bindUIElements();

            /* We wait first time until loading background image, 
             * cause container dimensions for bigText() depends on it */

            if (this.background_loaded) {
                this.ui.text_span.bigText();
                return;
            } else {
                this.ui.text_span.hide();
                this.ui.background.load(function () {
                    that.ui.text_span.show();
                    that.ui.text_span.bigText();
                    that.background_loaded = true;
                });
            }
        },
        onDestroy: function () {
        }
    });

    App.View.SongService.SingleSlide = SongServiceSlideGeneral.extend({});

    App.View.SongService.GroupSlide = SongServiceSlideGeneral.extend({
        tagName: 'li',
        events: {
            'click .slide-container': 'showSlide',
        },
        showSlide: function (e) {

            var elem = $(this.el);

            if (e.pageX !== sl_prevX || e.pageY !== sl_prevY) {
                $('.slide-item.active').removeClass('active');
                elem.addClass('active');
                sl_prevX = e.pageX;
                sl_prevY = e.pageY;
            }

            App.vent.trigger("songservice:control:showslide", this.model);

        }
    });

})(window.App);


