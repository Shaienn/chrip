/* 
 * Blockscreens - something, starts overall when user press Ctrl+L button. 
 * 
 * In database it is two fields: 
 *      1) Background path
 *      2) Additional text above background
 *
 */

(function (App) {
    'use strict';
    App.View.BlockScreens.Root = Backbone.Marionette.LayoutView.extend({
	template: '#blockscreens-tpl',
	id: 'blockscreens-main-window',
	collection: null,
	regions: {
	    List_r: '#blockscreens-list',
	    Control_r: "#blockscreens-control",
	    ToolBar_r: "#blockscreens-toolbar",
	    modals: {
		selector: '#bsModal',
		regionClass: Backbone.Marionette.Modals
	    }
	},
	initialize: function () {
	    this.listenTo(App.vent, "blockscreens:addNewBsGroup", _.bind(this.addNewBlockscreenGroup, this));
	    this.listenTo(App.vent, "blockscreens:selectBsGroup", _.bind(this.selectBlockscreenGroupHandler, this));
	},
	addNewBlockscreenGroup: function () {

	    var bsg = new App.View.BlockScreens.Groups.EditForm({
		bsg: new App.Model.BlockScreens.Groups.Group(),
	    });
	    this.modals.show(bsg);
	},
	selectBlockscreenGroupHandler: function (group) {

	    var that = this;

	    var gaid = group.get('id');
	    if (typeof (gaid) === "undefined") {
		return;
	    }

	    /* Get files associated with this group */

	    App.Database.getBlockScreenFiles(group).then(function (files) {

		/* parse each file and get JSON objects  */

		that.parseBlockscreensFiles(files).then(function (objects) {


		    var elements = new App.Model.BlockScreen.Elements.List();

		    /* Create bsElements */

		    objects.forEach(function (item) {

			var element = new App.Model.BlockScreen.Elements.Element();
			element.set('html', item.html);
			element.set('preview', item.preview);
			element.set('name', item.name);
			elements.add(element);

		    });

		    var elements_view = new App.View.BlockScreens.Elements.List({
			childView: App.View.BlockScreens.Elements.Element,
			collection: elements,
		    });

		    that.Control_r.show(new App.View.BlockScreens.Elements.Control({
			collection: elements_view
		    }));

		});

	    });

	},
	parseBlockscreensFiles: function (blockscreens_files) {

	    var files = [];
	    blockscreens_files.forEach(function (item) {

		var d = Q.defer();
		var timeout = setTimeout(function () {
		    d.reject('timeout');
		}, 5000);
		fs.readSync(item.path, function (err, data) {

		    if (err) {
			d.reject(err);
			clearTimeout(timeout);
		    }

		    var parser = new xml2js.Parser();
		    parser.parseString(data, function (err, result) {
			if (err) {
			    d.reject(err);
			    clearTimeout(timeout);
			}

			d.resolve(result);
			clearTimeout(timeout);
		    });
		    files.push(d.promise);
		});
	    });
	    return Q.allSettled(files);
	},
	onShow: function () {

	    var that = this;
	    this.ToolBar_r.show(new App.View.BlockScreens.Groups.ToolBar());

	    /* Load stored blockscreens groups from DB and construct list */

	    App.Database.getBlockScreensGroups().then(function (loadedBlockScreensGroups) {

		console.log(loadedBlockScreensGroups);
		/* Construct control with loaded blockscreens */

		that.collection = new App.View.BlockScreens.Groups.List({
		    childView: App.View.BlockScreens.Groups.Group,
		    collection: App.Model.BlockScreens.Groups.List(loadedBlockScreensGroups),
		});
		that.List_r.show(that.collection);
	    });
	},
    });
}(window.App));
