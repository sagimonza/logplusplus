;(function() {

App.Models.FileFeedClass = App.Models.DataFeedClass.extend({
	defaults: {
		paused: false
	},

	initialize: function(options) {
		this.isDataURL = options.isDataURL;
		this._fr = new FileReader();
		this._fr.onloadend = this.onDataAvailable.bind(this);
		App.Models.DataFeedClass.prototype.initialize.apply(this, arguments);
	},

	onDataAvailable: function() {
		// todo: user buffer to remember this lost packet
		if (this.get("paused")) return;
		this.trigger("dataAvailable", this, this._fr.result);
	},

	onPausedChanged: function() {
		this.nextChunk();
	},

	reset: function(startIndex) {
		try { this._fr.abort(); } catch(ex) {}
		if (typeof startIndex == "number") this.set("lastIndex", startIndex);
		App.Models.DataFeedClass.prototype.reset.apply(this, arguments);
	},

	nextChunk: function() {
		if (this.get("paused")) return;

		var file = this.get("feed");
		if (!file) return;

		if (file.size < this.get("lastIndex")) this.reset(0);

		if (this._fr.readyState == 1) return;

		this._fr[!this.isDataURL ? "readAsText" : "readAsDataURL"](file.slice(this.get("lastIndex")));
		this.set("lastIndex", file.size);
	}
});

})();
