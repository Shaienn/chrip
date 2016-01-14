/**
 * Created by shaienn on 02.09.15.
 */
'use strict';

(function (App) {

    var fontManager = require('font-manager-nw');
    var that;
    App.View.Settings.Root = Backbone.Marionette.ItemView.extend({
        template: '#settings-tpl',
        id: 'settings-main-window',
        background_loaded: false,
        ui: {
            fakeBackgroundsDir: '#fakebackgroundsdir',
            backgrounds_path: '#backgrounds_path',
            sections: 'section',
        },
        events: {
            'change select,input': 'saveSetting',
            'click #change_background_dir': 'showBackgroundsDirectoryDialog',
        },
        showBackgroundsDirectoryDialog: function () {
            this.ui.backgrounds_path.click();
        },
        initialize: function () {
            that = this;
            App.vent.on("settings:control:onEvent", _.bind(this.onEvent, this));
            App.vent.on("settings:control:offEvent", _.bind(this.offEvent, this));
        },
        onShow: function () {
            this.render();
            this.refreshBackgroundFiles();
            this.refreshBibleFiles();
        },
        onEvent: function () {
            this.redrawPreview();
            $(window).on("resize", this.resizeHandler);
        },
        offEvent: function () {
            $(window).off("resize", this.resizeHandler);
        },
        resizeHandler: function () {
            that.redrawPreview();
        },
        redrawPreview: function (target) {
            win.log("redrawPreview");

            if (typeof target == "undefined") {
                var target = that.ui.sections;
            }

            target.each(function () {
                var id = $(this).attr('id');

                switch (id) {
                    case 'SongserviceSettings':

                        App.SlideGenerator
                                .makeSlideFromText("Строка\r\nДлинная строка\r\nСтрока\r\nОчень очень длинная строка")
                                .then(that.drawSlide);

                        break;
                    case 'BibleSettings':

                        var verse = new App.Model.Verse();
                        verse.set("text", "И ходил этот человек из города своего в положенные дни поклоняться и приносить жертву Господу Саваофу в Силом; там были Илий и два сына его, Офни и Финеес, священниками Господа.");
                        verse.set("bottom_text", "Подпись к стиху");

                        App.SlideGenerator
                                .makeSlideFromVerse(verse)
                                .then(that.drawVerse);

                        break;
                }

            });
        },
        drawVerse: function (slide) {
            win.log("drawVerse");
            var target = $('#BibleSettings').find(".bible-slide-item");
            var verse_template = _.template($('#verse-slide-tpl').html());
            target.html(verse_template({
                background: slide.get("background"),
                text: slide.get("text"),
                link: slide.get("link"),
                height: slide.get("height"),
                width: slide.get("width"),
                number: slide.get("number"),
                font: slide.get("font"),
            }));

            var verse_text = target.find('.slide-verse-text');
            var background = target.find('img.slide_background');

            verse_text.hide();
            background.load(function () {
                verse_text.show();
                verse_text.boxfit({multiline: true});
            });


        },
        drawSlide: function (slide) {
            win.log("drawSlide");
            var target = $('#SongserviceSettings').find(".preview-container");
            var slide_template = _.template($('#slide-tpl').html());
            target.html(slide_template({
                background: slide.get("background"),
                text: slide.get("text"),
                height: slide.get("height"),
                width: slide.get("width"),
                number: slide.get("number"),
                font: slide.get("font"),
            }));

            var text_span = target.find('.slide_text span');
            var background = target.find('img.slide_background');

            text_span.hide();
            background.load(function () {
                text_span.show();
                text_span.bigText();
            });

        },
        onDestroy: function () {
            win.log("settings destroy request");
        },
        refreshBibleFiles: function () {
            var bibles = Settings.Utils.getBibles();
            var bibles_selector = "";

            for (var i = 0; i < bibles.length; i++) {
                bibles_selector += "<option " + (Settings.BibleSettings.bible_xml == bibles[i].path ? "selected='selected'" : "") + " value='" + bibles[i].path + "'>" + bibles[i].name + "</option>";
            }

            $("#bibleSelector").html(bibles_selector);

        },
        refreshBackgroundFiles: function () {

            var images = Settings.Utils.getBackgrounds(Settings.SongserviceSettings.backgrounds_path);

            var images_select = "";

            for (var i = 0; i < images.length; i++) {
                images_select += "<option " + (Settings.SongserviceSettings.background == images[i].path ? "selected='selected'" : "") + " value='" + images[i].path + "'>" + images[i].name + "</option>";
            }

            $("#backgroundImageSelector").html(images_select);

        },
        saveSetting: function (e) {

            var value = false;
            var field = $(e.currentTarget);
            var background_path_changed = false;
            var bible_changed = false;

            var section = field.closest("section");

            switch (field.attr('name')) {

                case ('presentation_monitor'):

                    value = $('option:selected', field).val();
                    break;

                case ('font_family'):

                    value = $('option:selected', field).val();
                    break;

                case ('backgrounds_path'):

                    value = field.val();
                    $('#fakebackgroundsdir').attr('value', value);
                    background_path_changed = true;

                    break;

                case ('background_mode'):

                    value = $('option:selected', field).val();

                    break;

                case ('background'):

                    value = $('option:selected', field).val();

                    break;

                case ('bible_xml'):

                    value = $('option:selected', field).val();
                    bible_changed = true;

                    break;
            }

            win.info(section.attr('id') + ' changed: ' + field.attr('name') + ' - ' + value);

            Settings[section.attr('id')][field.attr('name')] = value;

            /* Database save */

            App.Database.saveSetting(section.attr('id'), field.attr('name'), value);

            if (background_path_changed == true) {
                this.refreshBackgroundFiles();
            }

            if (bible_changed == true) {
                App.vent.trigger("bible:control:changeBibleXml", Settings.BibleSettings.bible_xml);
            }

            /* Redraw slide */

            this.redrawPreview(section);

        },
    });


}(window.App));
