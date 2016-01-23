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

            switch (Settings.BibleSettings.background_mode) {

                case ('all_slides_has_same_back'):
                    slideBackground = Settings.BibleSettings.background;
                    break;
                case ('all_slides_has_random_back'):
                    slideBackground = Settings.BibleSettings.Utils.getRandomBackground(false);
                    break;
            }

            /* Change newline characters for <br> tag. Needs for bigtext script */

            var sourceText = verse.get('text');

            /* Find _strings_ and make it italic */

            var preparedText = sourceText.trim().replace(/_(.*?)_/g, "<span class='italic'>$1</span>");
            var screen_bounds = Settings.Utils.getPresentationScreen().bounds;


            slideModel.set("text", preparedText);
            slideModel.set("link", verse.get('bottom_text'));
            slideModel.set("background", slideBackground);
            slideModel.set("width", screen_bounds.width);
            slideModel.set("height", screen_bounds.height);
            d.resolve(slideModel);

            return d.promise;
        },
        makeSlidesFromSong: function (song) {

            win.log("makeSlidesFromSong");

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
            switch (Settings.SongserviceSettings.background_mode) {

                case ('all_slides_has_same_back'):
                    slideBackground = Settings.SongserviceSettings.background;
                    break;
                case ('all_slides_has_random_back'):
                    slideBackground = Settings.SongserviceSettings.Utils.getRandomBackground(false);
                    break;
            }

            /* Change newline characters for <br> tag. Needs for bigtext script */

            var preparedText = text.trim().replace(/\r\n|\n/g, "<br>");
            var screen_bounds = Settings.Utils.getPresentationScreen().bounds;

            slideModel.set("text", preparedText);
            slideModel.set("background", slideBackground);
            slideModel.set("width", screen_bounds.width);
            slideModel.set("height", screen_bounds.height);
            slideModel.set("font", Settings.SongserviceSettings.font_family.toLowerCase());

            d.resolve(slideModel);
            return d.promise;
        },
        _getPartsFromText: function (text) {

            var parts = [];
            var res;

            while ((res = Settings.Config.slide_part.pattern.exec(text)) != null) {

                var raw_text = res[1].trim();
                for (var p in Settings.Config.song_parts_patterns) {

                    var part_pattern = Settings.Config.song_parts_patterns[p].pattern;
                    var part = part_pattern.exec(raw_text);

                    if (part == null) {
                        continue;
                    }

                    parts.push(part[1].trim());
                    break;
                }
            }
            return parts;

        },
    };

    App.SlideGenerator = SlideGenerator;
    win.log("Slidegenerator added");


})(window.App);
