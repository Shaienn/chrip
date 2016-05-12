/**
 * Created by shaienn on 03.09.15.
 */


(function (App) {

    'use strict'

    App.View.BlockScreens.Groups.ToolBar = Backbone.Marionette.ItemView.extend({
	template: '#bs-groups-toolbar-tpl',
	events: {
	    'click #bs-add-group-btn': 'create_group_handler',
	    'click #bs-remove-group-btn': 'remove_group_handler',
	},
	create_group_handler: function () {
	    App.vent.trigger('blockscreens:addNewBsGroup');
	},
	remove_group_handler: function () {
	    App.vent.trigger('blockscreens:removeBsGroup');

	},
    });

})(window.App);
