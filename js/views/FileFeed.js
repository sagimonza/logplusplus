;(function() {

Log.Views.FileFeedClass = Log.Views.DataFeedClass.extend({
	el: ".filePickerWrapper",

	events: {
		"change #logFile": "onFileChanged",
		"click #reload": "reload"
	},

	initialize: function() {
		this.listenTo(this.model, "change:file", this.render);
	},

	render: function() {
		var filename = this.model.get("file").name || "";
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
		this.model.set({ file: e.target.files.item(0) });
		this.model.nextChunk();
	}
});

})();