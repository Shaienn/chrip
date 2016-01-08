/**
 * Created by shaienn on 13.09.15.
 */

(function (App) {
    'use strict'

    var SongBaseToolbar = Backbone.Marionette.ItemView.extend({

        template: '#songbase-toptoolbar-tpl',
        id: 'songbase-toptoolbar',

        ui: {
            searchForm: '.search form',
            searchInput: '.search input',
            search: '.search',
            searchClear: '.search .clear',
        },


        events: {

            'hover  @ui.searchInput': 'focus',
            'submit @ui.searchForm': 'search',
            'contextmenu @ui.searchInput': 'rightclick_search',
            'click  @ui.searchClear': 'clearSearch',
            'click  @ui.search': 'focusSearch',


            'click #churchservice-settings-btn': 'settingsBtnHandler',
            'click #churchservice-presentation-btn': 'presentationBtnHandler',

        },

        focus: function (e) {

            win.log("focus request");

            e.focus();
        },

        rightclick_search: function (e) {

            win.log("rightclick_search request");

            e.stopPropagation();
            var search_menu = new this.context_Menu('Cut', 'Copy', 'Paste');
            search_menu.popup(e.originalEvent.x, e.originalEvent.y);
        },

        focusSearch: function () {
            win.log("focusSearch request");

            this.$('.search input').focus();
        },

        search: function (e) {

            win.log("search request");
            e.preventDefault();
            var searchvalue = this.ui.searchInput.val();
            App.vent.trigger('songbase:search', searchvalue);
            this.ui.searchInput.blur();
        },

        clearSearch: function (e) {

            win.log("clearSearch request");

            this.ui.searchInput.focus();
            e.preventDefault();

            this.ui.searchInput.val('');
            this.ui.searchForm.removeClass('edited');
        },


    });

    App.View.SongService.SongBaseToolbar = SongBaseToolbar;


})(window.App);