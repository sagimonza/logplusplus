;(function() {

Log.Collections.ConsoleLinesClass = Backbone.Collection.extend({
	model: Log.Models.ConsoleLineClass,

	initialize: function() {
		this.activeFilterKeys = {};
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
		this.each(function(consoleLine) { consoleLine.trigger("deleted", consoleLine); });
		Backbone.Collection.prototype.reset.apply(this, arguments);
	}
});

})();
