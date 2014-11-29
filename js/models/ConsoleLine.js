;(function() {

Log.Models.ConsoleLineClass = Backbone.Model.extend({
	initialize: function() {
		var p1 = performance.now();
		var type, severity;

		var text = this.get("raw");
		var lineParsed = LineParsers.some(function(parser) {
			var res = parser.regexp.exec(text);
			if (res) {
				type = (typeof parser.type == "string" ? parser.type : res[parser.type]).trim().toLowerCase();
				severity = (typeof parser.severity == "string" ? parser.severity : res[parser.severity]).trim().toLowerCase();
				return true;
			}
		});

		if (LineTypes[type]) {
			this.type = type;
			if (severity) this.severity = severity;
		} else {
			var lastLineModel = this.get("prevLine");
			this.type = (lastLineModel && lastLineModel.type) || "default";
			this.severity = (lastLineModel && lastLineModel.severity) || "info";
		}

		this.text = text;

		window.consoleLineModelTime += (performance.now() - p1);
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

	window.consoleLineModelTime = 0;

})();
