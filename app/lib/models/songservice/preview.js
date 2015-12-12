/**
 * Created by shaienn on 04.09.15.
 */

(function (App) {
    'use strict';

    var Preview = Backbone.Model.extend({

        defaults: {

            plaintext: "",
            html: "",

        },

        initialize: function () {

            this.on('change:plaintext', this.textToHtml(), this);

        },

        textToHtml: function () {

            var html =
                this.get('plaintext')
                    .replace(/\r\n\[part\]/g, "")
                    .replace(/\r\n\[\/part\]/g, "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\t/g, "    ")
                    .replace(/ /g, "&#8203;&nbsp;&#8203;")
                    .replace(/\r\n|\r|\n/g, "<br />");

            this.set('html', html);
        },


    });
    App.Model.Preview = Preview;


})(window.App);