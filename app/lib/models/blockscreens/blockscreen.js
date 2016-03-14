/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    /* Model */

    App.Model.BlockScreens.Groups.Group = Backbone.Model.extend({
	defaults: {
	    name: "",
	}
    });

    App.Model.BlockScreens.Groups.List = Backbone.Collection.extend({
	model: App.Model.BlockScreens.Groups.Group
    });


    /* Lower element */
    App.Model.BlockScreens.Elements.Element = Backbone.Model.extend({
	defaults: {
	    name: "",
	    html: '<div id="bs-element-0" style="width: 100%; height: 100%; top: 0px; left: 0px; position: absolute; background-color: rgb(255, 0, 0);" class="bs-html-background-container-0"></div>',
	    preview: ""
	},
    });

    /* Collection of lower elements */
    App.Model.BlockScreens.Elements.List = Backbone.Collection.extend({
	model: App.Model.BlockScreens.Elements.Element,
    });


    /* Editor elements */

    App.Model.BlockScreenEditorElement = Backbone.Model.extend({
	defaults: {
	    name: "element",
	    type: "",
	    html: "",
	    settings: {}
	}
    });


    App.Model.BlockScreenEditorElementsCollection = Backbone.Collection.extend({
	model: App.Model.BlockScreenEditorElement,
    });


})(window.App);
