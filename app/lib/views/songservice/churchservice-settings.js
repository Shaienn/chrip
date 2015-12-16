/**
 * Created by shaienn on 02.09.15.
 */

(function (App) {
    'use strict';

    var fontManager = require('font-manager-nw');
    var that, waitComplete;


    var ChurchServiceSettings = Backbone.Marionette.ItemView.extend({
        template: '#churchservice-settings-tpl',
        className: 'settings-container-contain',
        background_loaded: false,
        ui: {
            fakeBackgroundsDir: '#fakebackgroundsdir',
            backgrounds_path: '#backgrounds_path',
            slidePreviewArea: '.preview-container',
        },
        events: {
            'click .close-icon': 'closeSettings',
            'change select,input': 'saveSetting',
            'click #fakebackgroundsdir': 'showBackgroundsDirectoryDialog',
        },
        showBackgroundsDirectoryDialog: function () {

            this.ui.backgrounds_path.click();
        },
        initialize: function () {

        },
        onShow: function () {
            that = this;
            this.render();
            $('#header').addClass('header-shadow');
            $('#appmode-menu').hide();
            $('#main-window-toptoolbar').hide();
            $('#churchservice-control').hide();

            this.redrawPreview();
            this.refreshBackgroundFiles();

        },
        redrawPreview: function () {

            App.SlideGenerator.makeSlideFromText("Строка\r\nДлинная строка\r\nСтрока\r\nОчень очень длинная строка")
                    .then(this.drawSlide);

        },
        drawSlide: function (slide) {

            console.log(slide);

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
            $('#churchservice-control').show();
            $('#appmode-menu').show();
            $('#main-window-toptoolbar').show();
            $('#header').removeClass('header-shadow');
            clearInterval(waitComplete);
        },
        closeSettings: function () {

            win.log("settings close button click");
            App.vent.trigger('settings:close');

        },
        refreshBackgroundFiles: function () {

            var images = Settings.Utils.getBackgrounds();

            var images_select = "";

            for (var i = 0; i < images.length; i++) {
                images_select += "<option " + (Settings.background == images[i].path ? "selected='selected'" : "") + " value='" + images[i].path + "'>" + images[i].name + "</option>";
            }

            $("#backgroundImageSelector").html(images_select);

        },
        saveSetting: function (e) {

            var value = false;
            var field = $(e.currentTarget);
            var background_path_changed = false;

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
            win.info('Setting changed: ' + field.attr('name') + ' - ' + value);
            Settings[field.attr('name')] = value;

            console.log(Settings.background);

            /* Database save */

            App.Database.saveSetting(field.attr('name'), value);

            if (background_path_changed == true) {
                this.refreshBackgroundFiles(true);
            }

            /* Redraw slide */

            this.redrawPreview();

        },
    });

    App.View.ChurchService.Settings = ChurchServiceSettings;

}(window.App));
