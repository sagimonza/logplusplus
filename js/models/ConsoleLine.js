;(function() {

Log.Models.ConsoleLineClass = Backbone.Model.extend({
	initialize: function() {
		this.text = this.get("raw");
		LineParsers.parse(this);

		if (!LineTypes[this.type]) {
			var lastLineModel = this.get("prevLine");
			this.type = (lastLineModel && lastLineModel.type) || "default";
			this.severity = this.severity || (lastLineModel && lastLineModel.severity) || "info";
		}
	},

	applyFilters: function(activeFilters) {
		var modelFilters = this.filters = LineFilters.getFilterKeys(this), modelFiltersLen = modelFilters.length;
		var visibleModel;

		for (var i = 0; !visibleModel && i < modelFiltersLen; ++i) {
			if (activeFilters[modelFilters[i]]) {
				visibleModel = true;
			}
		}

		if (visibleModel) this.set("hidden", false, { silent: true });
		else this.set("hidden", true, { silent: true });
	}
});

})();
