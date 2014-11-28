;(function() {

Log.Models.ConsoleLineClass = Backbone.Model.extend({
	initialize: function() {
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

		if (type) {
			this.set("type", type);
			if (severity) this.set("severity", severity);
		}

		this.set("filters", LineFilters.filter(function(filter) { return filter.test(this); }, this).map(function(filter) { return filter.filterKey; }));
		this.set("text", text);
	}
});

})();
