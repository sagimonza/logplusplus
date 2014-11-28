;(function() {

Log.Views.ConsoleLineClass = Backbone.Marionette.ItemView.extend({
	template: function(serialized_model) {
		return _.template($("#consoleLineTemplate").html(), { variable: "args" })(serialized_model);
	},

	initialize: function() {
		this.listenTo(this.model, "change:hidden", this.onHiddenChange);
		this.listenTo(this.model, "deleted", this.delete);
	},

	onHiddenChange: function(model, hidden) {
		if (hidden) {
			this.hide();
		} else {
			this.show();
		}
	},

	delete: function() {
		this.el.remove();
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
		return this.el.clientHeight;
	},

	scrollIntoView: function() {
		this.el.scrollIntoView();
	}
});

})();
