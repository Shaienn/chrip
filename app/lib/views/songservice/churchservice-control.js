/**
 * Created by shaienn on 02.09.15.
 */

/* It is a type of work mode when we make a presentation and show it on decided screen */


(function (App) {
    'use strict';

    App.View.ChurchService.Control = Backbone.Marionette.LayoutView.extend({
        template: '#churchservice-control-tpl',
        id: 'churchservice-control-contain',
        collection: null,
        regions: {
            BottomToolbar_r: '#playlist_bottomtoolbar',
            List_r: '#playlist_list',
            ControlPanel_r: "#controlPanel",
        },
        modals: {
            selector: '.modal_area',
            regionClass: Backbone.Marionette.Modals

        },
        /******************* Layout functions *******************/

        initialize: function () {

            App.vent.on("churchservice:playlist:item_selected", _.bind(this.showPlaylistItemControl, this));
            App.vent.on("songservice:control:do_on_show", _.bind(this.doOnShow, this));
            App.vent.on("songservice:control:do_on_hide", _.bind(this.doOnHide, this));
            App.vent.on("songservice:control:showslide", _.bind(this.showSlide, this));

        },
        onShow: function () {

            this.BottomToolbar_r.show(new App.View.ChurchService.Control.BottomToolBar);

            this.collection = new App.View.PlayListCollection({
                childView: App.View.PlayListControl,
                collection: App.Model.PlayListCollection,
            });

            this.List_r.show(this.collection);

        },
        onDestroy: function () {

            App.vent.off("songservice:control:assignKeys");
            App.vent.off("songservice:control:freeKeys");
            App.vent.off("churchservice:playlist:item_selected");
            App.vent.off("songservice:control:showslide");
        },
        /**************************************/

        showSlide: function (slide) {

            if (App.freeze_mode == true)
                return;

            /* TODO some logic to separate to few presentation screens */

            for (var i in App.PresentationWindows) {

                var body = App.PresentationWindows[i].window.document.body;
                var content = $(body).find("#presentation-content");

                /* Find everything inside this container */

                var garbage = content.children().addClass("garbage");
                var slide_template = _.template($('#slide-tpl').html());
                content.append(slide_template({
                    background: slide.get("background"),
                    text: slide.get("text"),
                    height: slide.get("height"),
                    width: slide.get("width"),
                    number: slide.get("number"),
                    font: slide.get("font"),
                }));
                var newSlide = content.find('div.slide-container').not(".garbage");
                newSlide.find("div.slide_text span").bigText();
                newSlide.css("opacity", 0);

                newSlide.animate({opacity: 1.0}, {duration: 1000, queue: false});
                garbage.animate({opacity: 0.0},
                        {
                            duration: 1000,
                            queue: false,
                            complete: function () {
                                $(this).remove();
                            }
                        }
                );
            }



            $('.control-panel-list .slide-item.active').removeClass('active');
            $('.control-panel-list .slide-item div[number=' + slide.get('number') + ']')
                    .parent().addClass("active");

        },
        /* Modal window */

        open_song_settings_modal: function (song) {

        },
        showPlaylistItemControl: function (item) {
            win.log("Show playlist item request");

            if (item instanceof App.Model.Song) {

                /* Collection of itemviews */

                var itemCollection = new App.Model.SongControlPanelCollection(item.slides);
                var itemCollectionView = new App.View.SongControlPanelCollection({
                    collection: itemCollection,
                });

                this.keyAssign(item.slides.length);

            }

            this.ControlPanel_r.show(itemCollectionView);

        },
        doOnShow: function () {

            this.doOnHide();
            $(App.ControlWindow.window.document).on('keydown', this.keyHandler);
            this.List_r.currentView.render();

        },
        doOnHide: function () {

            $(App.ControlWindow.window.document).off('keydown', this.keyHandler);

        },
        keyHandler: function (event) {

            event.preventDefault();

            var key = event.which;

            if ((key >= 97) && (key <= 105)) {

                this.keys.forEach(function (item) {

                    if (item.key == key) {

                        var controlPanel = $('#controlPanel ul');
                        controlPanel.find('.slide-item').removeClass('active');
                        var item = controlPanel.find('.slide-container[number=' + item.c + ']');
                        item.trigger('click');
                        item.parents('.slide-item').addClass('active');
                        return;

                    }
                });
            }


            if ((key >= 37) && (key <= 40)) {

                switch (key) {

                    case (37):

                        /* Select previous slide */

                        var controlPanel = $('#controlPanel ul');
                        var currentSlide = controlPanel.find('li.active');
                        var prevSlide = currentSlide.prev('#controlPanel ul li');
                        if (prevSlide.length > 0) {

                            currentSlide.removeClass('active');
                            prevSlide.find('.slide-container').trigger('click');
                            prevSlide.addClass('active');

                        }
                        break;

                    case (39):

                        /* Select next slide */

                        var controlPanel = $('#controlPanel ul');
                        var currentSlide = controlPanel.find('li.active');
                        var nextSlide = currentSlide.next('#controlPanel ul li');
                        if (nextSlide.length > 0) {

                            currentSlide.removeClass('active');
                            nextSlide.find('.slide-container').trigger('click');
                            nextSlide.addClass('active');

                        }
                        break;

                    case (38):

                        /* Select previous song */

                        var playlist_list = $('#playlist_list ul');
                        var currentSong = playlist_list.find('li.active');
                        var prevSong = currentSong.prev('#playlist_list ul li');
                        if (prevSong.length > 0) {

                            currentSong.removeClass('active');
                            prevSong.find('.playlistItem').trigger('click');
                            prevSong.addClass('active');

                        }
                        break;

                    case (40):

                        /* Select next song */

                        var playlist_list = $('#playlist_list ul');
                        var currentSong = playlist_list.find('li.active');
                        var nextSong = currentSong.next('#playlist_list ul li');
                        if (nextSong.length > 0) {

                            currentSong.removeClass('active');
                            nextSong.find('.playlistItem').trigger('click');
                            nextSong.addClass('active');

                        }
                        break;

                }
            }
        },
        keyAssign: function (slides_count) {

            this.keys = [];

            if (slides_count > 0) {

                /* 7 or Home is it */

                this.keys.push({key: 103, c: 0});

                if (slides_count > 1) {

                    /* 8 or Up is it */

                    this.keys.push({key: 104, c: 1});

                    if (slides_count > 2) {

                        if (slides_count > 4) {

                            /* 9 or PgUp is it */

                            this.keys.push({key: 105, c: 2});

                        } else {

                            /* 4 or Left is it */

                            this.keys.push({key: 100, c: 2});

                        }

                        if (slides_count > 3) {

                            if (slides_count > 4) {

                                /* 4 or Left is it */

                                this.keys.push({key: 100, c: 3});

                            } else {

                                /* 5 or Left is it */

                                this.keys.push({key: 101, c: 3});

                            }

                            if (slides_count > 4) {

                                /* 5 or Left is it */

                                this.keys.push({key: 101, c: 4});

                                if (slides_count > 5) {

                                    /* 6 or Right is it */

                                    this.keys.push({key: 102, c: 5});


                                    if (slides_count > 6) {

                                        /* 1 or End is it */

                                        this.keys.push({key: 97, c: 6});

                                        if (slides_count > 7) {

                                            /* 2 or Down is it */

                                            this.keys.push({key: 98, c: 7});

                                            if (slides_count > 8) {

                                                /* 3 or PgDn is it */

                                                this.keys.push({key: 99, c: 8});

                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
    });

})(window.App);
