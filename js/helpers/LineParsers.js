;(function() {

window.LineParsers = [
	{ name : "designerLine", regexp : /^([\d:.]+) ([^-]*)- ([^-]*)- (.*)/, type : 2, severity : 3 },
	{ name : "runtimeLine", regexp : /^[\d-]+ ([\d:.]+) ([^ ]+) [ ]*[^ ]* - ([^-]*)- (.*)/, type : 3, severity : 2 },
	{ name : "logStart", regexp : /=-=-=-=-=-=-=-=-=-=-/, type : "default", severity : "info" }
];

})();
