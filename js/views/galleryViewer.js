;(function() {

App.Views.GalleryViewerClass = Backbone.View.extend({
	initialize: function(options) {
		this.image = document.createElement("img");
		this.el.appendChild(this.image);

		this.dataFeedModels = options.dataFeedModels;
		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);

		$("#" + options.ids.clearId).on("click", this.clear.bind(this));
	},

	clear: function() {
		this.image.src = "";
	},

	onDataAvailable: function(model, data) {
		this.image.src = "data:image/png;base64," + data;
	}
});

})();
