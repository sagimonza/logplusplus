;(function() {

App.Models.LinkFeedClass = App.Models.DataFeedClass.extend({
	initialize: function(options) {
		this.isDataURL = options && options.isDataURL;
	},

	changeLink: function(url) {
		function extractFeedFromZip(zipData) {
			var zipObj = new JSZip(zipData);
			var files = Object.keys(zipObj.files);
			files.sort(function(file1, file2) { return file1.split("/").length - file2.split("/").length; });
			return files.some(function(filename) {
				if ($this.filterRegexp.test(filename)) {
					var data;
					if (!$this.isDataURL) data = zipObj.file(filename).asText();
					else {
						var uint8Arr = zipObj.file(filename).asUint8Array(), binData = "";
						for (var i = 0; i < uint8Arr.length; i += 10000) {
							binData += String.fromCharCode.apply(null, uint8Arr.subarray(i, Math.min(i + 10000, uint8Arr.length)));
						}
						data = btoa(binData);
					}

					if (data !== undefined) $this.onDataAvailable(data);
					return true;
				} else if (/.zip$/.test(filename)) {
					return extractFeedFromZip(zipObj.file(filename).asArrayBuffer());
				}
			});
		}

		var $this = this;
		this.set("url", "");
		this.set("url", url);
		console.log("changed url to:" + url);

		if (this.xhr) this.xhr.abort();
		this.xhr = new XMLHttpRequest();
		if (/.zip$/.test(url)) this.xhr.responseType = "arraybuffer";
		this.xhr.addEventListener("load", function() {
			console.log("loaded url:" + url);
			if ($this.xhr.responseType != "arraybuffer") $this.onDataAvailable($this.xhr.response);
			else extractFeedFromZip($this.xhr.response);
		});
		console.log("sending xhr to:" + url);
		this.xhr.open("GET", url);
		this.xhr.send();
	},

	onDataAvailable: function(data) {
		var $this = this;
		this.set("feed", null);
		this.set("feed", data);
		_.defer(function() { $this.trigger("dataAvailable", $this, data); });
	},

	nextChunk: function() {},

	reset: function(data) {
		try { this.xhr && this.xhr.abort(); } catch(ex) {}
		App.Models.DataFeedClass.prototype.reset.apply(this, arguments);
	}
});

})();
