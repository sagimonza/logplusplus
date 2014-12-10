;(function() {

App.Models.LineFilterClass = Backbone.Model.extend({
	initialize: function() {
		var filterMap = {};
		LineFilters.forEach(function(filter) {
			filterMap[filter.category] = filterMap[filter.category] || [];
			filterMap[filter.category].push(filter);
		});
		this.set("filterMap", filterMap);
	}
});

})();
