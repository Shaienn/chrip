/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {

    'use strict'

    App.View.Videoplayer.BottomToolBar = Backbone.Marionette.ItemView.extend({
	template: '#videoplayer-bottomtoolbar-tpl',
	className: 'row',
	ui: {
	    Input: '#videofile-input',
	},
	events: {
	    'click #videoplayer-openfile-dialog-btn': 'openVideoDialog',
	    'change :file': 'fileSelectHandler',
	},
	openVideoDialog: function () {
	    $(this.ui.Input).trigger('click');
	},
	fileSelectHandler: function () {

	    var files = $(this.ui.Input)[0].files;

	    for (var i = 0; i < files.length; i++) {
		var media = new App.Model.Media();
		var mrl = "file:///" + files[i].path;
		media.set("mrl", mrl);
		var type = files[i].type.split('/')[0]; /* TODO in windows mkv files is not recognized as video type */
		media.set("type", type);
		media.set("name", files[i].name);
		App.Model.MediaListCollection.add(media);
	    }
	},
    });

})(window.App);
