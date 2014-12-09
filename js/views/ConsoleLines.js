;(function() {

Log.Views.ConsoleLinesClass = Backbone.View.extend({
	el: "#console",

	initialize: function(options) {
		this.activeFilterKeys = {};
		this.modelCollection = [];

		this.dataFeedModels = options.dataFeedModels;
		this.filtersModel = options.filtersModel;

		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "reset", this.clear);
			this.listenTo(dataFeedModel, "change:paused", this.onPausedToggled);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);
		this.listenTo(this.filtersModel, "change:activeFilters", this.changeActiveFilters);

		$("#clearConsole").on("click", this.clear.bind(this));
		$("#favorite").on("click", this.showNextFavorite.bind(this));

		var $this = this;
		$(document).keydown(function(e) { if (!e.altKey && e.which == 113) $this.showNextFavorite(); });
		$(document).click(function(e) {
			if ($(e.target).hasClass("logFavorite")) $this.toggleFavorite(e);
		});
	},

	clear: function() {
		this.modelCollection = [];
		var newEl = $("<div></div>").attr("id", this.$el.attr("id")).attr("class", this.$el.attr("class")).get(0);
		this.el.parentElement.replaceChild(newEl, this.el);
		this.setElement(newEl);
	},

	onPausedToggled: function(model, paused) {
		if (paused) this.stopChunks();
	},

	stopChunks: function() {
		clearTimeout(this.nextChunkTimer);
		this.nextChunkTimer = null;
	},

	onDataAvailable: function(model, data) {
		var $this = this;
		if (data) {
			_.defer(function() { model.nextChunk(); });
			this.addLines(data);
		} else {
			this.nextChunkTimer = setTimeout(function() { $this.nextChunkTimer = null; model.nextChunk(); }, 250);
		}
	},

	addLines: function(data) {
		function addLine() {
			var line = newLines[currentIndex++];
			prevLineModel = new ConsoleLineModel(line, prevLineModel);
			prevLineModel.applyFilters($this.activeFilterKeys);

			prevLineModel.__view = new ConsoleLineView(prevLineModel);
			$this.el.appendChild(prevLineModel.__view.el);

			$this.modelCollection.push(prevLineModel);
			if (currentIndex < newLines.length) {
				if ((currentIndex % 1000) == 0) _.defer(function() { addLine(); });
				else addLine();
			} else {
				$this.pruneLines();
				if (scrollIntoView) _.last($this.modelCollection).__view.scrollIntoView();
			}
		}

		var $this = this, scrollIntoView = this.isScrolledToBottom(), newLines = [], prevLineModel;

		data.replace(/[^\n]*\n/g, function(line) { newLines.push(line); });
		var currentIndex = 0;
		addLine();
	},

	changeActiveFilters: function(model, activeFilterKeys) {
		var currentActiveFilterKeys = this.activeFilterKeys || {};
		var changedKeys = activeFilterKeys.filter(function(key) { return !currentActiveFilterKeys[key]; }).
			concat(Object.keys(currentActiveFilterKeys).filter(function(key) { return currentActiveFilterKeys[key] && activeFilterKeys.indexOf(key) == -1; }));

		changedKeys.forEach(function(key) { currentActiveFilterKeys[key] = activeFilterKeys.indexOf(key) > -1; });
		this.activeFilterKeys = currentActiveFilterKeys;
		this.onActiveFilterChangedKeys(changedKeys);
	},

	onActiveFilterChangedKeys: function(changedKeys) {
		function buildFilterSelector(key) {
			return [0, 1, 2, 3].map(function(i) { return "[filter".concat(i, "=", key, "]"); }).join(",");
		}
		changedKeys.forEach(function(key) { this._applyFilters(Array.prototype.slice.call($(buildFilterSelector(key), this.el))); }, this);
	},

	_applyFilters: function(lineElems) {
		var activeFilters = this.activeFilterKeys;
		lineElems.forEach(function(lineElem) {
			var lineModel = lineElem.__model;
			lineModel.hidden = lineModel.filters.every(function(filter) { return !activeFilters[filter]; });
		});
	},

	pruneLines: function() {
		// todo: listen to line limits changes
	},

	isScrolledToBottom: function() {
		var lastLineModel = _.last(this.modelCollection);
		if (!lastLineModel  || !lastLineModel.__view) return true;

		var lastLineHeight = lastLineModel.__view.getHeight();
		return this.el.scrollTop + this.el.clientHeight >= this.el.scrollHeight - (lastLineHeight / 2);
	},

	toggleFavorite: function(e) {
		var model = e.target.parentElement.__model;
		model.favorite = !model.favorite;
	},

	showNextFavorite: function() {
		var currentSelection = window.getSelection();
		var view = $(currentSelection.baseNode).closest(".logLine");
		var nextFavorite = $("~ .logLine:not(.hidden) > .fa-star", view).get(0);
		if (!nextFavorite) {
			var firstModel = this.modelCollection[0];
			view = firstModel && $(firstModel.__view);
			nextFavorite = view && $("~ .logLine > .fa-star", view).get(0);
		}

		if (nextFavorite) {
			nextFavorite.parentElement.scrollIntoView(false);
			var range = document.createRange();
			range.selectNode(nextFavorite.parentElement);
			currentSelection.removeAllRanges();
			currentSelection.addRange(range);
		}
	}
});

})();
