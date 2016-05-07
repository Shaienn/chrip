/**
 * Created by shaienn on 06.09.15.
 */

(function (App) {
    'use strict';

    var ControlBaseModel = Backbone.Model.extend({});
    App.Model.ControlBaseModel = ControlBaseModel;

    App.Model.SongService.Slides.List = Backbone.Collection.extend({
	model: App.Model.SongService.Slides.Slide,
    });

})(window.App);
