'use strict';

(function (App) {

    App.View.BlockScreens.Helper = {
	createBlockScreenFromImage: function (image_path, gid) {

	    var d = Q.defer();

	    console.log("createBlockScreenFromImage");

	    var screen_bounds = Settings.Utils.getPresentationScreen().bounds;
	    var extension = path.extname(image_path);
	    var file = path.basename(image_path, extension);

	    console.log("file: %s", file);

	    App.View.BlockScreens.Helper.convertImageToBase64(image_path).then(function (img_data) {

		console.log("image converted");

		var preview_html = "<style>body {padding:0; margin:0; left:0; top: 0} html {padding:0; margin:0; left:0; top: 0} svg{ font-kerning: normal; }</style>";
		preview_html += '<div id="bs-element-0" style="width: 100%; height: 100%; top: 0px; left: 0px; position: absolute; background-color: rgb(0, 0, 0);" class="bs-html-background-container-0"></div>';

		var dimensions = sizeOf(image_path.toString());
		var width = (Math.min(screen_bounds.width, dimensions.width) / screen_bounds.width) * 100;
		var height = (Math.min(screen_bounds.height, dimensions.height) / screen_bounds.height) * 100;
		var top = (100 - height) / 2;
		var left = (100 - width) / 2;

		var element = $('<div/>', {
		    id: "bs-element-1",
		    class: "bs-html-img-container-1",
		    name: "image",
		    css: {
			top: top + "%",
			left: left + "%",
			backgroundImage: "url(data:image/png;base64," + img_data + ")",
			backgroundRepeat: "no-repeat",
			backgroundSize: "contain",
			backgroundPosition: "center center",
			width: width + "%",
			height: height + "%",
			position: "absolute",
		    }
		});

		preview_html += element.prop('outerHTML');

		console.log("preview_html: %s", preview_html);

		var bs = new App.Model.BlockScreens.Elements.Element({
		    name: "from image",
		    html: preview_html,
		    preview: "data:image/png;base64," + img_data,
		    gid: gid
		});

		var obj = JSON.stringify(bs);
		var builder = new xml2js.Builder();
		var xml = builder.buildObject(obj);
		console.log(xml);

		var bs_path = Settings.BlockScreensSettings.bs_folder + "/" + file + ".bs";

		console.log(bs_path);

		fse.writeFile(bs_path, xml, function (err) {
		    if (err)
			throw new Error(err);

		    console.log("file saved");
		    bs.set('file', bs_path);

		    App.Database.add_file_to_blockscreen_group(bs)
			    .then(function () {
				d.resolve(true);
			    });
		});


	    });
	    return d.promise;
	},
	getBlockScreenElements: function (bs) {

	    /* Get html string, create DOM element and parse with jQuery */
	    var container = $('<div/>', {
		html: bs.get('html')
	    });
	    var bsElements = new App.Model.BlockScreens.Editor.List();
	    /* iterate */

	    container.children().each(function (index) {

		var element = this;
		var name = "element-" + index;
		if ($(element).attr('name') != "undefined") {
		    name = $(element).attr('name');
		}
		$(element).attr('id', "bs-element-" + bsElements.length);

		if ($(element).is('[class*="bs-html-img-container-"]')) {

		    var element = new App.Model.BlockScreens.Editor.Element({
			name: name,
			type: "img",
			html: $(element).prop('outerHTML'),
			id: $(element).attr('id')
		    });
		    bsElements.add(element);
		}

		if ($(element).is('[class*="bs-html-text-container-"]')) {

		    var element = new App.Model.BlockScreens.Editor.Element({
			name: name,
			type: "text",
			html: $(element).prop('outerHTML'),
			id: $(element).attr('id')
		    });
		    bsElements.add(element);
		}

		if ($(element).is('[class*="bs-html-background-container-"]')) {

		    var element = new App.Model.BlockScreens.Editor.Element({
			name: name,
			type: "background",
			html: $(element).prop('outerHTML'),
			id: $(element).attr('id')
		    });
		    bsElements.add(element);
		}
	    });

	    return bsElements;
	},
	convertImageToBase64: function (path) {
	    var d = Q.defer();
	    var options = {localFile: true, string: true};
	    base64.base64encoder(path, options, function (err, image) {
		if (err)
		    throw new Error(err);

		d.resolve(image);
	    });
	    return d.promise;
	},
    }
})(window.App);




