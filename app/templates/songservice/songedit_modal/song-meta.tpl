<%

var authors_selector = "";
for (var key=0; key< authors.length; key++){
authors_selector += "<option "+( (song.attributes.uaid == authors.at(key).attributes.uaid && song.attributes.gaid == authors.at(key).attributes.gaid) ? "selected='selected'":"")+" value='" + key + "'>" + authors.at(key).attributes.name + "</option>";
}

%>

<div class="col-lg-12"><h2>Редактирование песни</h2></div>
<span class="song-author col-lg-6 vert-offset-top-1 vert-offset-bottom-1">Исполнитель</span>
<div class="song-author-selector form-group col-lg-6 vert-offset-top-1 vert-offset-bottom-1">
    <select class="form-control"><%=authors_selector%></select>
</div>

<span class="song-name col-lg-6 vert-offset-top-1 vert-offset-bottom-1">Название песни</span>
<div class="song-name-input col-lg-6 form-group vert-offset-top-1 vert-offset-bottom-1">
    <input type='text' class="form-control" value='<%= song.attributes.name %>'>
</div>