'use strict';

(function (App) {

    App.View.BlockScreens.Root = Backbone.Marionette.LayoutView.extend({
	template: '#blockscreens-tpl',
	id: 'blockscreens-main-window',
	elements_collection: null,
	selected_group: null,
	ui: {
	    bsg_loader: '#blockscreens-list .area .loader',
	},
	regions: {
	    List_r: '#blockscreens-list .area .bs-groups',
	    BSGContent_r: "#bsg-content",
	    BSGControl_r: "#bsg-control",
	    ToolBar_r: "#blockscreens-toolbar",
	    modals: {
		selector: '#bsModal',
		regionClass: Backbone.Marionette.Modals
	    }
	},
	initialize: function () {
	    this.listenTo(App.vent, "blockscreens:addNewBsGroup", _.bind(this.createBlockscreenGroup, this));
	    this.listenTo(App.vent, "blockscreens:selectBsGroup", _.bind(this.selectBlockscreenGroupHandler, this));
	    this.listenTo(App.vent, "blockscreens:createElement", _.bind(this.createElementHandler, this));
	    this.listenTo(App.vent, "blockscreens:editElement", _.bind(this.editElementHandler, this));
	    this.listenTo(App.vent, "blockscreens:selectElement", _.bind(this.selectElementHandler, this));
	},
	selectElementHandler: function (element) {
	    console.log(element);
	    this.elements_collection.selectedElement = this.elements_collection.collection.indexOf(element);
	},
	editElementHandler: function () {

	},
	createElementHandler: function () {
	    var bse = new App.View.BlockScreens.Elements.EditForm({
		blockscreen: new App.Model.BlockScreens.Elements.Element({
		    gid: this.group.get('id')
		})
	    });
	    this.modals.show(bse);
	},
	createBlockscreenGroup: function () {

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

	    this.selected_group = group;

	    /* Get files associated with this group */

	    App.Database.getBlockScreenFiles(group).then(function (files) {

		console.log(files);

		/* parse each file and get JSON objects  */

		that.parseBlockscreensFiles(files).then(function (objects) {

		    console.log(objects);

		    var elements = new App.Model.BlockScreens.Elements.List();

		    /* Create bsElements */

		    objects.forEach(function (item) {

			var element = new App.Model.BlockScreens.Elements.Element();
			element.set('html', item.value.html);
			element.set('preview', item.value.preview);
			element.set('name', item.value.name);
			elements.add(element);

		    });

		    console.log(elements);

		    var elements_view = new App.View.BlockScreens.Elements.List({
			childView: App.View.BlockScreens.Elements.Element,
			collection: elements,
		    });

		    console.log(elements_view);

		    that.BSGContent_r.show(elements_view);
		});

	    });

	    this.BSGControl_r.show(new App.View.BlockScreens.Elements.ToolBar({}));

	},
	parseBlockscreensFiles: function (blockscreens_files) {

	    var files = [];
	    blockscreens_files.forEach(function (item) {
		var d = Q.defer();

		fs.readFile(item.file, function (err, res) {

		    if (err) {
			throw err;
		    }

		    var parser = new xml2js.Parser();
		    parser.parseString(res, function (err, res) {
			if (err) {
			    throw err;
			}

			var object = JSON.parse(res.root);
			d.resolve(object);
		    });

		});

		files.push(d.promise);
	    });
	    return Q.allSettled(files);
//	    var files = [];
//	    blockscreens_files.forEach(function (item) {
//
//		var d = Q.defer();
//		var timeout = setTimeout(function () {
//		    d.reject('timeout');
//		}, 5000);
//		fs.readSync(item.path, function (err, data) {
//
//		    if (err) {
//			d.reject(err);
//			clearTimeout(timeout);
//		    }
//
//		    var parser = new xml2js.Parser();
//		    parser.parseString(data, function (err, result) {
//			if (err) {
//			    d.reject(err);
//			    clearTimeout(timeout);
//			}
//
//			d.resolve(result);
//			clearTimeout(timeout);
//		    });
//		    files.push(d.promise);
//		});
//	    });
//	    return Q.allSettled(files);
	},
	onShow: function () {
	    console.log("show");
	    this.ToolBar_r.show(new App.View.BlockScreens.Groups.ToolBar());

	    /* Load stored blockscreens groups from DB and construct list */
	    this.load_bs_groups();

	},
	show_bsg_loader: function () {
	    this.ui.bsg_loader.show();
	},
	hide_bsg_loader: function () {
	    this.ui.bsg_loader.hide();
	},
	load_bs_groups: function () {
	    var that = this;
	    this.show_bsg_loader();

	    App.Database.getBlockScreensGroups().then(function (loadedBlockScreensGroups) {

		console.log(loadedBlockScreensGroups);
		/* Construct control with loaded blockscreens */

		var bsg_collection = new App.Model.BlockScreens.Groups.List(loadedBlockScreensGroups);
		console.log(bsg_collection);

		var bsg_collection_view = new App.View.BlockScreens.Groups.List({
		    collection: bsg_collection,
		});

		that.elements_collection = bsg_collection_view;
		console.log(that.collection);


		that.List_r.show(bsg_collection_view);
		that.hide_bsg_loader();
	    });
	},
    });
}(window.App));
