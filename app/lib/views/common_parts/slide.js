(function (App) {
    'use strict';

    var SlideView = Marionette.ItemView.extend({

        tagName: 'div',
        className: 'slide',

        initialize: function () {


        },

        onRender: function () {

            win.log("render");

        },


    });

    App.View.Slide = SlideView;

})(window.App);


