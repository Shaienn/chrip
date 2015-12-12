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


        ui: {

            fakeBackgroundsDir: '#fakebackgroundsdir',
            backgrounds_path: '#backgrounds_path',

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
            $('.preview-container').css('height', $('.slide-settings-container').height() + "px");
            this.redrawPreview();
            this.refreshBackgroundFiles();

        },

        redrawPreview: function () {
            App.SlideGenerator.fromText_promise("Строка\r\nДлинная строка\r\nСтрока\r\nОчень очень длинная строка").then(function (slideObj) {
                var img_container = '<img src="data:image/jpg;base64, ' + slideObj.get('slide') + ' ">';
                $('.preview-container').html(img_container);
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

            win.log(images_select);

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

            case ('slide_string_mode'):

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
