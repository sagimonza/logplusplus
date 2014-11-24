(function() {

window.Log = {
	Models	: {},
	Views	: {}
};
/*
$(".expandCollapse").on("click", function() {
	var actionBar = $("#actionBar");
	if (actionBar.hasClass("collapsed")) {
		actionBar.removeClass("collapsed");
	} else {
		actionBar.addClass("collapsed");
	}
});*/

var FILTER_KEY_DELIM = "_";

function createFilterKey(severity, type) {
	return severity.concat(FILTER_KEY_DELIM, type);
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
		{ regexp : /- received msg: |- doing event: /, filter : "mcActions" }
	],

	"responses" : [
		{ regexp : /- sending message to mobile /, filter : "responses" }
	]
};

var customFilterTypes = Object.keys(customFilters);

var lineParsers = {
	severity : [
		{ name : "designerLine", regexp : /^([\d:.]+) ([^-]*)- ([^-]*)- (.*)/, type : 2, severity : 3 },
		{ name : "runtimeLine", regexp : /^[\d-]+ ([\d:.]+) ([^ ]+) [ ]*[^ ]* - ([^-]*)- (.*)/, type : 3, severity : 2 },
		{ name : "logStart", regexp : /=-=-=-=-=-=-=-=-=-=-/, type : "start", severity : "info" }
	],

	custom : customFilterTypes.reduce(function(unionFilters, filterName) { return unionFilters.concat(customFilters[filterName]); }, [])
}

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

	if (type != "start" && !logKeys[type]) type = "default";
	
	lineDiv.setAttribute("type", type);
	lineDiv.setAttribute("severity", severity);
	lineDiv.classList.add(severity);
	lineDiv.textContent = text;

	var filters = [createFilterKey(severity, type)].concat(lineParsers.custom.map(function(parser) {
		return parser.regexp.test(text) && parser.filter; }).filter(function(filter) { return !!filter; }));

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
	console.log("filterKeys:" + filterKeys);
	var checkedFilterSeverities = {};
	filterKeys.forEach(function(key) {
		var filterObj = parseFilterKey(key);
		checkedFilterSeverities[filterObj.severity] = checkedFilterSeverities[filterObj.severity] || [];
		checkedFilterSeverities[filterObj.severity].push(filterObj.type);
	});

	filterSeveritiesKeys.forEach(function(severity) {
		var severityTypes = checkedFilterSeverities[severity];
		logTypes.forEach(function(type) {
			var typeFilteredIn = severityTypes && severityTypes.indexOf(type) > -1, filterKey = createFilterKey(severity, type);
			if (typeFilteredIn) {
				console.log("filtered in:" + type + " severity:" + severity);
				if (!logFilterKeys[filterKey])
					Array.prototype.slice.call(contentElem.querySelectorAll("[filter0=".concat(filterKey, "]"))).forEach(function(line) {
						line.classList.remove("hidden"); });
			} else if (logFilterKeys[filterKey]) {
				Array.prototype.slice.call(contentElem.querySelectorAll("[filter0=".concat(filterKey, "]"))).forEach(function(line) {
					line.classList.add("hidden"); });
			}
			logFilterKeys[filterKey] = typeFilteredIn;
		});
	});
}

function setCustomFilters(filterKeys) {

}

var logFilterKeys = { "info_start" : true };

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

var filterSeverities = {
	"error"		: {},
	"warn"		: {},
	"info"		: {},
	"debug"		: {},
	"trace"		: {}
};

var filterSeveritiesKeys = Object.keys(filterSeverities);

function initFilters() {
	function _setFilters() {
		setSeverityFilters($("#Severity_Filters").multipleSelect("getSelects"));
	}

	var select = $("#Severity_Filters");
	filterSeveritiesKeys.forEach(function(severity) {
		var filterGroup = document.createElement("optgroup");
		$(filterGroup).attr("label", severity);
		logTypes.forEach(function(type) {
			var opt = document.createElement("option");
			$(opt).attr("value", createFilterKey(severity, type)).text(type);
			filterGroup.insertBefore(opt, null);
		});
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
