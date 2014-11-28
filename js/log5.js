(function() {

window.Log = {
	Models:			{},
	Collections:	{},
	Views:			{}
};

var FILTER_KEY_DELIM = "_";

function createFilterKey(severity, type) {
	return severity.concat(FILTER_KEY_DELIM, type);
}

function createCustomFilterKey(type) {
	return createFilterKey("filter", type);
}

function parseFilterKey(key) {
	var keyItems = key.split(FILTER_KEY_DELIM);
	return { severity : keyItems[0], type : keyItems[1] };
}

function refreshContent() {
	if (!logFile) return pause();
	
	if (logFile.size < lastIndex) {
		clear();
	}
	
	fr.readAsText(logFile.slice(lastIndex));
	lastIndex = logFile.size;
}

function pause() {
	clearInterval(refreshIntervalId);
	refreshIntervalId = undefined;
}

function resume() {
	if (!refreshIntervalId) {
		refreshIntervalId = setInterval(refreshContent, 250);
	}
}

function clear() {
	while (contentElem.firstChild) {
		contentElem.removeChild(contentElem.firstChild);
	}
	lastIndex = 0;
}

var customFilters = {
	"mcActions" : [
		{ regexp : /- received msg: |- doing event: / }
	],

	"responses" : [
		{ regexp : /- sending message to mobile / }
	]
};

var customFilterTypes = Object.keys(customFilters);

var lineParsers = {
	severity : [
		{ name : "designerLine", regexp : /^([\d:.]+) ([^-]*)- ([^-]*)- (.*)/, type : 2, severity : 3 },
		{ name : "runtimeLine", regexp : /^[\d-]+ ([\d:.]+) ([^ ]+) [ ]*[^ ]* - ([^-]*)- (.*)/, type : 3, severity : 2 },
		{ name : "logStart", regexp : /=-=-=-=-=-=-=-=-=-=-/, type : "default", severity : "info" }
	],

	filter : customFilterTypes.reduce(function(unionFilters, filterName) {
		customFilters[filterName].forEach(function(filter) { filter.filterKey = createCustomFilterKey(filterName) });
		return unionFilters.concat(customFilters[filterName]); }, [])
};

function addLine(text) {
	var lineDiv = document.createElement("div");
	lineDiv.classList.add("logLine");

	var ts, type, severity, msg;

	var lineParsed = lineParsers.severity.some(function(parser) {
		var res = parser.regexp.exec(text);
		if (res) {
			type = (typeof parser.type == "string" ? parser.type : res[parser.type]).trim().toLowerCase();
			severity = (typeof parser.severity == "string" ? parser.severity : res[parser.severity]).trim().toLowerCase();
			return true;
		}
	});

	if (!lineParsed && contentElem.lastChild) {
		var lastLine = contentElem.lastChild;
		type = lastLine.getAttribute("type");
		severity = lastLine.getAttribute("severity");
	}

	if (!logKeys[type]) type = "default";
	
	lineDiv.setAttribute("type", type);
	lineDiv.setAttribute("severity", severity);
	lineDiv.classList.add(severity);
	lineDiv.textContent = text;

	var filters = [createFilterKey(severity, type)].concat(lineParsers.filter.map(function(parser) {
		return parser.regexp.test(text) && parser.filterKey; }).filter(function(filter) { return !!filter; }));

	filters.forEach(function(filter, index) { lineDiv.setAttribute("filter" + index, filter); });

	if (checkFilter(filters)) lineDiv.classList.add("hidden");

	contentElem.appendChild(lineDiv);
}

function pruneLines() {
	var lines = contentElem.getElementsByClassName("logLine"), limitVal = Number(linesLimit.value);
	for (var i = 0; (lines.length - i) > limitVal; ++i) {
		lines[i].remove();
	}
}

function onNewDataAvail(res) {
	var lastLine = contentElem.lastChild, scrollIntoView = isScrolledToBottom(lastLine);
	res.replace(/[^\n]*\n/g, function(line) { addLine(line); });
	pruneLines();
	if (contentElem.lastChild && scrollIntoView) contentElem.lastChild.scrollIntoView();
}

function isScrolledToBottom(lastLine) {
	var lastNodeHeight = lastLine ? lastLine.clientHeight : 0;
	return contentElem.scrollTop + contentElem.clientHeight >= contentElem.scrollHeight - lastNodeHeight / 2;
}

var contentElem = document.getElementById("content");

var refreshIntervalId;

var fr = new FileReader();
fr.onloadend = function() { onNewDataAvail(fr.result); };

var lastIndex = 0;
var logFile;

document.getElementById("logFile").addEventListener("change", function(e) {
	clear();
	logFile = this.files.item(0);
	var filename = (logFile && logFile.name) || "";
	document.title = filename;
	$("#pickedFilename").text(filename).attr("title", filename);
	resume();
});

document.getElementById("pause").addEventListener("click", pause);
document.getElementById("resume").addEventListener("click", resume);
document.getElementById("clear").addEventListener("click", clear);

var linesLimit = document.getElementById("limit");
linesLimit.addEventListener("change", function(e) {
	pruneLines();
});

function checkFilter(filters) {
	return filters.every(function(filter) { return !logFilterKeys[filter]; });
}

function setSeverityFilters(filterKeys) {
	function buildFilterSelector(key) {
		return [0, 1, 2, 3].map(function(i) { return "[filter".concat(i, "=", key, "]"); }).join(",");
	}
	function extractFilterAttrs(elem) {
		return [0, 1, 2, 3].map(function(i) { return elem.getAttribute("filter" + i); }).filter(function(key) { return !!key });
	}

	console.log("filterKeys:" + filterKeys);
	var changedKeys = filterKeys.filter(function(key) { return !logFilterKeys[key]; }).
		concat(Object.keys(logFilterKeys).filter(function(key) { return logFilterKeys[key] && filterKeys.indexOf(key) == -1; }));

	changedKeys.forEach(function(key) { logFilterKeys[key] = filterKeys.indexOf(key) > -1; });

	changedKeys.forEach(function(key) {
		Array.prototype.slice.call(contentElem.querySelectorAll(buildFilterSelector(key))).forEach(function(line) {
			if (checkFilter(extractFilterAttrs(line))) line.classList.add("hidden");
			else line.classList.remove("hidden");
		});
	});
}

var logFilterKeys = {};

var logKeys = {
	"default" : {},
	"browser" : {},
	"model" : {},
	"events" : {},
	"locators" : {},
	"context" : {},
	"matcher" : {},
	"replay" : {}
};

var logTypes = Object.keys(logKeys);

var severityFilters = {
	"error"		: {},
	"warn"		: {},
	"info"		: {},
	"debug"		: {},
	"trace"		: {}
};

var severityFilterKeys = Object.keys(severityFilters);

function initFilters() {
	function _setFilters() {
		setSeverityFilters($("#All_Filters").multipleSelect("getSelects"));
	}

	function addFilterOption(group, type, severity) {
		var opt = document.createElement("option");
		$(opt).attr("value", severity ? createFilterKey(severity, type) : createCustomFilterKey(type)).text(type);
		group.insertBefore(opt, null);
	}

	var select = $("#All_Filters");

	var customFilterGroup;
	customFilterTypes.forEach(function(type) {
		customFilterGroup = customFilterGroup || document.createElement("optgroup");
		$(customFilterGroup).attr("label", "custom");
		addFilterOption(customFilterGroup, type);
	});

	if (customFilterGroup) select.get(0).insertBefore(customFilterGroup, null);

	severityFilterKeys.forEach(function(severity) {
		var filterGroup = document.createElement("optgroup");
		$(filterGroup).attr("label", severity);
		logTypes.forEach(function(type) { addFilterOption(filterGroup, type, severity); });
		select.get(0).insertBefore(filterGroup, null);
	});

	var filter = select.multipleSelect({
		placeholder: "Add Filters",
		multiple: true,
		multipleWidth: 100,
		width: 340,
		maxHeight: 400,
		minimumCountSelected: 5,
		filter : true,
		onCheckAll: _setFilters,
		onUncheckAll: _setFilters,
		onOptgroupClick: _setFilters,
		onClick: _setFilters
	});
}

initFilters();

})();
