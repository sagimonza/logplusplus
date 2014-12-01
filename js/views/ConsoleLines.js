;(function() {

Log.Views.ConsoleLinesClass = Backbone.View.extend({
	el: "#content",

	childView: Log.Views.ConsoleLineClass,

	initialize: function(options) {
		this.activeFilterKeys = {};
		this.modelCollection = [];

		this.dataFeedModel = options.dataFeedModel;
		this.filtersModel = options.filtersModel;

		this.listenTo(this.dataFeedModel, "change:feed", this.clear);
		this.listenTo(this.dataFeedModel, "change:paused", this.onPausedToggled);
		this.listenTo(this.dataFeedModel, "dataAvailable", this.onDataAvailable);
		this.listenTo(this.filtersModel, "change:activeFilters", this.changeActiveFilters);
	},

	clear: function() {
		this.modelCollection = [];
		var newEl = $("<div></div>").attr("id", "content").attr("class", "log").get(0);
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

	onDataAvailable: function(data) {
		var $this = this;
		if (data) {
			_.defer(function() { $this.dataFeedModel.nextChunk(); });
			this.addLines(data);
		} else {
			this.nextChunkTimer = setTimeout(function() { $this.nextChunkTimer = null; $this.dataFeedModel.nextChunk(); }, 250);
		}
	},

	addLines: function(data) {
		function addLine() {
			var line = newLines[currentIndex++];
			var model = createLineModel(line, prevLine);
			model.applyFilters($this.activeFilterKeys);

			model.__view = createLineView(model);
			$this.el.appendChild(model.__view.el);
			prevLine = line;

			$this.modelCollection.push(model);
			if (currentIndex < newLines.length) {
				if ((currentIndex % 1000) == 0) _.defer(function() { addLine(); });
				else addLine();
			} else {
				$this.pruneLines();
				if (scrollIntoView) _.last($this.modelCollection).__view.scrollIntoView();
			}
		}

		var $this = this, scrollIntoView = this.isScrolledToBottom(), newLines = [], prevLine;

		data.replace(/[^\n]*\n/g, function(line) { newLines.push(line); });
		var currentIndex = 0;
		addLine();

		return;

		data.replace(/[^\n]*\n/g, function(line) { addLine(line); });
		this.pruneLines();
		if (scrollIntoView) _.last(this.modelCollection).__view.scrollIntoView();
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

function LineModel(line, prevLine) {
	this.text = line;
	this._favorite = false;
	LineParsers.parse(this);

	if (!LineTypes[this.type]) {
		var lastLineModel = prevLine;
		this.type = (lastLineModel && lastLineModel.type) || "default";
		this.severity = this.severity || (lastLineModel && lastLineModel.severity) || "info";
	}
}

LineModel.prototype = {
	applyFilters: function(activeFilters) {
		var modelFilters = this.filters = LineFilters.getFilterKeys(this), modelFiltersLen = modelFilters.length;
		var visibleModel;

		for (var i = 0; !visibleModel && i < modelFiltersLen; ++i) {
			if (activeFilters[modelFilters[i]]) {
				visibleModel = true;
			}
		}

		this.hidden = !visibleModel;
	},

	set hidden(val) {
		if (this._hidden != !!val) {
			this._hidden = !!val;
			if (this.__view) this.__view.onHiddenChange(this._hidden);
		}
	},

	get hidden() {
		return this._hidden;
	},

	set favorite(val) {
		if (this._favorite != !!val) {
			this._favorite = !!val;
			this.__view.onFavoriteChange(this._favorite);
		}
	},

	get favorite() {
		return !!this._favorite;
	}
};

function createLineModel(line, prevLine) {
	return new LineModel(line, prevLine);
}

function createLineView(lineModel) {
	var view = document.createElement("div");
	var hidden = lineModel.hidden ? "hidden" : "";
	view.setAttribute("type", lineModel.type);
	view.setAttribute("severity", lineModel.severity);
	view.setAttribute("class", "logLine ".concat(lineModel.severity, " ", hidden));

	var filters = lineModel.filters, filterLen = filters.length;
	for (var i = 0; i < filterLen; ++i) view.setAttribute("filter" + i, filters[i]);

	var fav = document.createElement("span");
	fav.setAttribute("class", "logFavorite fa fa-star-o");
	view.appendChild(fav);

	if (lineModel.message) {
		var message = lineModel.message, messageLen = message.length;
		for (var  j = 0; j < messageLen; ++j) {
			switch (message[j][0]) {
				case "json":
					var jsonElem = document.createElement("a");
					jsonElem.classList.add("logJSON");
					jsonElem.textContent = message[j][1];
					view.appendChild(jsonElem);
					break;
				case "text": // fall through
				default:
					view.appendChild(document.createTextNode(message[j][1]));
			}
		}
	} else view.appendChild(document.createTextNode(lineModel.text));

	view.el = view;
	view.render = function() { return this; };
	view.hide = function() { this.classList.add("hidden"); };
	view.show = function() { this.classList.remove("hidden"); };
	view.getHeight = function() { return $(this).height(); };
	view.onFavoriteChange = function() {
		$(".logFavorite", this).toggleClass("fa-star-o");
		$(".logFavorite", this).toggleClass("fa-star");
	};
	view.onHiddenChange = function(newHidden) {
		if (newHidden) this.hide();
		else this.show();
	};


	view.__model = lineModel;

	return view;
}

})();
