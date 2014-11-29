;(function() {

var FilterRules = [
	{	desc : "severities",
		filter : function(line) { return createFilterKey(line.severity, line.type); }
	}
];

function LineFilter(category, name, props) {
	this.category = category;
	this.name = name;
	this.props = props;
	this.filterKey = createFilterKey(category, name);
}

LineFilter.prototype = {
	test: function(line) {
		var props = this.props, len = props.length;
		for (var i = 0; i < len; ++i) {
			var propObj = props[i], propObjKeys = Object.keys(propObj), keysLen = propObjKeys.length;
			for (var j = 0; j < keysLen; ++j) {
				var propFilter = propObj[propObjKeys[j]], propData = line[propObjKeys[j]];
				if (typeof propFilter == "string" ? (propData == propFilter) : (propFilter.test(propData))) return true;
			}
		}

		return false;
	}
};

var FILTER_KEY_DELIM = "_";

function createFilterKey(severity, type) {
	return severity.concat(FILTER_KEY_DELIM, type);
}

window.LineFilters = [];

LineFilters.push(new LineFilter("custom", "mcActions", [{ text: /- received msg: |- doing event: / }]));
LineFilters.push(new LineFilter("custom", "responses", [{ text: /- sending message to mobile / }]));

var severities = ["error", "warn", "info", "debug", "trace"], types = Object.keys(LineTypes);
severities.forEach(function(severity) {
	types.forEach(function(type) { LineFilters.push(new LineFilter(severity, type, [{ severity: severity }, { type: type }])); });
});

LineFilters.forEach(function(filter) {
	if (severities.indexOf(filter.category) > -1) return;

	FilterRules.push({
		desc : filter.category + "/" + filter.name,
		filter : function(line) { return filter.test(line) && filter.filterKey; }
	});
});

LineFilters.getFilterKeys = function(line) {
	var res = [];
	FilterRules.forEach(function(rule) {
		var key = rule.filter(line);
		if (key) res.push(key);
	});
	return res;
};

})();
