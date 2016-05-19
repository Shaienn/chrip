/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    /* Model */

    App.Model.BlockScreens.Groups.Element = Backbone.Model.extend({
	defaults: {
	    name: "",
	    gid: null,
	    fid: null,
	}
    });

    App.Model.BlockScreens.Groups.List = Backbone.Collection.extend({
	model: App.Model.BlockScreens.Groups.Element
    });


    /* Lower element */
    App.Model.BlockScreens.Elements.Element = Backbone.Model.extend({
	defaults: {
	    name: "",
	    html: '<div id="bs-element-0" style="width: 100%; height: 100%; top: 0px; left: 0px; position: absolute; background-color: rgb(255, 255, 255);" class="bs-html-background-container-0"></div>',
	    preview: ""
	},
    });

    /* Collection of lower elements */
    App.Model.BlockScreens.Elements.List = Backbone.Collection.extend({
	model: App.Model.BlockScreens.Elements.Element,
    });


    /* Editor elements */

    App.Model.BlockScreens.Editor.Element = Backbone.Model.extend({
	defaults: {
	    name: "element",
	    type: "",
	    html: "",
	    settings: {}
	}
    });


    App.Model.BlockScreens.Editor.List = Backbone.Collection.extend({
	model: App.Model.BlockScreens.Editor.Element,
    });


})(window.App);
