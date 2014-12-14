;(function() {

App.Views.JsonViewerClass = Backbone.View.extend({
	initialize: function(options) {
		this.editor = new JSONEditor(this.el, { mode: "view", modes: ["view", "form", "code"] });

		this.dataFeedModels = options.dataFeedModels;
		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);

		this.name = options.name;

		var $this = this;
		$("#" + this.clearId).on("click", this.clear.bind(this));
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
