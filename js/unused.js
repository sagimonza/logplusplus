
function createLineView(lineModel) {
	var attrs = {
		type: lineModel.type,
		severity: lineModel.severity
	};

	lineModel.filters.forEach(function(filter, i) { attrs["filter" + i] = filter.filterKey });

	var hidden = lineModel.get("hidden") ? "hidden" : "";
	return new Log.Views.ConsoleLineClass({ model: lineModel, className: "logLine ".concat(lineModel.severity, " ", hidden), attributes: attrs });
}




function onInitFs(fs) {
	console.log("1");
	window.fs = fs;
	fs.root.getFile('123log.txt', {create: true}, function(fileEntry) {
		console.log("2");
		// Create a FileWriter object for our FileEntry (log.txt).
		fileEntry.createWriter(function(fileWriter) {
			console.log("3");
			fileWriter.onwriteend = function(e) {
				console.log('Write completed.');
			};

			fileWriter.onerror = function(e) {
				console.log('Write failed: ' + e.toString());
			};

			// Create a new Blob and write it to log.txt.
			var bb = new Blob(["MEOW"]);
			// Note: window.WebKitBlobBuilder.
			fileWriter.write(bb);

		});

	});

}

window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.requestFileSystem(window.PERSISTENT, 1024*1024, onInitFs, function() { console.log("NOT"); });
