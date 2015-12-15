/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    App.Model.SongPart = Backbone.Model.extend({
        defaults: {
            type: "verse",
            type_visual: "",
            text: "",
            text_visual: "",
        },
    });

    var SongPartCollection = Backbone.Collection.extend({
        model: App.Model.SongPart,
    });


    App.Model.SongPartCollection = SongPartCollection;


})(window.App);