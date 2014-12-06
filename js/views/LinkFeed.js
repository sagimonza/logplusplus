;(function() {

Log.Views.LinkFeedClass = Log.Views.DataFeedClass.extend({
	initialize: function(options) {
		var $this = this;
		this.options = options;
		this.listenTo(this.model, "change:url", this.render);
		this.options.$linkOpenerView.magnificPopup({
			type: "inline",
			callbacks : {
				open: function() {
					setTimeout(function() { $(".urlInput").focus(); }, 100);
					$("#urlSubmitForm").submit(function(e) { return $this.onUrlSubmit(e); });
				},

				close: function() {
					$("#urlSubmitForm").off();
				}
			},
			midClick: true
		});
		if (!this.options.$delegateViews) this.$el.change(function(e) { return $this.onLinkChanged(e); });
		this.model.filterRegexp = this.options.filterRegexp;
		Log.Views.DataFeedClass.prototype.initialize.apply(this, arguments);
	},

	render: function() {
		var url = this.model.get("url");
		document.title = url;
		this.options.$pickedLogFilename && this.options.$pickedLogFilename.text(url);
	},

	reload: function() {
		this.model.reset();
		this.model.onDataAvailable(this.model.get("feed"));
	},

	onUrlSubmit: function(e) {
		e.preventDefault();
		if (!this.options.$delegateViews)
			this.$el.val($(".urlInput").val()).change();
		else
			this.options.$delegateViews.forEach(function($delegateView) { $delegateView.val($(".urlInput").val()).change(); });
		$.magnificPopup.close();
		return false;
	},

	onLinkChanged: function(e) {
		this.options.$reloadView && this.options.$reloadView.prop("activeFeedView", this);
		this.model.reset();
		this.model.changeLink(e.target.value);
	}
});

})();