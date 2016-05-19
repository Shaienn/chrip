<div class="container-fluid fill" style="height: 90vh">
    <div class="col-lg-12" style="height: calc(100% - 84px);">

	<div id='song-parts-container' class="col-lg-4 fill">

	    <div class="col-lg-12"><h2>Структура песни</h2></div>
	    <div id="song-parts-list" class="col-lg-12"></div>


	</div>

	<div id="song-parts-editarea" class="col-lg-8 fill">
	    <div id="song-meta" class="col-lg-12"></div>    
            <div id="songpart-details" class="col-lg-12"></div>

	</div>

    </div>

    <div class="col-lg-12 vert-offset-top-1 vert-offset-bottom-1">

	<div class="col-lg-4  text-right">
	    <button type="button" class="btn btn-success btn-block" id="add-slide-btn">
		<i class="fa fa-plus-square"> Добавить новую часть</i>
	    </button>
	</div>


	<div class="col-lg-4">
	    <div class="btn-group btn-group-justified ">
		<div class="btn-group">
		    <button type="button" class="btn btn-success" id="slide-preview-btn">
			<i class="fa fa-film"> Режим слайда</i>
		    </button>
		</div>
		<div class="btn-group">
		    <button type="button" class="btn btn-primary" id="chords-preview-btn">
			<i class="fa fa-music"> Режим аккордов</i>
		    </button>
		</div>
	    </div>
	</div>


	<div class="col-lg-4  text-right">
	    <button type="button" class="btn btn-success" id="save-btn">
		<span class="glyphicon glyphicon-save-file"></span> Сохранить
	    </button>
	    <button type="button" class="btn btn-danger" id="cancel-btn">
		<span class="glyphicon glyphicon-ban-circle"></span> Отмена
	    </button>
	</div>
    </div>
</div>