;(function() {

App.Views.MobileEmulatorClass = Backbone.View.extend({
	initialize: function(options) {
		this.name = options.name;
		this.template = _.template($("#mobileEmulatorTemplate").html());

		this.dataFeedModels = options.dataFeedModels;
		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "reset", this.clear);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);

		$("#" + options.ids.clearId).on("click", this.clear.bind(this));
		$("#" + options.ids.importLinesId).on("click", this.importLog.bind(this));

		this.consoleLinesView = options.consoleLinesView;

		this.$envSelect = $("#" + options.ids.envSelectId);
		this.$envSelect.multipleSelect({
			placeholder: "Select Environment",
			single: true,
			width: 340,
			maxHeight: 400,
			onClick: this.changeSrc.bind(this)
		});

		this.render();
	},

	render: function() {
		this.$el.html(this.template());
		$(".mobile-emulator", this.$el).on("load", this.onEmulatorReady.bind(this));
	},

	importLog: function() {
		var responses = "[".concat(
			$(".logJSON", ViewInstanceManager.getViews("ConsoleLinesClass")[0].getLogLines().filter("[mcactions*='received msg'],[responses]")).map(function() { return $(this).text(); }).get().join(","),
			"]");
		this.onDataAvailable(responses);
	},

	onEmulatorReady: function() {
		this._ready = true;
	},

	changeSrc: function() {
		this._ready = false;
		$(".mobile-emulator", this.$el).get(0).src = "about:blank";

		var $this = this;
		_.defer(function() { $(".mobile-emulator", $this.$el).get(0).src = $this.$envSelect.multipleSelect("getSelects")[0]; });
	},

	onDataAvailable: function(responsesStr) {
		this.postResponses(responsesStr);
	},

	clear: function() {
		this.changeSrc();
	},

	postResponses: function(responsesStr) {
		if (!this._ready) return alert("Oops, emulator wasn't loaded yet");
		if (!responsesStr || responsesStr.length <= 2) return alert("Oops, empty responses");
		$(".mobile-emulator", this.$el).get(0).contentWindow.postMessage(responsesStr, "*");
	}
});

})();
