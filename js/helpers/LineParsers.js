;(function() {

window.LineParsers = {
	base: [
		{ name: "designerLine", regexp: /^([\d:.]+) ([^-]*)- ([^-]*)- (.*)/, attrs: [["type", 2], ["severity", 3]] },
		{ name: "runtimeLine", regexp: /^[\d-]+ ([\d:.]+) ([^ ]+) [ ]*[^ ]* - ([^-]*)- (.*)/, attrs: [["type", 3], ["severity", 2]] },
		{ name: "logStart", regexp: /^=-=-=-=-=-=-=-=-=-=-/, attrs: [["type", "default"], ["severity", "info"]] }
	],

	replay: [
		{ name: "mcActions", reqAttrs: ["type", "severity"], regexp: /(.*- received msg: |.*- doing event: )({.*})/, attrs: [["mcActions", 1], ["message", [["text", 1], ["json", 2]]]] },
		{ name: "responses", reqAttrs: ["type", "severity"], regexp: /(.*- sending message to mobile )({.*})/, attrs: [["responses", "true"], ["message", [["text", 1], ["json", 2]]]] }
	],

	debug: [
		{ name: "remediation", unreqAttrs: ["type", "severity"], regexp: /({"bestFlowProb":.*)/, attrs: [["remediation", "true"], ["message", [["json", 1]]]] }
	]
};

var parserCategories = Object.keys(LineParsers), parserCategoriesLen = parserCategories.length;

LineParsers.parse = function(line) {
	for (var i = 0; i < parserCategoriesLen; ++i) {
		var categoryParsers = LineParsers[parserCategories[i]], categoryParsersLen = categoryParsers.length;
		for (var j = 0; j < categoryParsersLen; ++j) {
			var parser = categoryParsers[j];
			var res = (!parser.reqAttrs || parser.reqAttrs.every(function(attr) { return line.attrs[attr]; })) &&
				(!parser.unreqAttrs || parser.unreqAttrs.every(function(attr) { return !line.attrs[attr]; })) &&
				parser.regexp.exec(line.text);
			if (res) {
				parser.attrs.forEach(function(attr) {
					line.attrs[attr[0]] = attr[1].toFixed ? res[attr[1]].trim().toLowerCase() :
						attr[1].reduce ? attr[1].map(function(pair) { return pair.map(function(prop) {
							return prop.toFixed ? res[prop] : prop; }); }) : attr[1];
				});
				break;
			}
		}
	}
}

})();
