/* Video control screen */

(function (App){
    'use strict'

    App.View.Videoplayer.Control = Backbone.Marionette.LayoutView.extend({

        template: '#videoplayer-control-tpl',
        id: 'videoplayer-control-contain',

        regions: {

            MediaList_r: '#videoplayer_videolist',
            BottomToolBar_r: '#videoplayer_bottomtoolbar',
            MediaControl_r: '#videoplayer_videocontrol',
        },


        /******************* Layout functions *******************/

        initialize: function(){

            App.vent.on("mediaplayer:control:media_selected",
                        _.bind(this.mediaSelected, this));

        },

        onShow: function(){


            this.BottomToolBar_r.show(new App.View.Videoplayer.Control.BottomToolBar);

            this.MediaList_r.show(new App.View.MediaListCollection({
                childView: App.View.MediaListControl,
                collection: App.Model.MediaListCollection,
            }));

        },

        onDestroy: function(){

            App.vent.off("mediaplayer:control:media_selected");
        },


        /**************************************/

        mediaSelected: function(media){
            console.log("media selected: "+media.get('type'));

            switch (media.get('type')){
            case ("video"):
            case ("audio"):
                this.MediaControl_r.show(new App.View.MediaControl({
                    media_element: media,
                }));
                break;
            default:

                break;
            }

        },

    });

}(window.App));
