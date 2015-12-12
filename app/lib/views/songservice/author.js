(function (App) {
    'use strict';

    var Q = require('q');

    var a_prevX = 0;
    var a_prevY = 0;

    var AuthorItemView = Marionette.ItemView.extend({

        tagName: 'li',
        className: 'item',
        template: '#author-itemview-tpl',

        events: {
            'click .authorItem': 'getAuthorSongs',
            'mouseover .authorItem': 'hoverAuthor',
        },

        initialize: function () {

        },

        getAuthorSongs: function (e) {

            var elem = $(this.el);

            if (e.pageX !== a_prevX || e.pageY !== a_prevY) {
                $('.authorItem').parents('.item.active').removeClass('active');
                elem.addClass('active');
                a_prevX = e.pageX;
                a_prevY = e.pageY;
            }

            App.vent.trigger("songbase:loadsongs", this.model);
        },

        hoverAuthor: function (e) {

            if (e.pageX !== a_prevX || e.pageY !== a_prevY) {
                $('.authorItem').parents('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                a_prevX = e.pageX;
                a_prevY = e.pageY;
            }
        },

    });

    App.View.Author = AuthorItemView;

    var AuthorCollectionView = Marionette.CollectionView.extend({

        tagName: 'ul',
        className: 'list',
        childView: App.View.Author

    });
    App.View.AuthorCollection = AuthorCollectionView;



})(window.App);


