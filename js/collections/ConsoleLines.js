;(function() {

Log.Collections.ConsoleLinesClass = Backbone.Collection.extend({
	model: Log.Models.ConsoleLineClass,

	initialize: function() {
		this.on("add", this.onLineAdded)
	},

	onLineAdded: function(model) {
		if (!LineTypes[model.get("type")]) {
			var lastLineModel = this.last();
			var type = (lastLineModel && lastLineModel.get("type")) || "default";
			var severity = (lastLineModel && lastLineModel.get("severity")) || "info";

			model.set("type", lastLineModel.get("type"));
			model.set("severity", lastLineModel.get("severity"));
		}
	},

	changeActiveFilters: function(activeFilterKeys) {
		var currentActiveFilterKeys = this.activeFilterKeys || {};
		var changedKeys = activeFilterKeys.filter(function(key) { return !currentActiveFilterKeys[key]; }).
			concat(Object.keys(currentActiveFilterKeys).filter(function(key) { return currentActiveFilterKeys[key] && activeFilterKeys.indexOf(key) == -1; }));

		changedKeys.forEach(function(key) { currentActiveFilterKeys[key] = activeFilterKeys.indexOf(key) > -1; });
		this.activeFilterKeys = currentActiveFilterKeys;
		this.trigger("activeFilterChangedKeys", changedKeys);
	},

	reset: function() {
		this.each(function(consoleLine) { consoleLine.trigger("deleted"); });
		Backbone.Collection.prototype.reset.apply(this, arguments);
	}
});

})();
