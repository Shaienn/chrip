<div class="settings-container">

    <section id="GeneralSettings">
        <div class="title">Общие настройки</div>
        <div class="content">
            <span>

                <div class="dropdown presentation-monitor">
                    <p>Монитор для презентации</p>
                    <%
                    var screens = "";
                    var screens_arr = Settings.Utils.getScreens();
                    for (var key in screens_arr){
                    screens += "<option "+(Settings.GeneralSettings.presentation_monitor == key? "selected='selected'":"")+" value='" + key + "'>Monitor " + key +"</option>";
                    }
                    %>
                    <select name="presentation_monitor"><%=screens%></select>
                    <div class="dropdown-arrow"></div>
                </div>

            </span>
        </div>
    </section>

    <section id="SongserviceSettings">

        <div class="title">Песни</div>
        <div class="content">
            <div class="slide-settings-container">

                <span>

                    <div class="dropdown font">
                        <p>Шрифт</p>

                        <%

                        var fonts = fontManager.getAvailableFontsSync();
                        var cyr_fonts = [];
                        for(var key in fonts) {

                        var font = fontManager.substituteFontSync(fonts[key].postscriptName, 'АБВ');
                        if (font.postscriptName == fonts[key].postscriptName){
                        cyr_fonts.push(font);
                        }
                        }

                        var select_font = "";

                        for(var key in cyr_fonts) {
                        select_font += "<option "+(Settings.SongserviceSettings.font_family == cyr_fonts[key].postscriptName? "selected='selected'":"")+" value='"+cyr_fonts[key].postscriptName+"'>"+(cyr_fonts[key].postscriptName)+"</option>";
                        }


                        %>

                        <select name="font_family"><%=select_font%></select>
                        <div class="dropdown-arrow"></div>

                    </div>

                </span>

                <span>

                    <div class="dropdown background">
                        <p>Фон</p>
                        <%

                        var background_modes = {
                        'all_slides_has_same_back' : "Все слайды имеют одинаковый фон",
                        'all_slides_in_song_has_same_back' : "Все слайды в песне имеют одинаковый фон",
                        'all_slides_has_random_back' : "Все слайды имеют случайный фон"
                        };

                        var backgrounds = "";
                        for(var key in background_modes) {
                        backgrounds += "<option " + (Settings.SongserviceSettings.background_mode == key ? "selected='selected'":"") + " value='" + key + "'>" + background_modes[key] + "</option>";
                        }
                        %>

                        <select name="background_mode"><%=backgrounds%></select>
                        <div class="dropdown-arrow"></div>

                    </div>

                </span>

                <span>
                    <p>Каталог фоновых изображений</p>
                    <input type="text" placeholder="Каталог фоновых изображений" id="fakebackgroundsdir" value="<%= Settings.SongserviceSettings.backgrounds_path %>" readonly="readonly" size="65" />
                    <i id="change_background_dir" class="open-tmp-folder fa fa-folder-open-o tooltipped" data-toggle="tooltip" data-placement="auto" title="Открыть каталог фоновых изображений"></i>
                    <input type="file" name="backgrounds_path" id="backgrounds_path" nwdirectory style="display: none;" nwworkingdir="<%= Settings.SongserviceSettings.backgrounds_path %>" />
                </span>

                <span>
                    <div class="dropdown background">
                        <p>Фоновые изображения</p>
                        <select class="background-image-selector" name="background"></select>
                        <div class="dropdown-arrow"></div>
                    </div>
                </span>
            </div>

            <div class="preview-container"></div>

        </div>
    </section>

    <section id="BibleSettings">

        <div class="title">Библия</div>
        <div class="content">
            <div class="slide-settings-container">

                <span>
                    <div class="dropdown bibleFiles">
                        <p>Переводы Библии</p>
                        <select id="bibleSelector" name="bible_xml"></select>
                        <div class="dropdown-arrow"></div>
                    </div>
                </span>                    

                <span>
                    <div class="dropdown font">
                        <p>Шрифт</p>

                        <%

                        var fonts = fontManager.getAvailableFontsSync();
                        var cyr_fonts = [];
                        for(var key in fonts) {

                        var font = fontManager.substituteFontSync(fonts[key].postscriptName, 'АБВ');
                        if (font.postscriptName == fonts[key].postscriptName){
                        cyr_fonts.push(font);
                        }
                        }

                        var select_font = "";

                        for(var key in cyr_fonts) {
                        select_font += "<option "+(Settings.BibleSettings.font_family == cyr_fonts[key].postscriptName? "selected='selected'":"")+" value='"+cyr_fonts[key].postscriptName+"'>"+(cyr_fonts[key].postscriptName)+"</option>";
                        }


                        %>

                        <select name="font_family"><%=select_font%></select>
                        <div class="dropdown-arrow"></div>

                    </div>

                </span>

                <span>

                    <div class="dropdown background">
                        <p>Фон</p>
                        <%

                        var bible_background_modes = {
                        'all_slides_has_same_back' : "Все слайды имеют одинаковый фон",
                        'all_slides_in_song_has_same_back' : "Все слайды в песне имеют одинаковый фон",
                        'all_slides_has_random_back' : "Все слайды имеют случайный фон"
                        };

                        var bible_backgrounds = "";
                        for(var key in bible_background_modes) {
                        bible_backgrounds += "<option " + (Settings.BibleSettings.background_mode == key ? "selected='selected'":"") + " value='" + key + "'>" + bible_background_modes[key] + "</option>";
                        }
                        %>

                        <select name="background_mode"><%=bible_backgrounds%></select>
                        <div class="dropdown-arrow"></div>

                    </div>

                </span>

                <span>
                    <p>Каталог фоновых изображений</p>
                    <input type="text" placeholder="Каталог фоновых изображений" id="fakebackgroundsdir" value="<%= Settings.BibleSettings.backgrounds_path %>" readonly="readonly" size="65" />
                    <i id="change_background_dir" class="open-tmp-folder fa fa-folder-open-o tooltipped" data-toggle="tooltip" data-placement="auto" title="Открыть каталог фоновых изображений"></i>
                    <input type="file" name="backgrounds_path" id="backgrounds_path" nwdirectory style="display: none;" nwworkingdir="<%= Settings.BibleSettings.backgrounds_path %>" />
                </span>

                <span>
                    <div class="dropdown background">
                        <p>Фоновые изображения</p>
                        <select class="background-image-selector" name="background"></select>
                        <div class="dropdown-arrow"></div>
                    </div>
                </span>



            </div>
            <div class="preview-container">
                <div class="bible-slide-item"></div>
            </div>
        </div>
    </section>



</div>



