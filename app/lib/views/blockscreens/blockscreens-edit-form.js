/**
 * Created by shaienn on 29.09.15.
 */

(function (App) {
    'use strict';
    App.View.BlockScreensDeleteModal = Backbone.Modal.extend({
	template: '#blockscreens-modal-tpl',
	events: {
	    'click #delete-btn': 'deleteBtnHandler',
	    'click #cancel-btn': 'cancelBtnHandler',
	},
	serializeData: function () {
	    return {
		"name": this.song.get('name')
	    }
	},
	initialize: function (options) {

	    if (typeof options.song != "undefined") {
		this.song = options.song;
	    }

	    if (typeof options.songbase != "undefined") {
		this.songbase = options.songbase;
	    }

	    if (typeof options.author != "undefined") {
		this.author = options.author;
	    }


	},
	beforeCancel: function () {
	    /* It prevents close modal when we click outside */
	    return false;
	},
	deleteBtnHandler: function () {

	    win.log("delete");
	    /* Delete authorname to db */

	    App.Database.deleteSong(this.song);
	    this.songbase.loadSongsLoader();
	    var that = this;
	    App.Database.close()
		    .then(function () {
			App.Database.init().then(function () {
			    that.songbase.selectAuthor(that.author);
			});
		    });
	    this.cancel();
	},
	cancelBtnHandler: function () {
	    this.cancel();
	},
	cancel: function () {
	    win.log("cancel");
	    this.destroy();
	}

    });
    App.View.BlockScreensEditForm = Backbone.Modal.extend({
	id: 'blockscreens-modal',
	template: '#blockscreens-edit-modal-tpl',
	lock: false,
	texts: [],
	background: [],
	elements_collection: null,
	selected_element_index: null,
	ui: {
	    bsElementsList: "#bs-texts-list",
	    bsEditorArea: '#bs-editor-area',
	    bsPreviewArea: '#bs-preview-area',
	    bsPreviewImage: '#bs-preview-image-area',
	    bsImgInput: '#img-input',
	    bsCanvas: '#bs-hidden-canvas'
	},
	events: {
	    'click #bs-add-text-btn': 'addTextHandler',
	    'click #bs-add-img-btn': 'openImgDialog',
	    'click #save-btn': 'saveBtnHandler',
//            'click #cancel-btn': 'cancelBtnHandler',
	    'change :file': 'addImgHandler',
	},
	initialize: function (options) {

	    if (typeof options.blockscreen != "undefined") {
		this.blockscreen = options.blockscreen;
	    }

	    if (typeof options.file_path != "undefined") {
		this.file_path = options.file_path;
	    }

	    this.listenTo(App.vent, "blockscreens:modal:select_item", _.bind(this.selectElement, this));
	    this.listenTo(App.vent, "blockscreens:modal:remove_item", _.bind(this.removeElement, this));
	    this.listenTo(App.vent, "blockscreens:modal:edit_item:set_text_align", _.bind(this.setTextAlign, this));
	    this.listenTo(App.vent, "blockscreens:modal:edit_item:set_color", _.bind(this.setColor, this));
//            this.listenTo(App.vent, "modal:remove_songpart", _.bind(this.removeSongpart, this));
	},
	onShow: function () {

	    var that = this;
	    var bsElementsCollection = this.getBlockScreenItems(this.blockscreen);
	    this.elements_collection = new App.View.BlockScreenEditorElementsCollection({
		collection: bsElementsCollection,
		childView: App.View.BlockScreenEditorElement
	    });
	    this.screen_bounds = Settings.Utils.getPresentationScreen().bounds;
	    var editor = $(this.ui.bsEditorArea);
	    this.scale = Math.min(
		    editor.width() / this.screen_bounds.width,
		    editor.height() / this.screen_bounds.height
		    );
	    editor.append(
		    $('<div/>', {
			class: "bs-screen-area",
			width: this.screen_bounds.width * this.scale,
			height: this.screen_bounds.height * this.scale,
		    })
		    );
	    var preview_width = 300;
	    var preview_height = 200;
	    this.preview_scale = Math.min(
		    preview_width / this.screen_bounds.width,
		    preview_height / this.screen_bounds.height
		    );
	    $(this.ui.bsCanvas).attr('width', this.screen_bounds.width * this.preview_scale);
	    $(this.ui.bsCanvas).attr('height', this.screen_bounds.height * this.preview_scale);
	    this.elements_collection.render();
	    $(this.ui.bsElementsList).html(this.elements_collection.el);
	    this.elements_collection.collection.on("add change remove", function () {
		console.log("collection render again");
		console.log(that.elements_collection);
		that.elements_collection.render();
		that.renderPreviewArea();
	    });
	    this.renderPreviewArea(true);
	},
	/**********************************************/

	getBlockScreenItems: function (bs) {

	    /* Get html string, create DOM element and parse with jQuery */
	    console.log(bs);
	    var container = $('<div/>', {
		html: bs.get('html')
	    });
	    var bsElements = new App.Model.BlockScreenEditorElementsCollection();
	    /* iterate */

	    container.children().each(function (index) {

		var element = this;
		var name = "element-" + index;
		if ($(element).attr('name') != "undefined") {
		    name = $(element).attr('name');
		}

		if ($(element).is('[class*="bs-html-img-container-"]')) {

		    var element = new App.Model.BlockScreenEditorElement({
			name: name,
			type: "img",
			html: $(element).prop('outerHTML'),
			id: "bs-element-" + bsElements.length,
		    });
		    bsElements.add(element);
		}

		if ($(element).is('[class*="bs-html-text-container-"]')) {

		    var element = new App.Model.BlockScreenEditorElement({
			name: name,
			type: "text",
			html: $(element).prop('outerHTML'),
			id: "bs-element-" + bsElements.length,
		    });
		    bsElements.add(element);
		}

		if ($(element).is('[class*="bs-html-background-container-"]')) {

		    var element = new App.Model.BlockScreenEditorElement({
			name: name,
			type: "background",
			html: $(element).prop('outerHTML'),
			id: "bs-element-" + bsElements.length,
		    });
		    bsElements.add(element);
		}
	    });
	    return bsElements;
	},
	/* Buttons handlers */

	openImgDialog: function () {
	    $(this.ui.bsImgInput).trigger('click');
	},
	convertImageToBase64: function (path) {
	    var d = Q.defer();
	    var options = {localFile: true, string: true};
	    base64.base64encoder(path, options, function (err, image) {

		if (err) {
		    d.reject(err);
		}
		d.resolve(image);
	    });
	    return d.promise;
	},
	addImgHandler: function () {

	    var that = this;
	    var files = $(this.ui.bsImgInput)[0].files;
	    var editor = $(this.ui.bsEditorArea).children('.bs-screen-area');
	    for (var i = 0; i < files.length; i++) {

		var path = files[i].path;
		/* Convert image to base64 type */

		this.convertImageToBase64(path).then(function (img_data) {

		    var dimensions = sizeOf(path.toString());
		    /* Create image element */

		    var width = Math.min(editor.width(), dimensions.width);
		    var height = Math.min(editor.height(), dimensions.height);
		    var top = ((editor.height() - height) * 50) / editor.height();
		    var left = ((editor.width() - width) * 50) / editor.width();
		    var element = $('<div/>', {
			id: "bs-element-" + that.elements_collection.collection.length,
			class: "bs-html-img-container-" + that.elements_collection.collection.length,
			css: {
			    top: top + "%",
			    left: left + "%",
			    backgroundImage: "url(data:image/png;base64," + img_data + ")",
			    backgroundRepeat: "no-repeat",
			    backgroundSize: "contain",
			    backgroundPosition: "center center",
			    width: width + "px",
			    height: height + "px",
			    position: "absolute",
			}
		    });
		    var new_img = new App.Model.BlockScreenEditorElement({
			type: "img",
			name: "image " + that.elements_collection.collection.length,
			id: "bs-element-" + that.elements_collection.collection.length,
			html: $(element).prop('outerHTML')
		    });
		    that.elements_collection.collection.add(new_img);
		    that.renderPreviewArea();
		});
	    }
	},
	addTextHandler: function () {

	    var element = $('<div/>', {
		id: "bs-element-" + this.elements_collection.collection.length,
		name: "text " + this.elements_collection.collection.length,
		class: "bs-html-text-container-" + this.elements_collection.collection.length,
		css: {
		    top: "50%",
		    left: "50%",
		    position: "absolute",
		}

	    });
	    var text_span = $('<div/>', {
		class: "bs-editor-text",
		text: "initial text",
		css: {
		    textAlign: "center",
		    color: "#000000",
		    fontFamily: "Arial"
		}
	    });
	    element.append(text_span);
	    var new_text = new App.Model.BlockScreenEditorElement({
		type: "text",
		name: "text " + this.elements_collection.collection.length,
		id: "bs-element-" + this.elements_collection.collection.length,
		html: $(element).prop('outerHTML')
	    });
	    this.elements_collection.collection.add(new_text);
	    this.renderPreviewArea();
	},
	/* Element operations */

	selectElement: function (element) {
	    this.elements_collection.selectedElement = this.elements_collection.collection.indexOf(element);
	    var elements_list = $(this.ui.bsElementsList).children('.bs_elements');
	    elements_list.children('[data-backbone-cid!=' + element.cid + ']').removeClass('active');
	    elements_list.children('[data-backbone-cid=' + element.cid + ']').addClass('active');
	    this.renderPreviewArea();
	},
	removeElement: function (element) {
	    var id = element.get('id');
	    var editor = $(this.ui.bsEditorArea).children('.bs-screen-area');
	    var jquery_element = editor.find("#" + id);
	    if (jquery_element.length === 1) {
		jquery_element.remove();
	    }
	    this.elements_collection.collection.remove(element);
	},
	/* Change settings */

	setTextAlign: function (align) {

	    var element = this.elements_collection.collection.at(this.elements_collection.selectedElement);
	    var id = element.get('id');
	    var editor = $(this.ui.bsEditorArea).children('.bs-screen-area');
	    var jquery_element = editor.find("#" + id).find('.bs-editor-text');
	    if (jquery_element.length === 1) {
		jquery_element.css('text-align', align);
	    }

	},
	setColor: function (color) {

	    var element = this.elements_collection.collection.at(this.elements_collection.selectedElement);
	    if (typeof (element) === 'undefined')
		return;
	    var id = element.get('id');
	    var editor = $(this.ui.bsEditorArea).children('.bs-screen-area');
	    var type = element.get('type');

	    switch (type) {

		case ('text'):
		    editor.find("#" + id).find('.bs-editor-text').css('color', color);
		    break;
		case ('background'):
		    editor.find("#" + id).css('background-color', color);
		    break;
	    }


	},
	renderPreviewArea: function (clear) {

	    var editor = $(this.ui.bsEditorArea).children('.bs-screen-area');
	    if (this.elements_collection.collection.length === 0) {
		return;
	    }

	    if (clear === true) {
		editor.html("");
	    }

	    for (var i = 0; i < this.elements_collection.collection.length; i++) {

		var element = this.elements_collection.collection.at(i);
		var id = element.get('id');
		var jquery_element = editor.find("#" + id);
		if (jquery_element.length == 0) {
		    var html = element.get('html');
		    jquery_element = $($.parseHTML(html));
		    this.append_resize_control(jquery_element, i, element.get("type"));
		    editor.append(jquery_element);
		}

		jquery_element.css("z-index", i);
		if (this.elements_collection.selectedElement === i) {

		    if (element.get('type') === "text") {
			jquery_element.addClass("bs-editable");
			jquery_element.resizable('enable');
			jquery_element.draggable('enable');
			jquery_element.removeClass('bs-inline-edit');
			jquery_element.unbind('dblclick');
			jquery_element.dblclick(function (e) {
			    e.stopPropagation();
			    e.preventDefault();
			    var jquery_text_container = $(this).children('.bs-editor-text');
			    jquery_text_container.attr("contenteditable", "false");
			    jquery_text_container.off();
			    if ($(this).hasClass('bs-inline-edit')) {
				$(this).removeClass('bs-inline-edit');
				jquery_text_container.children('span.textfitted').attr("contenteditable", "false");
				$(this).resizable('enable');
				$(this).draggable('enable');
				$(this).find('.bs-text-toolbar').hide();
			    } else {
				$(this).addClass('bs-inline-edit');
				$(this).resizable('disable');
				$(this).draggable('disable');
				jquery_text_container.children('span.textfitted').attr("contenteditable", "true");
				$(this).find('.bs-text-toolbar').show();
				jquery_text_container.on('paste', 'span.textfitted', function (e) {
				    e.preventDefault();
				    var text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('Paste something..');
				    window.document.execCommand('insertText', false, text);
				});
				jquery_text_container.on('focus', 'span.textfitted', function (e) {
				    var $this = $(this);
				    $this.data('before', $this.html());
				});
				jquery_text_container.on('blur keyup paste', 'span.textfitted', function (e) {
				    var $this = $(this);
				    if ($this.data('before') !== $this.html()) {
					$this.data('before', $this.html());
					jquery_text_container.textFit({
					    multiline: true,
					    originalWidth: jquery_element.outerWidth(),
					    originalHeight: jquery_element.outerHeight()
					});
				    }
				});
				jquery_text_container.on('keydown', 'span.textfitted', function (e) {
				    if (e.which === 13) {
					document.execCommand('insertHTML', false, '<br><br>');
					return false;
				    }
				});
			    }
			});
		    } else {
			jquery_element.resizable('enable');
			jquery_element.draggable('enable');
		    }

		} else {

		    jquery_element.resizable('disable');
		    jquery_element.draggable('disable');
		    jquery_element.unbind('dblclick');
		    jquery_element.removeClass("bs-editable");
		    jquery_element.removeClass('bs-inline-edit');
		    jquery_element.children('.bs-editor-text').children('span.textfitted').attr("contenteditable", "false");
		    jquery_element.children('.bs-editor-text').off();
		}
	    }
	},
	append_text_control: function (jquery_element, num) {

	    var jquery_text_element = jquery_element.find('.bs-editor-text');
	    var toolbar_width = 224;
	    /* Append buttons */

	    var align_left = $('<div/>', {
		id: "bs-text-align-left-btn-" + num,
		html: '<i class="fa fa-align-left"></i>',
		css: {
		    float: "left"
		}
	    });
	    var align_center = $('<div/>', {
		id: "bs-text-align-center-btn-" + num,
		html: '<i class="fa fa-align-center"></i>',
		css: {
		    float: "left"
		}
	    });
	    var align_right = $('<div/>', {
		id: "bs-text-align-right-btn-" + num,
		html: '<i class="fa fa-align-right"></i>',
		css: {
		    float: "left"
		}
	    });
	    var toolbar = $('<div/>', {
		id: "bs-text-toolbar-" + num,
		class: "bs-text-toolbar",
		css: {
		    display: "none",
		    position: "absolute",
		    top: "calc( 100% + 10px )",
		    color: "white",
		    height: "auto",
		    width: toolbar_width + "px",
		}
	    });
	    toolbar.append(align_left);
	    toolbar.append(align_center);
	    toolbar.append(align_right);
	    /* Handlers */

	    align_left.click(function () {
		jquery_text_element.css('text-align', 'left');
	    });
	    align_center.click(function () {
		jquery_text_element.css('text-align', 'center');
	    });
	    align_right.click(function () {
		jquery_text_element.css('text-align', 'right');
	    });
	    var colorPicker = new ColorPicker({
		width: 100,
		height: 100
	    });
	    colorPicker.setColor(jquery_text_element.css('color'));
	    colorPicker.onChange(function () {
		var newColor = colorPicker.getHexString();
		jquery_text_element.css('color', newColor);
	    });
	    colorPicker.appendTo(toolbar);
	    jquery_element.append(toolbar);
	},
	append_resize_control: function (elem, num, type) {
	    $('<div/>', {
		id: "nwgrip-" + num,
	    }).appendTo(elem);
	    $('<div/>', {
		id: "negrip-" + num,
	    }).appendTo(elem);
	    $('<div/>', {
		id: "swgrip-" + num,
	    }).appendTo(elem);
	    $('<div/>', {
		id: "segrip-" + num,
	    }).appendTo(elem);
	    $('<div/>', {
		id: "ngrip-" + num,
	    }).appendTo(elem);
	    $('<div/>', {
		id: "sgrip-" + num,
	    }).appendTo(elem);
	    $('<div/>', {
		id: "egrip-" + num,
	    }).appendTo(elem);
	    $('<div/>', {
		id: "wgrip-" + num,
	    }).appendTo(elem);
	    elem.resizable({
		containment: "parent",
		handles: {
		    'nw': '#nwgrip-' + num,
		    'ne': '#negrip-' + num,
		    'sw': '#swgrip-' + num,
		    'se': '#segrip-' + num,
		    'n': '#ngrip-' + num,
		    'e': '#egrip-' + num,
		    's': '#sgrip-' + num,
		    'w': '#wgrip-' + num
		},
	    });
	    if (type == "text") {
		elem.resizable({
		    resize: function (event, ui) {
			var jquery_text_element = elem.find(".bs-editor-text");
			jquery_text_element.textFit({
			    multiline: true,
			});
		    }
		});
	    }

	    elem.draggable({
		containment: "parent"
	    });
	},
	beforeCancel: function () {

	    /* It prevents close modal when we click outside */

	    return false;
	},
	saveBtnHandler: function () {

	    win.log("save");
	    if (this.lock == true)
		return;
//	    this.lock = true;
	    var that = this;
	    /* Collect all slides contents */

	    var editor = $(this.ui.bsEditorArea).find('.bs-screen-area');
	    var store_stack = [];
	    for (var i = 0; i < this.elements_collection.collection.length; i++) {
		var element = this.elements_collection.collection.at(i);
		var id = element.get('id');
		var container = editor.find("#" + id);
		if (container.length != 0) {
		    if ($(container).is('[class*="bs-html-text-container-"]')) {

			var text_element = $(container).children('.bs-editor-text');
			if (text_element.children('span.textfitted').length === 1) {
			    text_element = text_element.children('span.textfitted');
			}

			var width = ($(container).width() / editor.width()) * 100;
			var height = ($(container).height() / editor.height()) * 100;
			var y = ($(container).position().top / editor.height()) * 100;
			var x = ($(container).position().left / editor.width()) * 100;
			var simplified_element = $('<div/>', {
			    class: "bs-html-text-container-" + i,
			    name: $(container).attr('name'),
			    css: {
				width: width + "%",
				height: height + "%",
				top: y + "%",
				left: x + "%",
				position: "absolute",
				fontFamily: "Arial"
			    },
			});
			var text_span = $('<div/>', {
			    class: "bs-text",
			    html: text_element.html(),
			    css: {
				textAlign: text_element.css('text-align'),
				color: text_element.css('color'),
			    }
			});
			simplified_element.append(text_span);
			store_stack.push(simplified_element.prop('outerHTML'));
		    }


		    if ($(container).is('[class*="bs-html-img-container-"]')) {

			var width = ($(container).width() / editor.width()) * 100;
			var height = ($(container).height() / editor.height()) * 100;
			var y = ($(container).position().top / editor.height()) * 100;
			var x = ($(container).position().left / editor.width()) * 100;
			var simplified_element = $('<div/>', {
			    class: "bs-html-img-container-" + i,
			    name: $(container).attr('name'),
			    css: {
				width: width + "%",
				height: height + "%",
				top: y + "%",
				left: x + "%",
				position: "absolute",
				backgroundImage: $(container).css('background-image'),
				backgroundRepeat: $(container).css('background-repeat'),
				backgroundSize: $(container).css('background-size'),
			    },
			});
			store_stack.push(simplified_element.prop('outerHTML'));
		    }

		    if ($(container).is('[class*="bs-html-background-container-"]')) {
			var simplified_element = $('<div/>', {
			    class: "bs-html-background-container-" + i,
			    css: {
				width: '100%',
				height: '100%',
				top: 0,
				left: 0,
				position: "absolute",
				background: $(container).css('background'),
				backgroundColor: $(container).css('background-color'),
			    },
			});
			store_stack.unshift(simplified_element.prop('outerHTML'));
		    }

		}
	    }

	    var html = "";
	    for (var i = 0; i < store_stack.length; i++) {
		console.log(i + " - " + store_stack[i]);
		html += store_stack[i];
	    }

	    var preview_html = "<style>body {padding:0; margin:0; left:0; top: 0} html {padding:0; margin:0; left:0; top: 0} svg{ font-kerning: normal; }</style>";
	    preview_html += html;
	    editor.html(preview_html);
	    editor.find('.bs-text').each(function () {

		var parent = $(this).parent('[class*="bs-html-text-container-"]');
		if (parent.length === 1) {
		    $(this).width(parent.outerWidth());
		    $(this).height(parent.outerHeight());
		    $(this).textFit({
			multiline: true,
		    });
		} else {
		    $(this).remove();
		}
	    });
	    var canvas = $(this.ui.bsCanvas)[0];
	    rasterizeHTML
		    .drawHTML(editor.html(), null, {
			width: editor.outerWidth(),
			height: editor.outerHeight()
		    })
		    .then(function (renderResult) {

			var ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			var hRatio = canvas.width / renderResult.image.width;
			var vRatio = canvas.height / renderResult.image.height;
			var ratio = Math.min(hRatio, vRatio);
			var centerShift_x = (canvas.width - renderResult.image.width * ratio) / 2;
			var centerShift_y = (canvas.height - renderResult.image.height * ratio) / 2;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(renderResult.image, 0, 0, renderResult.image.width, renderResult.image.height,
				centerShift_x, centerShift_y, renderResult.image.width * ratio, renderResult.image.height * ratio);
			var imgStr = canvas.toDataURL("image/png", "");
			that.blockscreen.set('name', "test");
			that.blockscreen.set('html', html);
			that.blockscreen.set('preview', imgStr);

			var obj = JSON.stringify(that.blockscreen);

			var builder = new xml2js.Builder();
			var xml = builder.buildObject(obj.root);

//			console.log(xml);

			fs.writeFile(that.file_path + that.blockscreen.get('name') + '.bs', xml, function (err) {
			    if (err) {
				console.log(err);
			    }

			    that.cancel();
			});
		    });
	},
	cancelBtnHandler: function () {
	    this.cancel();
	},
	cancel: function () {
	    if (typeof this.control != "undefined") {
		/* Restore keydown events in parent window */
		this.control.onEvent();
	    }
	    this.destroy();
	},
	closeDatabase: function () {
	    App.Database.close().then(_.bind(this.openDatabase, this));
	},
	openDatabase: function () {
	    App.Database.init().then(_.bind(this.onReloadReady, this));
	},
	onReloadReady: function () {
	    var that = this;
	    if (typeof this.songbase != "undefined") {
		this.songbase.selectAuthor(this.author);
		this.songbase.hideSongsLoader();
	    }
	    if (typeof this.control != "undefined") {
		this.song.rebuild_slides().then(function () {
		    that.control.onSongSlidesRedraw(that.song);
		});
	    }
	}
    });
})(window.App);
