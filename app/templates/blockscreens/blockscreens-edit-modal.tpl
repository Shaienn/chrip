<div class="container-fluid fill" style="height: 90vh">
    <div class="col-lg-12" style="height: calc(100% - 84px);">
        <div id="bs-work-area" class="fill">
            <div id='bs-texts-container' class="col-lg-3 fill">
                <div class="col-lg-12"><h2>Слои</h2></div>
                <div id="bs-texts-list" col-lg-12></div>
            </div>

            <div id="bs-editor-container" class="col-lg-9 fill">
                <div id="bs-editor-area"></div>
		<!-- <canvas id="bs-hidden-canvas"></canvas> -->
            </div>
        </div>
        <input id="img-input" type="file" accept="jpg,png,gif" style="display:none"></input>
	<input id="bs-save-file" type="file" nwsaveas style="display:none" />
    </div>

    <div class="col-lg-12 vert-offset-top-1 vert-offset-bottom-1">	
	<div class="col-lg-8 text-left">
	    <button type="button" class="btn btn-success" id="bs-add-text-btn">
		<i class="fa fa-plus-square">
		    <span>
			Добавить слой с текстом
		    </span>
		</i>
	    </button>
	    <button type="button" class="btn btn-success" id="bs-add-img-btn">
		<i class="fa fa-plus-square">
		    <span>
			Добавить слой с изображением
		    </span>
		</i>
	    </button>
	</div>
	<div class="col-lg-4  text-right">
	    <button type="button" class="btn btn-success" id="save-btn">
		<span class="glyphicon glyphicon-save-file"></span> Сохранить
	    </button>
	    <button type="button" class="btn btn-primary" id="save-as-btn">
		<span class="glyphicon glyphicon-save-file"></span> Сохранить как...
	    </button>
	    <button type="button" class="btn btn-danger" id="cancel-btn">
		<span class="glyphicon glyphicon-ban-circle"></span> Отмена
	    </button>
	</div>
    </div>
</div>