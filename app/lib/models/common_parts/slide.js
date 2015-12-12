/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var Q = require('q');


    var SlideModel = Backbone.Model.extend({
        background: null,
        width: null,
        height: null,
    });

    App.Model.BibleSlide = SlideModel.extend({
        text: "",
        link: "",
    });

    App.Model.SongSlide = SlideModel.extend({
        text: "",
        number: 0,
    });


    //App.Model.Slide = SlideModel;


})(window.App);