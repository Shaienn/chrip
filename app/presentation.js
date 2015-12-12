(function (App) {
    'use strict';

    var Presentation = {

        isVisible: false,
        windowObject: null,


        open: function () {

            if (this.isVisible == false){
                this.windowObject = window.open("app://host/src/app/presentation.html", "presentation");
                this.isVisible = true;
            }

        },

        close: function () {

        }


    };

    App.Presentation = Presentation;

})(window.App);
