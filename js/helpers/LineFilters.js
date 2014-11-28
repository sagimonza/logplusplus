;(function() {

function LineFilter(category, name, props) {
	this.category = category;
	this.name = name;
	this.props = props;
	this.filterKey = createFilterKey(category, name);
}

LineFilter.prototype = {
	test: function(line) {
		return this.props.every(function(propObj) {
			return Object.keys(propObj).some(function(prop) {
				var propData = line.get(prop), propFilter = propObj[prop];
				return typeof propFilter == "string" ? (propData == propFilter) : (propFilter.test(propData));
			});
		});
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

})();
