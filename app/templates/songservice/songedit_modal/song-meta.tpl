<%

var authors_selector = "";
for (var key=0; key< authors.length; key++){
authors_selector += "<option "+( (song.attributes.aid == authors.at(key).attributes.aid && song.attributes.gaid == authors.at(key).attributes.gaid) ? "selected='selected'":"")+" value='" + key + "'>" + authors.at(key).attributes.name + "</option>";
}

%>

<div id='song-meta-area'>
    <h2>Редактирование песни</h2>
    <span class="song-author">Исполнитель</span>
    <div class="song-author-selector">
        <select><%=authors_selector%></select>
    </div>

    <span class="song-name">Название песни</span>
    <div class="song-name-input">
        <input type='text' value='<%= song.attributes.name %>'>
    </div>
</div>