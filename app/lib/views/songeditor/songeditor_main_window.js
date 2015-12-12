/**
 * Created by shaienn on 24.09.15.
 */



(function (App) {
        'use strict';

        var _this;
        var SongEditor = Backbone.Marionette.LayoutView.extend({

                template: '#songeditor-main-window-tpl',
                id: 'songeditor-main-window',
                loaded_text: "",

                regions: {
                    Toolbar: '#songeditor_toolbar',
                    InputArea: '#songeditor_inputarea',
                    PreviewArea: '#songeditor_previewarea',
                },

                initialize: function () {

                    _this = this;
                    this.nativeWindow = require('nw.gui').Window.get();
                    if (this.options.loaded_text != "undefined") {

                        this.loaded_text = this.options.loaded_text;
                    }

                    win.log("Init complete: " + this.loaded_text);
                },

                onShow: function () {

                    win.log(this.loaded_text);

                    this.nativeWindow.title = App.Config.title;
                    this.InputArea.show(
                        new App.View.InputAreaView(
                            {
                                loaded_text: this.loaded_text
                            }
                        )
                    );
                    this.PreviewArea.show(new App.View.PreviewAreaView());

                }
                ,


            })
            ;


        App.View.SongEditor.Root = SongEditor;
    }(window.App)
);