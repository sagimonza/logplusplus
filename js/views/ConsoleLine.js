;(function() {

Log.Views.ConsoleLineClass = Backbone.View.extend({
	tagName: "div",

	render: function() {
		this.$el.text(this.model.get("text"));
		return this;
	},

	show: function() {
		this.$el.removeClass("hidden");
		return this;
	},

	hide: function() {
		this.$el.addClass("hidden");
		return this;
	},

	getHeight: function() {
		return this.$el.height();
	},

	scrollIntoView: function() {
		this.el.scrollIntoView();
	}
});

})();
