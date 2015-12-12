(function (App) {
    'use strict';

    var SongPreview = Marionette.ItemView.extend({

        tagName: 'div',
        className: 'preview',
        template: _.template("<%= html %>"),

        initialize : function(){

            this.model.on('change:html', this.render, this);

        },


    });

    App.View.Preview = SongPreview;

})(window.App);


