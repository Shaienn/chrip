    <div id="songeditor_mainarea">


        <div id="switch_preview_content" class="toolbar">

            <div id="songeditor_author_selector" class="left">
                <div id="inner">
                    <%

                     var authors_selector = "";

                     console.log(song);

                     for (var key in authors){
                          authors_selector += "<option "+(song.attributes.aid == authors[key].attributes.aid ? "selected='selected'":"")+" value='" + key + "'>" + authors[key].attributes.name + "</option>";
                     }

                    %>

                    <span class="author_name">Автор песни</span>
                    <select class="authors_selector"><%=authors_selector%></select>
                    <span class="song_name">Название песни</span>
                    <input id="song-name-input" type="text" placeholder="Please enter song`s name" value="<%= song.attributes.name %>"></input>
                </div>
            </div>


            <ul class="nav nav-hor right">
                <li>
                       <i id="text-btn" class="fa fa-file-text-o" title="Text"></i>
                </li>
                <li>
                       <i id="slides-btn" class="fa fa-picture-o" title="Slides"></i>
                </li>
            </ul>
        </div>



        <div id="songeditor_inputarea">

            <textarea id="songeditor_input_textarea" class="chordpro-song-editor"></textarea>

        </div>

        <div id="songeditor_previewarea">

            <div id="preview_content_text" class="chordpro-song-visual"></div>
            <div id="preview_content_slide">
                <div class="contain"></div>
            </div>

        </div>

        <div class="toolbar left">
                    <ul class="nav nav-hor right">
                        <li>
                               <i id="save-btn" class="fa fa-check-circle-o" title="Add"></i>
                        </li>
                        <li>
                               <i id="cancel-btn" class="fa fa-ban" title="Cnacel"></i>
                        </li>
                    </ul>
        </div>
    </div>
