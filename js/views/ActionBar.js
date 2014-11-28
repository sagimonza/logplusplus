;(function() {

Log.Views.ActionBarClass = Backbone.View.extend({
	events: {
		"click .expandCollapse":	"toggleCollapsed"
	},

	initialize: function() {
		this.listenTo(this.model, "change:collapsed", this.render);
	},

	render: function() {
		if (this.model.get("collapsed")) {
			this.hide();
		} else {
			this.show();
		}

		return this;
	},

	show: function() {
		var $this = this;
		this.$el.addClass("expanding");
		this.$el.one("transitionend", function() {
			$this.$el.removeClass("expanding"); });
		this.$el.removeClass("collapsed");
		return this;
	},

	hide: function() {
		this.$el.addClass("collapsed");
		return this;
	},

	toggleCollapsed: function() {
		this.model.set({ collapsed: !this.model.get("collapsed") });
	}
});

var actionBarView = new Log.Views.ActionBarClass({ model : new Log.Models.ActionBarClass(), el : $("#actionBar").get(0) });

})();
