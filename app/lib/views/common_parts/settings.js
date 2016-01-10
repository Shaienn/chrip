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
            slidePreviewArea: '.preview-container',
        },
        events: {
            'change select,input': 'saveSetting',
            'click #change_background_dir': 'showBackgroundsDirectoryDialog',
        },
        showBackgroundsDirectoryDialog: function () {
            this.ui.backgrounds_path.click();
        },
        initialize: function () {

        },
        onShow: function () {
            console.log("onShow");
            this.render();
            this.refreshBackgroundFiles();
            this.redrawPreview();
        },
        redrawPreview: function () {
            console.log("redrawPreview");
            that = this;
            App.SlideGenerator
                    .makeSlideFromText("Строка\r\nДлинная строка\r\nСтрока\r\nОчень очень длинная строка")
                    .then(this.drawSlide);

        },
        drawSlide: function (slide) {
            console.log("drawSlide");
            var slide_template = _.template($('#slide-tpl').html());
            that.ui.slidePreviewArea.html(slide_template({
                background: slide.get("background"),
                text: slide.get("text"),
                height: slide.get("height"),
                width: slide.get("width"),
                number: slide.get("number"),
                font: slide.get("font"),
            }));

            var text_span = that.ui.slidePreviewArea.find('.slide_text span');
            text_span.hide();
            that.ui.slidePreviewArea.find('img').load(function () {
                text_span.show();
                text_span.bigText();
            });

        },
        onDestroy: function () {
            win.log("settings destroy request");
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
            var section = field.closest("section").attr('id');

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
            }

            win.info(section + ' changed: ' + field.attr('name') + ' - ' + value);

            Settings[section][field.attr('name')] = value;

            /* Database save */

            App.Database.saveSetting(section, field.attr('name'), value);

            if (background_path_changed == true) {
                this.refreshBackgroundFiles();
            }

            /* Redraw slide */

            this.redrawPreview();

        },
    });


}(window.App));
