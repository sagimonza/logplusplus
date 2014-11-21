(function() {

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

function addLine(text) {
	var lineDiv = document.createElement("div");
	lineDiv.classList.add("logLine");
	var res = /^([\d:.]+) ([^-]*)- ([^-]*)- (.*)/.exec(text);
	var ts, type, severity, msg;
	if (res) {
		//ts = res[1];
		type = res[2].trim().toLowerCase();
		severity = res[3].trim().toLowerCase();
		//msg = res[4];
	} else if (/=-=-=-=-=-=-=-=-=-=-/.test(text)) {
		type = "start";
		severity = "info";
	} else if (contentElem.lastChild) {
		var lastLine = contentElem.lastChild;
		type = lastLine.getAttribute("type");
		severity = lastLine.getAttribute("severity");
	}

	if (type != "start" && !logKeys[type]) type = "default";
	
	lineDiv.setAttribute("type", type);
	lineDiv.setAttribute("severity", severity);
	lineDiv.setAttribute("filter", severity + type);
	lineDiv.classList.add(severity);
	
	checkFilter(lineDiv, severity, type);
	
	lineDiv.textContent = text;
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

function checkFilter(line, severity, type) {
	if (logKeys[type] && !logKeys[type][severity]) line.classList.add("hidden");
}

function setFilter(severity, types) {
	logTypes.forEach(function(type) {
		var typeFilteredIn = types.indexOf(type) > -1;
		if (typeFilteredIn) {
			if (!logKeys[type][severity])
				Array.prototype.slice.call(contentElem.querySelectorAll("[filter=".concat(severity, type, "]"))).forEach(function(line) {
					line.classList.remove("hidden"); });
		} else if (logKeys[type][severity]) {
			Array.prototype.slice.call(contentElem.querySelectorAll("[filter=".concat(severity, type, "]"))).forEach(function(line) {
				line.classList.add("hidden"); });
		}
		logKeys[type][severity] = typeFilteredIn;
	});
}

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

["Info_Filters", "Debug_Filters", "Trace_Filters"].forEach(function(id) {
	var filter = $("#" + id).magicSuggest({
		allowFreeEntries : false,
		data : logTypes.slice(),
		typeDelay : 50,
		expandOnFocus : true,
		placeholder : id
	});
	$(filter).on("selectionchange", function() {
		setFilter(id.slice(0, id.indexOf("_Filters")).toLowerCase(), this.getValue());
	});
});

})();
