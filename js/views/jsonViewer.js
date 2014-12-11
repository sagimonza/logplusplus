;(function() {

App.Views.JsonViewerClass = Backbone.View.extend({
	el: "#json",

	initialize: function(options) {
		this.editor = new JSONEditor(this.el, { mode: "view", modes: ["view", "form", "code"] });

		this.dataFeedModels = options.dataFeedModels;
		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);

		var $this = this;
		$("#clearJSON").on("click", this.clear.bind(this));
		$(document).click(function(e) {
			if ($(e.target).hasClass("logJSON")) {
				$this.clear();
				$this.onDataAvailable(null, e.target.textContent);
				setActiveView("json-view");
			}
		});
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
