/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';

    var _this;
    App.View.SongService.Root = Backbone.Marionette.LayoutView.extend({
        template: '#churchservice-tpl',
        id: 'churchservice-main-window',
        regions: {
            Control_r: "#churchservice-control",
            Settings_r: "#churchservice-settings",
            Songbase_r: "#churchservice-songbase"
        },
        initialize: function () {

            _this = this;

            _.each(_this.regionManager._regions, function (element, index) {

                element.on('show', function (view) {
                    if (view.className && App.ViewStack[0] !== view.className) {
                        App.ViewStack.push(view.className);
                    }
                    App.vent.trigger('viewstack:push', view.className);
                });

                /**
                 * Marionette 2.x changed close to destroy, and doesn't pass along a view anymore.
                 * TODO: Find better solution
                 */
                element.on('destroy', function (view) {

                    if (typeof view === 'undefined' && element.currentView !== null) {
                        view = element.currentView;
                    }

                    var viewName = (typeof view !== 'undefined' ? view.className : 'unknown');

                    App.ViewStack.pop();
                    App.vent.trigger('viewstack:pop', viewName);

                    if (typeof element.currentView !== 'undefined') {
                        element.currentView.destroy();
                    }

                    if (!App.ViewStack[0]) {
                        App.ViewStack = ['churchservice-main-window'];
                    }
                });

            });

            this.nativeWindow = require('nw.gui').Window.get();

            /* Assign events */

            App.vent.on('churchservice:songbase:show', _.bind(this.showSongbase, this));
            App.vent.on('churchservice:songbase:close', _.bind(this.closeSongbase, this));

            App.vent.on('settings:show', _.bind(this.showSettings, this));
            App.vent.on('settings:close', _.bind(this.Settings_r.destroy, this.Settings_r));



        },
        onShow: function () {
            this.showControl();
        },
        onDestroy: function () {

            App.vent.off('churchservice:songbase:show');
            App.vent.off('churchservice:songbase:close');

            App.vent.off('settings:show');
            App.vent.off('settings:close');

            App.vent.off("control:showslide");
            App.vent.off("churchservice:playlist:prepare_slides");

        },
        /************ Regions part ************/

        showControl: function () {

            win.log("show control request");
            this.Control_r.show(new App.View.SongService.Control);
        },
        showSettings: function (settingsModel) {

            win.log("show settings request");
            this.Settings_r.show(new App.View.SongService.Settings({
                model: settingsModel
            }));

        },
        showSongbase: function () {

            win.log("show songbase request");
            this.Control_r.currentView.doOnHide();
            this.Songbase_r.show(new App.View.SongService.SongBase);

        },
        closeSongbase: function () {

            this.Songbase_r.destroy();
            this.Control_r.currentView.doOnShow();

        },
    });



}(window.App));
