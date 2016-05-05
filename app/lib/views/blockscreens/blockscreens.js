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
	    bsInput: '#bsInput',
	    bsGroups: '#blockscreens-list .area .bs-groups'
	},
	events: {
	    'change @ui.bsInput': 'add_selected_bs_to_group',
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
	    this.listenTo(App.vent, "blockscreens:openElement", _.bind(this.openElementHandler, this));
	    this.listenTo(App.vent, "blockscreens:editElement", _.bind(this.editElementHandler, this));
	    this.listenTo(App.vent, "blockscreens:removeElement", _.bind(this.removeElementHandler, this));
	    this.listenTo(App.vent, "blockscreens:selectElement", _.bind(this.selectElementHandler, this));
	},
	openElementHandler: function () {
	    $(this.ui.bsInput).trigger('click');
	},
	add_selected_bs_to_group: function () {

	    function process_files(files, gid) {
		var file_tasks = [];
		for (var i = 0; i < files.length; i++) {
		    var path = files[i].path;

		    var blockscreen = new App.Model.BlockScreens.Elements.Element({
			gid: gid,
			file: path,
		    });
		    file_tasks
			    .push(App.Database.add_file_to_blockscreen_group(blockscreen));
		}
		return Q.all(file_tasks);
	    }

	    var files = $(this.ui.bsInput)[0].files;
	    var self = this;
	    var gid = self.selected_group.get('gid');
	    if (typeof (gid) === "undefined") {
		return;
	    }
	    var d = Q.defer();

	    process_files(files, gid).then(function () {
		self.select_blockscreen_group(self.selected_group);
		d.resolve(true);
	    });

	    return d.promise;
	},
	selectElementHandler: function (element) {
	    this.elements_collection.selected_index = this.elements_collection.collection.indexOf(element);
	},
	removeElementHandler: function () {
	    var selected_element = this.elements_collection.collection.at(this.elements_collection.selected_index);
	    var remove_form = new App.View.BlockScreens.Elements.RemoveForm({
		blockscreens: this,
		blockscreen: selected_element,
		collection: this.elements_collection.collection
	    });
	    this.modals.show(remove_form);
	},
	editElementHandler: function () {
	    var selected_element = this.elements_collection.collection.at(this.elements_collection.selected_index);
	    var bse = new App.View.BlockScreens.Elements.EditForm({
		blockscreens: this,
		blockscreen: selected_element
	    });
	    this.modals.show(bse);
	},
	createElementHandler: function () {
	    var bse = new App.View.BlockScreens.Elements.EditForm({
		blockscreens: this,
		blockscreen: new App.Model.BlockScreens.Elements.Element({
		    gid: this.selected_group.get('gid')
		})
	    });
	    this.modals.show(bse);
	},
	createBlockscreenGroup: function () {

	    var bsg = new App.View.BlockScreens.Groups.EditForm({
		blockscreens: this,
		bsg: new App.Model.BlockScreens.Groups.Element,
	    });
	    this.modals.show(bsg);
	},
	select_blockscreen_group: function (group) {

	    var gid = group.get('gid');
	    if (typeof (gid) === "undefined") {
		return;
	    }
	    var group_item = this.ui.bsGroups.find('.item-container[gid="' + gid + '"]');
	    console.log(group_item);
	    group_item.trigger('click');
	},
	selectBlockscreenGroupHandler: function (group) {

	    var that = this;
	    var gid = group.get('gid');
	    if (typeof (gid) === "undefined") {
		return;
	    }

	    this.selected_group = group;
	    /* Get files associated with this group */

	    App.Database.getBlockScreenFiles(group).then(function (files) {

		/* parse each file and get JSON objects  */
		console.log(files);
		that.parseBlockscreensFiles(files).then(function (objects) {

		    console.log(objects);
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
		fse.readFile(item.file, function (err, res) {

		    if (err)
			throw new Error(err);
		    var parser = new xml2js.Parser();
		    parser.parseString(res, function (err, res) {
			if (err) {
			    throw new Error(err);
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
	    win.debug("bs onShow");
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
	    win.debug("bs load_bs_groups");
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
