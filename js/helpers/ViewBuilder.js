
(function() {

window.ViewBuilder = {
	build: function(options) {
		var ids = { rootId: options.rootId, contentId: nextId() }, viewElems = [];
		var headerActions = ["headerGenericTemplate"].concat(options.headerActions);

		headerActions.forEach(function(headerActionId) {
			addTemplateIds(ids, headerActionId);
			viewElems.push((_.template($("#" + headerActionId).html(), { variable : "args" }))(ids));
		});

		var rootHeaderElem = $((viewElems.splice(0, 1))[0]);
		var containerElem = $(".actions-header", rootHeaderElem.get(0));
		viewElems.forEach(function(viewElem) { containerElem.append(viewElem); });

		$("#main").append($('<div id="' + ids.rootId + '">').append(rootHeaderElem).append('<div id="' + ids.contentId + '" class="mainContent"></div>'));

		return { view: this._prepareView(options.viewClass, options.name, ids, options.headerActionsData), ids: ids };
	},

	createView: function(options) {
		var ids = {};
		addViewIds(ids, options.viewType);
		if (options.createHTML) options.createHTML(ids);
		return { view: this["create" + options.viewType](ids), ids: ids };
	},

	createFileFeedView: function(ids, props) {
		if (!ids.fileId) return;

		var fileModel = new App.Models.FileFeedClass({ isDataURL: props.isDataURL });
		return ViewInstanceManager.add("FileFeedClass", { el: "#" + ids.fileId, model: fileModel, $reloadView: $("#" + ids.reloadId),
			$pickedFilename: $("#" + ids.filenameId), $pause: $("#" + ids.pauseId) });
	},

	createLinkFeedView: function(ids, props) {
		if (!ids.linkId) return;

		var linkModel = new App.Models.LinkFeedClass({ isDataURL: props.isDataURL });
		return ViewInstanceManager.add("LinkFeedClass", { el: ("#" + ids.linkId), model: linkModel, filterRegexp: props.filterRegexp,
			$reloadView: $("#" + ids.reloadId), $linkOpenerView: $("#" + ids.linkOpenerId), $pickedFilename: $("#" + ids.filenameId) });
	},

	createDelegateLinkFeedView: function(ids) {
		var linkModel = new App.Models.LinkFeedClass();
		return ViewInstanceManager.add("LinkFeedClass", { model: linkModel, $linkOpenerView: $("#" + ids.linkOpenerId) });
	},

	createFiltersView: function(ids) {
		if (!ids.filtersId) return;

		var filtersModel = new App.Models.LineFilterClass();
		return ViewInstanceManager.add("LineFilterClass", { el: "#" + ids.filtersId, model: filtersModel });
	},

	_prepareView: function(viewClass, name, ids, headerActionsData) {
		var fileFeedView = this.createFileFeedView(ids, headerActionsData);
		var linkFeedView = this.createLinkFeedView(ids, headerActionsData);
		var filtersView = this.createFiltersView(ids, headerActionsData);

		var dataFeedModels = [];
		if (fileFeedView) dataFeedModels.push(fileFeedView.model);
		if (linkFeedView) dataFeedModels.push(linkFeedView.model);

		return ViewInstanceManager.add(viewClass, { el: "#" + ids.contentId, name: name, ids: ids, dataFeedModels: dataFeedModels, filtersView: filtersView });
	}
};

var BASE_VIEW_CONTROL_ID = "vc", baseIdCount = 0;
function nextId() { return BASE_VIEW_CONTROL_ID + (baseIdCount++); }

var template2ids = {
	headerGenericTemplate: ["actionBarId", "sidebarOpenerId"],
	headerFeedTemplate: ["fileId", "linkId", "linkOpenerId", "filenameId"],
	headerFiltersTemplate: ["filtersId"],
	headerPauseTemplate: ["pauseId"],
	headerRefreshTemplate: ["clearId", "reloadId"],
	headerFontTemplate: ["wrapId", "incFontId", "decFontId", "defFontId"],
	headerFavTemplate: ["favId", "clearFavId"],
	headerReadonlyTemplate: ["readonlyId"],
	headerSectionTemplate: []
};

var viewTypes = {
	DelegateLinkFeedView: { ids: ["linkOpenerId"], mainId: "linkOpenerId" }
};

function addTemplateIds(ids, templateId) {
	template2ids[templateId].forEach(function(prop) { ids[prop] = nextId(); });
}

function addViewIds(ids, viewType) {
	viewTypes[viewType].ids.forEach(function(prop) { ids[prop] = nextId(); });
	ids.mainId = ids[viewTypes[viewType].mainId];
}

var ViewInstanceManager = window.ViewInstanceManager = {
	add: function(clazz, options) {
		if (!this.views[clazz]) this.views[clazz] = [];
		this.views[clazz].push(new App.Views[clazz](options));
		return _.last(this.views[clazz]);
	},

	getViews: function(clazz) {
		return this.views[clazz] || [];
	},

	views: {}
};

})();
