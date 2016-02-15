/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var p_mover_prevX = 0;
    var p_mover_prevY = 0;
    var p_mout_prevX = 0;
    var p_mout_prevY = 0;


    /* View */

    App.View.BlockScreens.Groups.Group = Backbone.Marionette.ItemView.extend({
	template: '#bs-group-itemview-tpl',
	tagName: 'li',
	className: 'item',
	overHandler: function (e) {
	    if (e.pageX !== p_mover_prevX || e.pageY !== p_mover_prevY) {
		$(this.el).addClass('selected');
		p_mover_prevX = e.pageX;
		p_mover_prevY = e.pageY;
	    }
	},
	outHandler: function (e) {
	    if (e.pageX !== p_mout_prevX || e.pageY !== p_mout_prevY) {
		$(this.el).removeClass('selected');
		p_mout_prevX = e.pageX;
		p_mout_prevY = e.pageY;
	    }
	},
    });

    App.View.BlockScreens.Groups.List = Marionette.CollectionView.extend({
	tagName: 'ul',
	className: 'list',
	behaviors: {
	    Sortable: {
		containment: 'parent'
	    }
	},
    });

})(window.App);
