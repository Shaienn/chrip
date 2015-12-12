/**
 * Created by shaienn on 05.09.15.
 */

(function (App) {
    'use strict';

    var SlideGenerator = {
        makeSlideFromVerse: function (verse) {
            var d = Q.defer();

            var slideModel = new App.Model.BibleSlide();
            slideModel.set('number', 1);
            var slideBackground;

            switch (Settings.background_mode) {

                case ('all_slides_has_same_back'):
                    slideBackground = Settings.background;
                    break;
                case ('all_slides_has_random_back'):
                    slideBackground = Settings.Utils.getRandomBackground(false);
                    break;
            }

            /* Change newline characters for <br> tag. Needs for bigtext script */

            var sourceText = verse.get('text');
            
            /* Find _strings_ and make it italic */
            
            var preparedText = sourceText.trim().replace(/_(.*?)_/g, "<span class='italic'>$1</span>");
            var screen_bounds = ((Settings.Utils.getScreens())[Settings.presentation_monitor]).bounds;


            slideModel.set("text", preparedText);
            slideModel.set("link", verse.get('bottom_text'));
            slideModel.set("background", slideBackground);
            slideModel.set("width", screen_bounds.width);
            slideModel.set("height", screen_bounds.height);
            d.resolve(slideModel);

            return d.promise;
        },
        makeSlidesFromSong: function (song) {

            if (!(song instanceof App.Model.Song)) {
                win.error("Object is not song");
                return;
            }

            var textParts = this._getPartsFromText(song.get('text'));


            if (textParts.length == 0) {
                win.error("No textparts created");
                return;
            }

            var slides = [];

            textParts.forEach(function (item, i, arr) {

                slides.push(SlideGenerator.makeSlideFromText(item, i));

            });

            return Q.all(slides);
        },
        makeSlideFromText: function (text, number) {
            var d = Q.defer();

            var slideModel = new App.Model.SongSlide();

            if (number != "undefined") {
                slideModel.set('number', number);
            }

            var slideBackground;

            switch (Settings.background_mode) {

                case ('all_slides_has_same_back'):
                    slideBackground = Settings.background;
                    break;
                case ('all_slides_has_random_back'):
                    slideBackground = Settings.Utils.getRandomBackground(false);
                    break;
            }

            /* Change newline characters for <br> tag. Needs for bigtext script */

            var preparedText = text.trim().replace(/\r\n|\n/g, "<br>");

            var screen_bounds = ((Settings.Utils.getScreens())[Settings.presentation_monitor]).bounds;


            slideModel.set("text", preparedText);
            slideModel.set("background", slideBackground);
            slideModel.set("width", screen_bounds.width);
            slideModel.set("height", screen_bounds.height);
            d.resolve(slideModel);

            return d.promise;
        },
//        
//        
//        
//        
//        fromText_promise: function (text, number) {
//
//            var deferred = Q.defer()
//            var MyClass = java.import("nodeJava.MyClass");
//
//            var presentationScreenRect = java.newInstanceSync("java.awt.Rectangle");
//            presentationScreenRect.x = 0;
//            presentationScreenRect.y = 0;
//            presentationScreenRect.height = ((Settings.Utils.getScreens())[Settings.presentation_monitor]).bounds.height;
//            presentationScreenRect.width = ((Settings.Utils.getScreens())[Settings.presentation_monitor]).bounds.width;
//
//            var newMyClass = new MyClass;
//            var slideModel = new App.Model.Slide();
//
//            if (number != "undefined") {
//                slideModel.set('number', number);
//            }
//
//            var slideBackground;
//
//            switch (Settings.background_mode) {
//
//                case ('all_slides_has_same_back'):
//                    slideBackground = Settings.background;
//                    break;
//                case ('all_slides_has_random_back'):
//                    slideBackground = Settings.Utils.getRandomBackground(false);
//                    break;
//            }
//
//            newMyClass.createSlide(
//                    slideBackground,
//                    text,
//                    presentationScreenRect,
//                    Settings.font_family,
//                    Settings.slide_string_mode,
//                    function (err, image) {
//                        if (err) {
//                            win.error(err);
//                            deferred.reject(err);
//                        } else {
//                            win.log("ok");
//                            slideModel.set('slide', image);
//                            deferred.resolve(slideModel);
//                        }
//                    }
//            );
//
//            return deferred.promise;
//        },
//        fromVerse: function (verse) {
//
//            if (!(verse instanceof App.Model.Verse)) {
//                win.error("Object is not verse");
//                return;
//            }
//
//            var VerseClass = java.import("nodeJava.Verse");
//            var newVerseClass = new VerseClass();
//            var presentationScreenRect = java.newInstanceSync("java.awt.Rectangle");
//            presentationScreenRect.x = 0;
//            presentationScreenRect.y = 0;
//            presentationScreenRect.height = ((Settings.Utils.getScreens())[Settings.presentation_monitor]).bounds.height;
//            presentationScreenRect.width = ((Settings.Utils.getScreens())[Settings.presentation_monitor]).bounds.width;
//
//            var d = Q.defer();
//
//            var slideModel = new App.Model.Slide();
//            slideModel.set('number', 1);
//
//            var slideBackground;
//
//            switch (Settings.background_mode) {
//
//                case ('all_slides_has_same_back'):
//                    slideBackground = Settings.background;
//                    break;
//                case ('all_slides_has_random_back'):
//                    slideBackground = Settings.Utils.getRandomBackground(false);
//                    break;
//            }
//
//            newVerseClass.createSlide(
//                    slideBackground,
//                    verse.get('text'),
//                    verse.get('bottom_text'),
//                    presentationScreenRect,
//                    Settings.font_family,
//                    function (err, image) {
//                        if (err) {
//                            win.error(err);
//                            d.reject(err);
//                        } else {
//                            win.log("ok");
//                            slideModel.set('slide', image);
//                            d.resolve(slideModel);
//                        }
//                    }
//            );
//
//            return d.promise;
//        },
//        fromSong: function (song) {
//
//            if (!(song instanceof App.Model.Song)) {
//                win.error("Object is not song");
//                return;
//            }
//
//            var textParts = this._getPartsFromText(song.get('text'));
//
//
//            if (textParts.length == 0) {
//                win.error("No textparts created");
//                return;
//            }
//
//            var slides = [];
//
//            textParts.forEach(function (item, i, arr) {
//
//                slides.push(SlideGenerator.fromText_promise(item, i));
//
//            });
//
//            return Q.all(slides);
//        },
        _getPartsFromText: function (text) {

            var parts = [];
            var pattern = /\{(?:sos|start_of_slide)\}([\w\s\W\S]+?)\{(?:eos|end_of_slide)\}/g;
            var res;

            while ((res = pattern.exec(text)) != null) {

                parts.push(res[1]);
            }
            return parts;

        },
    };

    App.SlideGenerator = SlideGenerator;
    win.log("Slidegenerator added\n");


})(window.App);
