;(function() {

Log.Models.DataFeedClass = Backbone.Model.extend({
	initialize: function() {
		this.on("change:paused", this.onPausedChanged.bind(this));
	},

	onPausedChanged: function() {},

	reset: function() {
		this.trigger("reset");
	}
});

})();
