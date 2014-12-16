;(function() {

App.Views.ConsoleLinesClass = Backbone.View.extend({
	initialize: function(options) {
		this.activeFilterKeys = {};
		this.modelCollection = [];

		this.dataFeedModels = options.dataFeedModels;
		this.filtersView = options.filtersView;
		this.name = options.name;

		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "reset", this.clear);
			this.listenTo(dataFeedModel, "change:paused", this.onPausedToggled);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);
		this.listenTo(this.filtersView.model, "change:activeFilters", this.changeActiveFilters);

		$("#" + options.ids.clearId).on("click", this.clear.bind(this));
		$("#" + options.ids.favId).on("click", this.showNextFavorite.bind(this));
		$("#" + options.ids.clearFavId).on("click", this.clearFavorites.bind(this));
		$("#" + options.ids.wrapId).on("click", this.toggleWrapText.bind(this));
		$("#" + options.ids.incFontId).on("click", this.increaseFontSize.bind(this));
		$("#" + options.ids.decFontId).on("click", this.decreaseFontSize.bind(this));
		$("#" + options.ids.defFontId).on("click", this.resetFontSize.bind(this));

		var $this = this;
		$(document).keydown(function(e) {
			if (!ViewNavigation.isActiveView($this)) return;

			if (!e.altKey && e.which == 113)
				$this.showNextFavorite();
			else if(e.altKey && e.which == 87)
				$this.toggleWrapText();
			else if(e.altKey && (e.which == 61 || e.which == 187))
				$this.increaseFontSize();
			else if(e.altKey && (e.which == 173 || e.which == 189))
				$this.decreaseFontSize();
		});

		$(document).click(function(e) {
			if ($(e.target).hasClass("log-favorite")) $this.toggleFavorite(e);
		});

		this.filtersView.render();
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
		function getLastVisibleLine(modelCollection) {
			for (var i = modelCollection.length - 1; i >= 0; --i) {
				if (!modelCollection[i].hidden) return modelCollection[i];
			}
		}

		function isScrolledToBottom(container, lastVisibleLine) {
			if (!lastVisibleLine  || !lastVisibleLine.__view) return true;

			var lastLineHeight = lastVisibleLine.__view.getHeight();
			return container.scrollTop + container.clientHeight >= container.scrollHeight - lastLineHeight;
		}

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
				if (scrollIntoView) {
					var lastVisibleLine = getLastVisibleLine($this.modelCollection);
					if (lastVisibleLine) lastVisibleLine.__view.scrollIntoView();
				}
			}
		}

		var $this = this, lastVisibleLine = getLastVisibleLine(this.modelCollection), scrollIntoView = isScrolledToBottom(this.el, lastVisibleLine), newLines = [], prevLineModel;

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

	getLogLines: function() {
		return $(".log-line", this.$el);
	},

	toggleFavorite: function(e) {
		var model = e.target.parentElement.__model;
		model.favorite = !model.favorite;
	},

	showNextFavorite: function() {
		var currentSelection = window.getSelection();
		var view = $(currentSelection.baseNode).closest(".log-line");
		var nextFavorite = $("~ .log-line:not(.hidden) > .fa-star", view).get(0);
		if (!nextFavorite) {
			var firstModel = this.modelCollection[0];
			view = firstModel && $(firstModel.__view);
			nextFavorite = view && $("~ .log-line > .fa-star", view).get(0);
		}

		if (nextFavorite) {
			nextFavorite.parentElement.scrollIntoView();
			var range = document.createRange();
			range.selectNode(nextFavorite.parentElement);
			currentSelection.removeAllRanges();
			currentSelection.addRange(range);
		}
	},

	clearFavorites: function() {
		$(".log-line > .fa-star").parent().each(function() { this.__model.favorite = false; });
	},

	toggleWrapText : function() {
		var cons = this.$el;
		if (cons.attr("wrap")) {
			cons.removeAttr("wrap").css("overflow-x","auto");
		} else {
			cons.attr("wrap","wrap").css("overflow-x","hidden");
		}
	},

	increaseFontSize : function() {
		this.$el.css("font-size", (parseInt(this.$el.css("font-size")) + 2) + "px");
	},

	decreaseFontSize : function() {
		this.$el.css("font-size", (parseInt(this.$el.css("font-size")) - 2) + "px");
	},

	resetFontSize: function() {
		this.$el.css("font-size", "");
	}
});

})();
