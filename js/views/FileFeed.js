;(function() {

App.Views.FileFeedClass = App.Views.DataFeedClass.extend({
	events: {
		"change": "onFileChanged"
	},

	initialize: function(options) {
		this.options = options;
		this.listenTo(this.model, "change:feed", this.render);
		App.Views.DataFeedClass.prototype.initialize.apply(this, arguments);
	},

	render: function() {
		var file = this.model.get("feed");
		var filename = (file && file.name) || "";
		document.title = filename;
		this.options.$pickedFilename.text(filename);
	},

	pause: function() {
		this.model.set("paused", true);
	},

	resume: function() {
		this.model.set("paused", false);
	},

	reload: function() {
		this.model.reset(0);
		this.model.onDataAvailable();
	},

	onFileChanged: function(e) {
		if (this.ignoreChange) return;

		this.options.$reloadView.prop("activeFeedView", this);
		this.model.reset(0);
		this.model.set({ feed: null });
		this.model.set({ feed: e.target.files.item(0) });
		this.model.nextChunk();
		this.ignoreChange = true;
		this.$el.val("");
		this.ignoreChange = false;
	}
});

})();