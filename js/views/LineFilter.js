;(function() {

App.Views.LineFilterClass = Backbone.View.extend({
	render: function() {
		var filterMap = this.model.get("filterMap");
		this.template = _.template($("#lineFilterTemplate").html(), { variable : "args" });
		this.$el.html(this.template({
			categories: Object.keys(filterMap),
			filters: filterMap
		}));

		var setFilters = this.setFilters.bind(this);
		this.$el.multipleSelect({
			placeholder: "Add Filters",
			multiple: true,
			multipleWidth: 100,
			width: 340,
			maxHeight: 400,
			minimumCountSelected: 5,
			filter : true,
			onCheckAll: setFilters,
			onUncheckAll: setFilters,
			onOptgroupClick: setFilters,
			onClick: setFilters
		});

		return this;
	},

	setFilters: function() {
		this.model.set("activeFilters", this.$el.multipleSelect("getSelects"));
	}
});

})();
