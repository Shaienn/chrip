/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    App.View.BlockScreens.Groups.Element = App.View.Common.ItemList.Element.extend({
	className: 'bs-' + App.View.Common.ItemList.Element.prototype.className,
	template: '#bsg-itemview-tpl',
	clickReport: function (e) {
	    App.vent.trigger("blockscreens:selectBsGroup", this.model);
	},
    });

    App.View.BlockScreens.Groups.List = App.View.Common.ItemList.List.extend({
	className: 'bs-' + App.View.Common.ItemList.List.prototype.className,
	childView: App.View.BlockScreens.Groups.Element,
	behaviors: {
	    Sortable: {
		containment: 'parent'
	    }
	},
    });

})(window.App);
