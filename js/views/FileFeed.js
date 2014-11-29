;(function() {

Log.Views.FileFeedClass = Log.Views.DataFeedClass.extend({
	el: ".filePickerWrapper",

	events: {
		"change #logFile": "onFileChanged"
	},

	initialize: function() {
		this.listenTo(this.model, "change:feed", this.render);
		$("#reload").click(this.reload.bind(this));
		Log.Views.DataFeedClass.prototype.initialize.apply(this, arguments);
	},

	render: function() {
		var file = this.model.get("feed");
		var filename = (file && file.name) || "";
		document.title = filename;
		$("#pickedFilename").text(filename);
	},

	pause: function() {
		this.model.set("paused", true);
	},

	resume: function() {
		this.model.set("paused", false);
	},

	reload: function() {
		this.model.reset(0);
	},

	onFileChanged: function(e) {
		this.model.reset(0);
		this.model.set({ feed: e.target.files.item(0) });
		this.model.nextChunk();
	}
});

})();