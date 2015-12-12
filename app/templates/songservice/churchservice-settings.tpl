<div class="settings-container">
    <div class="width-100-percent fleft">
       <div class="fa fa-times close-icon"></div>
    </div>

    <section id="presentation">

            <div class="title">Презентация</div>
            <div class="content">
                <div class="slide-settings-container">

                    <span>

                        <div class="dropdown presentation-monitor">
                        <p>Монитор для презентации</p>
                        <%
                        var screens = "";
                        var screens_arr = Settings.Utils.getScreens();
                        for (var key in screens_arr){
                            screens += "<option "+(Settings.presentation_monitor == key? "selected='selected'":"")+" value='" + key + "'>Monitor " + key +"</option>";
                        }
                        %>
                        <select name="presentation_monitor"><%=screens%></select>
                        <div class="dropdown-arrow"></div>
                        </div>

                    </span>

                    <span>

                        <div class="dropdown font-align-mode">
                        <p>Режим выравнивания шрифтов</p>
                        <%
                            var font_align_modes = {
                                'one_font_size_per_slide' : "Один шрифт на слайд",
                                'one_font_size_per_string' : "Один шрифт на строку"
                            };

                            var select_font_align_mode = "";

                            for(var key in font_align_modes) {
                                select_font_align_mode += "<option "+(Settings.slide_string_mode == key? "selected='selected'":"")+" value='"+key+"'>"+(font_align_modes[key])+"</option>";
                            }


                        %>

                        <select name="slide_string_mode"><%=select_font_align_mode%></select>
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
                                select_font += "<option "+(Settings.font_family == cyr_fonts[key].postscriptName? "selected='selected'":"")+" value='"+cyr_fonts[key].postscriptName+"'>"+(cyr_fonts[key].postscriptName)+"</option>";
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
                                backgrounds += "<option "+(Settings.background_modes == key ? "selected='selected'":"")+" value='"+key+"'>"+background_modes[key]+"</option>";
                            }
                        %>

                        <select name="background_mode"><%=backgrounds%></select>
                        <div class="dropdown-arrow"></div>

                        </div>

                    </span>

                    <span>
                        <p>Каталог фоновых изображений</p>
                        <input type="text" placeholder="Каталог фоновых изображений" id="fakebackgroundsdir" value="<%= Settings.backgrounds_path %>" readonly="readonly" size="65" />
                        <i class="open-tmp-folder fa fa-folder-open-o tooltipped" data-toggle="tooltip" data-placement="auto" title="Открыть каталог фоновых изображений"></i>
                        <input type="file" name="backgrounds_path" id="backgrounds_path" nwdirectory style="display: none;" nwworkingdir="<%= Settings.backgrounds_path %>" />
                    </span>

                    <span>
                        <div class="dropdown background">
                            <p>Фоновые изображения</p>
                            <select id="backgroundImageSelector" name="background"></select>
                            <div class="dropdown-arrow"></div>

                        </div>
                    </span>
                </div>

                <div class="preview-container"></div>

            </div>
    </section>

    <section id="presentation">

            <div class="title">Заставка</div>
            <div class="content">
            </div>

    </section>


</div>



