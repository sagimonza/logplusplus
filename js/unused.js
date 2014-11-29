
function createLineView(lineModel) {
	var attrs = {
		type: lineModel.type,
		severity: lineModel.severity
	};

	lineModel.filters.forEach(function(filter, i) { attrs["filter" + i] = filter.filterKey });

	var hidden = lineModel.get("hidden") ? "hidden" : "";
	return new Log.Views.ConsoleLineClass({ model: lineModel, className: "logLine ".concat(lineModel.severity, " ", hidden), attributes: attrs });
}
