;(function() {

App.Views.DataFeedClass = Backbone.View.extend({
	initialize: function(options) {
		if (options.$pause) {
			this.$pause = options.$pause;
			this.$pause.click(this.togglePaused.bind(this));
		}

		this.name = options.name;

		this.listenTo(this.model, "change:paused", this.onPausedChanged);
	},

	togglePaused: function() {
		var $pauseToggle = $(".playPauseToggle", this.$pause);
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