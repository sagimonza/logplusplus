;(function() {

App.Views.GalleryViewerClass = Backbone.View.extend({
	initialize: function(options) {
		this.image = document.createElement("img");

		this.dataFeedModels = options.dataFeedModels;
		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);

		this.name = options.name;

		this.el.appendChild(this.image);

		$("#" + options.ids.clearId).on("click", this.clear.bind(this));
	},

	clear: function() {
		this.image.src = "";
	},

	onDataAvailable: function(model, data) {
		if (data && data.slice(0, 5) != "data:") data = "data:image/png;base64," + data;
		this.image.src = data;
	}
});

})();
