;(function() {

var LineFilterRules = [
	{	desc: "mcActions",
		categories: ["custom"],
		names: ["mcActions"],
		filter: function(line) { return line.mcActions && createFilterKey("custom", "mcActions"); }
	},
	{	desc: "responses",
		categories: ["custom"],
		names: ["responses"],
		filter: function(line) { return line.responses && createFilterKey("custom", "responses"); }
	},
	{	desc: "remediation",
		categories: ["custom"],
		names: ["remediation"],
		filter: function(line) { return line.remediation && createFilterKey("custom", "remediation"); }
	},
	{	desc: "severities",
		categories: ["error", "warn", "info", "debug", "trace"],
		names: Object.keys(LineTypes),
		filter: function(line) { return createFilterKey(line.severity, line.type); }
	}
];

var LineFilterRulesLen = LineFilterRules.length;

window.LineFilters = [];
LineFilters.getFilterKeys = function(line) {
	var res = [];
	for (var i = 0; i < LineFilterRulesLen; ++i) {
		var key = LineFilterRules[i].filter(line);
		if (key) res.push(key);
	}

	return res;
};

var FILTER_KEY_DELIM = "_";
function createFilterKey(severity, type) { return severity.concat(FILTER_KEY_DELIM, type); }

LineFilterRules.forEach(function(rule) {
	rule.categories.forEach(function(category) {
		rule.names.forEach(function(name) {
			LineFilters.push({ category: category, name: name, filterKey: createFilterKey(category, name) });
		});
	});
});

})();
