/**
 * Created by shaienn on 02.09.15.
 */
'use strict';

(function (App) {

    var fontManager = require('font-manager-nw');
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
            this.listenTo(App.vent, "settings:control:onEvent", _.bind(this.onEvent, this));
            this.listenTo(App.vent, "settings:control:offEvent", _.bind(this.offEvent, this));
            this.listenTo(App.vent, "resize", _.bind(this.redrawPreview, this));
        },
        onShow: function () {
            this.render();
            this.refreshBackgroundFiles();
            this.refreshBibleFiles();
        },
        onEvent: function () {
            this.redrawPreview();
        },
        offEvent: function () {

        },
        redrawPreview: function (target) {
            win.log("redrawPreview");
            var that = this;
            if (typeof target == "undefined") {
                var target = this.ui.sections;
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
            var target = $('#BibleSettings > .content > .preview-container');
            var verse_template = _.template($('#verse-slide-tpl').html());
            target.html(verse_template(slide.attributes));
            var verse_text = target.find('.slide-verse-text');
            var background = target.find('img.slide_image');

            verse_text.hide();
            background.load(function () {
                verse_text.show();
                verse_text.boxfit({multiline: true});
            });


        },
        drawSlide: function (slide) {
            win.log("drawSlide");
            var target = $('#SongserviceSettings > .content > .preview-container');
            var slide_template = _.template($('#slide-tpl').html());
            target.html(slide_template(slide.attributes));
            var text_span = target.find('.slide_text span');
            var background = target.find('img.slide_image');

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

            /* Songservice */

            var images = Settings.Utils.getBackgrounds(Settings.SongserviceSettings.backgrounds_path);
            var images_select = "";
            for (var i = 0; i < images.length; i++) {
                images_select += "<option " + (Settings.SongserviceSettings.background == images[i].path ? "selected='selected'" : "") + " value='" + images[i].path + "'>" + images[i].name + "</option>";
            }
            $("#SongserviceSettings .background-image-selector").html(images_select);

            /* Bible */

            var images = Settings.Utils.getBackgrounds(Settings.BibleSettings.backgrounds_path);
            var images_select = "";
            for (var i = 0; i < images.length; i++) {
                images_select += "<option " + (Settings.BibleSettings.background == images[i].path ? "selected='selected'" : "") + " value='" + images[i].path + "'>" + images[i].name + "</option>";
            }
            $("#BibleSettings .background-image-selector").html(images_select);

        },
        saveSetting: function (e) {

            var value = false;
            var field = $(e.currentTarget);
            var background_path_changed = false;
            var bible_changed = false;
            var valid = false;
            var section = field.closest("section");

            switch (field.attr('name')) {

                case ('presentation_monitor'):

                    value = $('option:selected', field).val();
                    valid = true;

                    break;

                case ('font_family'):

                    value = $('option:selected', field).val();
                    valid = true;

                    break;

                case ('backgrounds_path'):

                    value = field.val();
                    $('#fakebackgroundsdir').attr('value', value);
                    background_path_changed = true;
                    valid = true;

                    break;

                case ('background_mode'):

                    value = $('option:selected', field).val();
                    valid = true;

                    break;

                case ('background'):

                    value = $('option:selected', field).val();
                    valid = true;

                    break;

                case ('bible_xml'):

                    value = $('option:selected', field).val();
                    bible_changed = true;
                    valid = true;

                    break;
                case ('show_time'):
                    value = field.val();

                    if (!isInteger(value)) {
                        value = Settings.BlockScreensSettings.show_time;
                        valid = false;
                        break;
                    }

                    if (value < 1) {
                        value = 1;
                    }

                    valid = true;
                    break;
            }


            if (valid == true) {
                win.info(section.attr('id') + ' changed: ' + field.attr('name') + ' - ' + value);
                Settings[section.attr('id')][field.attr('name')] = value;
                App.Database.saveSetting(section.attr('id'), field.attr('name'), value);


                if (background_path_changed == true) {
                    this.refreshBackgroundFiles();
                }

                if (bible_changed == true) {
                    App.vent.trigger("bible:control:changeBibleXml", Settings.BibleSettings.bible_xml);
                }

                /* Redraw slide */

                this.redrawPreview(section);

            }
        },
    });


}(window.App));
