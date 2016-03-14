/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {

    'use strict'

    App.View.BlockScreens.Groups.ToolBar = Backbone.Marionette.ItemView.extend({
	template: '#bs-groups-toolbar-tpl',
	events: {
	    'click #bs-add-group-btn': 'createGroupHandler',
	},
	createGroupHandler: function () {
	    App.vent.trigger('blockscreens:addNewBsGroup');
	},
    });

})(window.App);
