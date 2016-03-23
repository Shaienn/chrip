/* Video control screen */

(function (App) {
    'use strict'

    App.View.Media.Root = Backbone.Marionette.LayoutView.extend({
	template: '#media-tpl',
	id: 'media-main-window',
	regions: {
	    MediaList_r: '#media-list-container',
	    MediaControl_r: '#media-control-container',
	},
	ui: {
	    Input: '#media-input',
	},
	events: {
	    'click #media-openfile-dialog-btn': 'openMediaDialog',
	    'change @ui.Input': 'fileSelectHandler',
	},
	/******************* Layout functions *******************/

	initialize: function () {
	    this.listenTo(App.vent, "media:control:media_selected", _.bind(this.mediaSelected, this));
	},
	onShow: function () {
	    this.MediaList_r.show(new App.View.Media.Elements.List({
		collection: App.Model.MediaListCollection,
	    }));
	},
	/**************************************/
	openMediaDialog: function () {
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
	mediaSelected: function (media) {
	    console.log("media selected: " + media.get('type'));

	    switch (media.get('type')) {
		case ("video"):
		case ("audio"):
		    this.MediaControl_r.show(new App.View.Media.Control({
			media_element: media,
		    }));
		    break;
		default:
		    console.log(media.get('type'));
		    break;
	    }

	},
    });

}(window.App));
