;(function() {

Log.Views.ConsoleLinesClass = Backbone.Marionette.CollectionView.extend({
	el: "#content",

	childView: Log.Views.ConsoleLineClass,

	events: {
		"activeFilterChangedKeys": "onActiveFilterChangedKeys",
		"click #clear": "clear",
		"click #pause": "stopChunks",
		"click #reload": "clear"
	},

	initialize: function(options) {
		this.dataFeedModel = options.dataFeedModel;
		this.filtersModel = options.filtersModel;

		this.listenTo(this.dataFeedModel, "change:feed", this.clear);
		this.listenTo(this.dataFeedModel, "dataAvailable", this.onDataAvailable);
		this.listenTo(this.filtersModel, "change:activeFilters", this.changeActiveFilters);
		this.listenTo(this.collection, "change:filters", this.onLineFiltersChanged)
	},

	clear: function() {
		this.stopChunks();
		this.collection.reset();
	},

	stopChunks: function() {
		clearTimeout(this.nextChunkTimer);
		this.nextChunkTimer = null;
	},

	onDataAvailable: function(data) {
		console.log("ConsoleLines:onDataAvailable");
		var $this = this;
		if (data) {
			_.defer(function() { $this.dataFeedModel.nextChunk(); });
			this.addLines(data);
		} else {
			this.nextChunkTimer = setTimeout(function() { $this.nextChunkTimer = null; $this.dataFeedModel.nextChunk(); }, 250);
		}
	},

	addLines: function(data) {
		var $this = this, scrollIntoView = this.isScrolledToBottom(), newLines = [];
		data.replace(/[^\n]*\n/g, function(line) { newLines.push(new Log.Models.ConsoleLineClass({ raw : line })); });
		this.collection.add(newLines);
		this.pruneLines();
		this.render();
		if (scrollIntoView) this.collection.last().scrollIntoView();
	},

	changeActiveFilters: function(model, activeFilterKeys) {
		console.log("activeFilterKeys:" + activeFilterKeys);
		this.collection.changeActiveFilters(activeFilterKeys);
	},

	onActiveFilterChangedKeys: function(changedKeys) {
		function buildFilter(key) {
			var filter = {};
			[0, 1, 2, 3].forEach(function(i) { filter["filter" + i] = key; });
			return filter;
		}

		// todo: consider using css selector to gain performance boost
		changedKeys.forEach(function(key) { this._applyFilters(this.collection.where(buildFilter(key))); }, this);
	},

	onLineFiltersChanged: function(model, filters) {
		this._applyFilters([model]);
	},

	_applyFilters: function(lines) {
		var activeFilters = this.collection.get("activeFilterKeys");
		Array.prototype.slice.call(lines).forEach(function(lineModel) {
			if (lineModel.get("filters").every(function(filter) { return !activeFilters[filter]; })) lineModel.set("hidden", true);
			else lineModel.set("hidden", false);
		});
	},

	pruneLines: function() {
		// todo: listen to line limits changes
	},

	reset: function() {//each console line removes itself
		//while (this.el.firstChild)
		//	this.el.removeChild(this.el.firstChild);
		//lastIndex = 0;
	},

	isScrolledToBottom: function() {
		var lastLineModel = this.collection.last();
		if (!lastLineModel) return false;

		var lastLineHeight = this.children.findByModel(lastLineModel).getHeight();
		return this.el.scrollTop + this.el.clientHeight >= this.el.scrollHeight - (lastLineHeight / 2);
	}
});

})();
