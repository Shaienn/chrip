'use strict';
(function (App) {

    App.SplashScreen = {
        is_open: false,
        window_obj: {},
        open: function () {
            var d = Q.defer();
            var that = this;

            if (this.is_open == true) {
                d.reject(false);
                return d.promise;
            }

            /* Open splash screen */

            this.window_obj = gui.Window.get(
                    window.open("./splash.html", "splash", {
                        frame: false,
                        width: 400,
                        height: 250,
                        transparent: true,
                    }));

            this.window_obj.on("resize", function () {
                that.window_obj.setPosition("center");
            });

            this.window_obj.window.onload = function () {
                that.is_open = true;
                that.window_obj.setTransparent(!that.window_obj.isTransparent);
                that.window_obj.show();
                that.window_obj.width = 400;
                that.window_obj.height = 250;
                that.window_obj.setResizable(false);
                d.resolve(true);
            }

            return d.promise;
        },
        send_progress: function (task, status) {

            if (this.is_open == false)
                return;

            var body = this.window_obj.window.document.body;

            if (task != null) {
                $(body).find(".task").html(task);
            }

            if (status != null) {
                $(body).find(".status").html(status);
            } else {
                $(body).find(".status").html("");
            }

        },
        close: function () {
            if (this.is_open == false)
                return;

            this.window_obj.close();
            this.is_open = false;
        }
    }

})(window.App);

