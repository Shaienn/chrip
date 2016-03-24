Marionette.Behaviors.behaviorsLookup = function () {
    return window.Behaviors;
};

var Sortable = Marionette.Behavior.extend({
    onRender: function () {
	var collection = this.view.collection; // Замыкаем коллекцию
	var items = this.view.children._views; // Получаем список дочерних элементов
	var view;

	for (var v in items) {
	    view = items[v]
	    view.$el.attr('data-backbone-cid', view.model.cid); // Привязываем элемент к модели по cid
	}
	this.$el.sortable({// Делаем список сортируемым
	    axis: this.options.axis || false,
	    grid: this.options.grid || false,
	    containment: this.options.containment || false,
	    cursor: "move",
	    handle: this.options.handle || false,
	    revert: this.options.revert || false,
	    update: function (event, ui) {

		var model = collection.get(ui.item.data('backbone-cid'));
		// Получаем привязанную модель
		collection.remove(model, {silent: true});
		// По-тихому удаляем её из коллекции
		collection.add(model, {at: ui.item.index(), silent: true});
		//И также втихаря добавляем её по нужному индексу
		collection.trigger('change');
	    }
	});
	this.$el.disableSelection();
    }
});

window.Behaviors = {};
window.Behaviors.Sortable = Sortable;
