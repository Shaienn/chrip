(function (App) {
    'use strict';

    var s_mover_prevX = 0;
    var s_mover_prevY = 0;
    var s_mout_prevX = 0;
    var s_mout_prevY = 0;

    App.View.Common.ItemList.Element = Marionette.ItemView.extend({
	tagName: 'li',
	className: 'element-item',
	template: '#item-tpl',
	events: {
	    'click .item-container': 'clickHandler',
	    'dblclick .item-container': 'dblClickHandler',
	    'mouseover .item-container': 'overHandler',
	    'mouseout .item-container': 'outHandler',
	    'contextmenu .item-container': 'contextMenuHandler',
	},
	overHandler: function (e) {
	    if (e.pageX !== s_mover_prevX || e.pageY !== s_mover_prevY) {
		$('.' + this.className + '.selected').removeClass('selected');
		$(this.el).addClass('selected');
		s_mover_prevX = e.pageX;
		s_mover_prevY = e.pageY;
	    }
	},
	outHandler: function (e) {
	    if (e.pageX !== s_mout_prevX || e.pageY !== s_mout_prevY) {
		$(this.el).removeClass('selected');
		s_mout_prevX = e.pageX;
		s_mout_prevY = e.pageY;
	    }
	},
	clickHandler: function (e) {
	    $('.' + this.className + '.active').removeClass('active');
	    $(this.el).addClass('active');
	    this.clickReport();
	},
	dblClickHandler: function (e) {},
	clickReport: function () {},
	contextMenuHandler: function () {},
    });

    App.View.Common.ItemList.List = Marionette.CollectionView.extend({
	tagName: 'ul',
	className: 'element-list',
    });


})(window.App);


