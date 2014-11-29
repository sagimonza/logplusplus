;(function() {

Log.Views.DataFeedClass = Backbone.View.extend({
	initialize: function() {
		$("#pause").click(this.togglePaused.bind(this));
		this.listenTo(this.model, "change:paused", this.onPausedChanged);
	},

	togglePaused: function() {
		var $pauseToggle = $("#pause .playPauseToggle");
		if ($pauseToggle.hasClass("fa-pause")) {
			$pauseToggle.removeClass("fa-pause");
			$pauseToggle.addClass("fa-play");
			this.pause();
		} else {
			$pauseToggle.removeClass("fa-play");
			$pauseToggle.addClass("fa-pause");
			this.resume();
		}
	},

	pause: function() {},

	resume: function() {},

	onPausedChanged: function() {}
});

})();