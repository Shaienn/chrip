<%

var types_selector = "";

for (var key in types){
types_selector += "<option "+(songpart.get('type') == key ? "selected='selected'":"")+" value='" + key + "'>" + types[key].name + "</option>";
}

%>

<div id='songpart-type-area'>
    <h2>Редактирование слайда</h2>
    <span class="songpart-type">Тип части песни</span>
    <div class="songpart-type-selector">
        <select><%=types_selector%></select>
    </div>
</div>
<div class="songpart-editor">
    <div class='songpart-textarea'>
        <textarea><%=songpart.get('text')%></textarea>
    </div>
    <div class="songpart-preview">
        <div class="slide-item active">
            
        </div>
    </div>
</div>