;(function() {

window.LineParsers = {
	base: [
		{ name: "designerLine", regexp: /^([\d:.]+) ([^-]*)- ([^-]*)- (.*)/, attrs: [["type", 2], ["severity", 3]] },
		{ name: "runtimeLine", regexp: /^[\d-]+ ([\d:.]+) ([^ ]+) [ ]*[^ ]* - ([^-]*)- (.*)/, attrs: [["type", 3], ["severity", 2]] },
		{ name: "logStart", regexp: /=-=-=-=-=-=-=-=-=-=-/, attrs: [["type", "default"], ["severity", "info"]] }
	],

	replay: [
		{ name: "mcActions", regexp: /- received msg: |- doing event: /, attrs: [["mcActions", "true"]] },
		{ name: "responses", regexp: /- sending message to mobile /, attrs: [["responses", "true"]] }
	]
};

var parserCategories = Object.keys(LineParsers), parserCategoriesLen = parserCategories.length;

LineParsers.parse = function(line) {
	for (var i = 0; i < parserCategoriesLen; ++i) {
		var categoryParsers = LineParsers[parserCategories[i]], categoryParsersLen = categoryParsers.length;
		for (var j = 0; j < categoryParsersLen; ++j) {
			var res = categoryParsers[j].regexp.exec(line.text);
			if (res) {
				categoryParsers[j].attrs.forEach(function(attr) { line[attr[0]] = attr[1].toFixed ? res[attr[1]].trim().toLowerCase() : attr[1]; });
				break;
			}
		}
	}
}

})();
