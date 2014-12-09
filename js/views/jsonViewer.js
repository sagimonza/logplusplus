;(function() {

Log.Views.jsonViewerClass = Backbone.View.extend({
	el: "#json",

	initialize: function(options) {
		this.editor = new JSONEditor(this.el, { mode: "view", modes: ["view", "form"] });

		this.dataFeedModels = options.dataFeedModels;
		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);

		$("#clearJSON").on("click", this.clear.bind(this));
	},

	clear: function() {
		this.editor.set({});
	},

	onDataAvailable: function(model, data) {
		this.editor.setText(data);
		this.editor.expandAll();
	}
});

})();
