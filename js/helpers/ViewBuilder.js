
(function() {

window.ViewBuilder = {
	build: function(options) {
		var rootHeaderElem = $((_.template($("#headerGenericTemplate").html(), { variable : "args" }))({ actionBarId: options.actionBarId, sidebarOpenerId: options.sidebarOpenerId }));
		var containerElem = $(".actions-header", rootHeaderElem.get(0));
		options.headerActions.forEach(function(headerActionId) {
			containerElem.append((_.template($("#" + headerActionId).html(), { variable : "args" }))(options.headerActionsData)); });
		$("#main").append($('<div id="' + options.rootId + '">').append(rootHeaderElem).append('<div id="' + options.contentId + '" class="mainContent"></div>'));

		return this._prepareView(options.viewClass, options.headerActionsData);
	},

	createFileFeedView: function(props) {
		if (!props.fileId) return;

		var fileModel = new App.Models.FileFeedClass({ isDataURL: props.isDataURL });
		return new App.Views.FileFeedClass({ el: "#" + props.fileId, model: fileModel, $reloadView: $("#" + props.reloadId),
			$pickedFilename: $("#" + props.filenameId) });
	},

	createLinkFeedView: function(props) {
		if (props.linkId === undefined) return;

		var linkModel = new App.Models.LinkFeedClass({ isDataURL: props.isDataURL });
		return new App.Views.LinkFeedClass({ el: props.linkId ? ("#" + props.linkId) : undefined, $delegateViews: props.delegates && props.delegates.map(function(id) { return $("#" + id); }),
			model: linkModel, filterRegexp: props.filterRegexp, $reloadView: props.reloadId && $("#" + props.reloadId), $linkOpenerView: $("#" + props.linkOpenerId),
			$pickedFilename: props.filenameId && $("#" + props.filenameId) });
	},

	createFiltersView: function(props) {
		if (!props.filtersId) return;

		var filtersModel = new App.Models.LineFilterClass();
		return new App.Views.LineFilterClass({ model: filtersModel });
	},

	_prepareView: function(viewClass, headerActionsData) {
		var fileFeedView = this.createFileFeedView(headerActionsData);
		var linkFeedView = this.createLinkFeedView(headerActionsData);
		var filtersView = this.createFiltersView(headerActionsData);
		if (filtersView) filtersView.render();

		var dataFeedModels = [];
		if (fileFeedView) dataFeedModels.push(fileFeedView.model);
		if (linkFeedView) dataFeedModels.push(linkFeedView.model);

		return new App.Views[viewClass]({ dataFeedModels: dataFeedModels, filtersModel: filtersView && filtersView.model });
	}
};

})();
