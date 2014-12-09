;(function() {

Log.Views.galleryViewerClass = Backbone.View.extend({
	el: "#gallery",

	initialize: function(options) {
		//this.editor = new JSONEditor(this.el, { mode: "view", modes: ["view", "form"] });
		this.image = document.createElement("img");
		this.el.appendChild(this.image);

		this.dataFeedModels = options.dataFeedModels;
		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);

		$("#clearGallery").on("click", this.clear.bind(this));
	},

	clear: function() {
		this.image.src = "";
	},

	onDataAvailable: function(model, data) {
		this.image.src = "data:image/png;base64," + data;
	}
});

})();
