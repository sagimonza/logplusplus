;(function() {

window.App = {
	Models:			{},
	Collections:	{},
	Views:			{}
};

$(document).ready(function() {

	var menuOpenerIds = [];
	var mainViews =	[
		{	viewClass: "ConsoleLinesClass",
			rootId: "console-view",
			contentId: "console",
			actionBarId: "consoleActionBar",
			sidebarOpenerId: "console-menu-sidebar-opener",
			headerActions: ["headerFeedTemplate", "headerFiltersTemplate", "headerPauseTemplate", "headerSectionTemplate",
				"headerRefreshTemplate", "headerSectionTemplate", "headerFontTemplate", "headerSectionTemplate", "headerFavTemplate"],
			headerActionsData: {
				fileId: "logFile",
				linkId: "logLink",
				pauseId: "pause",
				clearId: "clearConsole",
				reloadId: "reloadConsole",
				wrapId: "wrapText",
				incFontId: "increaseFontSize",
				decFontId: "decreaseFontSize",
				defFontId: "defaultFontSize",
				favId: "favorite",
				filenameId: "pickedLogFilename",
				filterRegexp: /.log$/,
				filtersId: "allFilters",
				linkOpenerId: "consoleLinkOpener"
			}
		},
		{	viewClass: "EditorClass",
			rootId: "xml-view",
			contentId: "xml",
			actionBarId: "xmlActionBar",
			sidebarOpenerId: "xml-menu-sidebar-opener",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate", "headerSectionTemplate", "headerReadonlyTemplate"],
			headerActionsData: {
				fileId: "xmlFile",
				linkId: "xmlLink",
				clearId: "clearEditor",
				reloadId: "reloadEditor",
				filenameId: "pickedXMLFilename",
				filterRegexp: /.xml$/,
				readonlyId: "readonlyEditor",
				linkOpenerId: "xmlLinkOpener"
			}
		},
		{	viewClass: "JsonViewerClass",
			rootId: "json-view",
			contentId: "json",
			actionBarId: "jsonActionBar",
			sidebarOpenerId: "json-menu-sidebar-opener",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate"],
			headerActionsData: {
				fileId: "jsonFile",
				linkId: "jsonLink",
				clearId: "clearJSON",
				reloadId: "reloadJSON",
				filenameId: "pickedJSONFilename",
				filterRegexp: /.json$/,
				linkOpenerId: "jsonLinkOpener"
			}
		},
		{	viewClass: "GalleryViewerClass",
			rootId: "gallery-view",
			contentId: "gallery",
			actionBarId: "galleryActionBar",
			sidebarOpenerId: "gallery-menu-sidebar-opener",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate"],
			headerActionsData: {
				fileId: "galleryFile",
				linkId: "galleryLink",
				clearId: "clearGallery",
				reloadId: "reloadGallery",
				filenameId: "pickedGalleryFilename",
				filterRegexp: /.jpg$|.png$|.gif$/,
				linkOpenerId: "galleryLinkOpener",
				isDataURL: true
			}
		}
	].map(function(headersDef) { menuOpenerIds.push(headersDef.sidebarOpenerId); return ViewBuilder.build(headersDef); });

	ViewBuilder.createLinkFeedView({ delegates: ["logLink", "xmlLink", "galleryLink"], linkOpenerId: "feedbackLinkOpener", linkId: "" });

	var menuSidebarView = new App.Views.MenuSidebarClass({ el: "#menu-sidebar", $menuSidebarOpeners: menuOpenerIds.map(function(id) { return $("#" + id); }) });

	function getActiveViewElem() {
		return $("#" + menuSidebarView.getActive()).get(0);
	}

	window.getActiveView = function() {
		var el = getActiveViewElem(), activeView;
		mainViews.some(function(view) {
			if ($.contains(el, view.el)) return activeView = view; });
		return activeView;
	};

	window.setActiveView = function(id) {
		menuSidebarView.setActive(id);
	};

	window.isActiveView = function(view) {
		return view == window.getActiveView();
	};

	$(".reload").click(function() {
		var view = $(this).prop("activeFeedView");
		view && view.reload();
	});

	$(document).keydown(function(e) {
		if (!e.altKey) return;

		switch (e.which) {
			case 49: menuSidebarView.setActive("console-view"); break;
			case 50: menuSidebarView.setActive("xml-view");	break;
			case 51: menuSidebarView.setActive("json-view"); break;
			case 52: menuSidebarView.setActive("gallery-view"); break;
			case 113:
				var innerHovered = $("div:hover").last();
				var $favorite = $(".log-favorite", innerHovered.get(0));
				if ($favorite.length == 1) $favorite.click();
				break;
			default: return;
		}

		e.preventDefault();
		e.stopImmediatePropagation();
	});

	$(document).keydown(function(e) {
		if (!e.altKey) return;

		var method;
		switch (e.which) {
			case 67: // fall through
			case 99: method = "clear"; break;
			case 82: // fall through
			case 114: method = "reload"; break;
		}

		if (!method) return;

		e.preventDefault();

		if (method == "clear") {
			var activeView = window.getActiveView();
			if (activeView) activeView.clear();
		} else {
			$(".reload", getActiveViewElem()).click();
		}
	});
});

})();
