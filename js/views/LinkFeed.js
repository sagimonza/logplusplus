;(function() {

Log.Views.LinkFeedClass = Log.Views.DataFeedClass.extend({
	el: "#logLink",

	initialize: function() {
		var $this = this;
		this.listenTo(this.model, "change:url", this.render);
		$("#reload").click(this.reload.bind(this));
		$("#linkOpener").magnificPopup({
			type: "inline",
			callbacks : {
				open: function() { setTimeout(function() { $(".urlInput").focus(); }, 100); }
			},
			midClick: true
		});
		$("#urlSubmitForm").submit(function(e) { return $this.onUrlSubmit(e); });
		$("#logLink").change(function(e) { return $this.onLinkChanged(e); });
		Log.Views.DataFeedClass.prototype.initialize.apply(this, arguments);
	},

	render: function() {
		console.log("render");
		var url = this.model.get("url");
		document.title = url;
		$("#pickedFilename").text(url);
	},

	reload: function() {
		this.model.reset();
		this.model.onDataAvailable(this.model.get("feed"));
	},

	onUrlSubmit: function(e) {
		e.preventDefault();
		$("#logLink").val($(".urlInput").val()).change();
		console.log("url submitted");
		$.magnificPopup.close();
		return false;
	},

	onLinkChanged: function(e) {
		console.log("on link changed");
		this.model.reset();
		this.model.changeLink(e.target.value);
	}
});

})();