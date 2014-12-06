;(function() {

Log.Models.LinkFeedClass = Log.Models.DataFeedClass.extend({
	changeLink: function(url) {
		function extractFeedFromZip(zipData) {
			var zipObj = new JSZip(zipData);
			return Object.keys(zipObj.files).some(function(filename) {
				if ($this.filterRegexp.test(filename)) {
					$this.onDataAvailable(zipObj.file(filename).asText());
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
		Log.Models.DataFeedClass.prototype.reset.apply(this, arguments);
	}
});

})();
