'use strict';

(function (App) {

    App.View.BlockScreens.Root = Backbone.Marionette.LayoutView.extend({
	template: '#blockscreens-tpl',
	id: 'blockscreens-main-window',
	groups_collection: null,
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
	    this.listenTo(App.vent, "blockscreens:removeElement", _.bind(this.removeElementHandler, this));
	    this.listenTo(App.vent, "blockscreens:selectElement", _.bind(this.selectElementHandler, this));


	},
	selectElementHandler: function (element) {
	    this.elements_collection.selected_index = this.elements_collection.collection.indexOf(element);
	},
	removeElementHandler: function () {
	    var selected_element = this.elements_collection.collection.at(this.elements_collection.selected_index);

	    var remove_form = new App.View.BlockScreens.Elements.RemoveForm({
		blockscreen: selected_element,
		collection: this.elements_collection.collection
	    });
	    this.modals.show(remove_form);
	},
	editElementHandler: function () {
	    var selected_element = this.elements_collection.collection.at(this.elements_collection.selected_index);
	    var bse = new App.View.BlockScreens.Elements.EditForm({
		blockscreen: selected_element
	    });
	    this.modals.show(bse);
	},
	createElementHandler: function () {
	    var bse = new App.View.BlockScreens.Elements.EditForm({
		blockscreen: new App.Model.BlockScreens.Elements.Element({
		    gid: this.selected_group.get('id')
		})
	    });
	    this.modals.show(bse);
	},
	createBlockscreenGroup: function () {

	    var bsg = new App.View.BlockScreens.Groups.EditForm({
		bsg: new App.Model.BlockScreens.Groups.Element,
	    });
	    this.modals.show(bsg);
	},
	selectBlockscreenGroupHandler: function (group) {

	    var that = this;

	    var gid = group.get('id');
	    if (typeof (gid) === "undefined") {
		return;
	    }

	    this.selected_group = group;

	    /* Get files associated with this group */

	    App.Database.getBlockScreenFiles(group).then(function (files) {

		/* parse each file and get JSON objects  */

		that.parseBlockscreensFiles(files).then(function (objects) {

		    var elements = new App.Model.BlockScreens.Elements.List();

		    /* Create bsElements */

		    objects.forEach(function (item) {

			var element = new App.Model.BlockScreens.Elements.Element();
			element.set('html', item.value.html);
			element.set('preview', item.value.preview);
			element.set('name', item.value.name);
			element.set('file', item.value.file);
			element.set('gid', gid);
			elements.add(element);

		    });

		    var elements_view = new App.View.BlockScreens.Elements.List({
			childView: App.View.BlockScreens.Elements.Element,
			collection: elements,
		    });

		    that.elements_collection = elements_view;

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
			object.file = item.file;

			d.resolve(object);
		    });

		});

		files.push(d.promise);
	    });
	    return Q.allSettled(files);

	},
	onShow: function () {
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

		/* Construct control with loaded blockscreens */

		var bsg_collection = new App.Model.BlockScreens.Groups.List(loadedBlockScreensGroups);

		var bsg_collection_view = new App.View.BlockScreens.Groups.List({
		    collection: bsg_collection,
		});

		that.groups_collection = bsg_collection_view;


		that.List_r.show(bsg_collection_view);
		that.hide_bsg_loader();
	    });
	},
    });
}(window.App));
