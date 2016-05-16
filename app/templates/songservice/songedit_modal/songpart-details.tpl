<%

var types_selector = "";

for (var key in types){
types_selector += "<option "+(songpart.get('type') == key ? "selected='selected'":"")+" value='" + key + "'>" + types[key].name + "</option>";
}

%>

<div id='songpart-type-area'>
    <div class="col-lg-12"><h2>Редактирование слайда</h2></div>
    <span class="songpart-type col-lg-6 vert-offset-top-1 vert-offset-bottom-1">Тип части песни</span>
    <div class="songpart-type-selector form-group col-lg-6 vert-offset-top-1 vert-offset-bottom-1">
        <select class="form-control"><%=types_selector%></select>
    </div>
</div>

<div class="songpart-editor">
    <div class='songpart-textarea form-group col-lg-6'>
        <textarea class="form-control"><%=songpart.get('text')%></textarea>
    </div>
    <div class="songpart-preview col-lg-6">
	<div class="col-lg-12">
	    <div class="preview-area">
	    </div>
	</div>    

    </div>
</div>

<div class="col-lg-12">
    <div class="btn-group btn-group-justified ">
	<div class="btn-group">
	    <button type="button" class="btn btn-success" id="slide-preview-btn">
		<i class="fa fa-plus-square">Слайд</i>
	    </button>
	</div>
	<div class="btn-group">
	    <button type="button" class="btn btn-success" id="chords-preview-btn">
		<i class="fa fa-plus-square">Аккорды</i>
	    </button>
	</div>
    </div>
</div>