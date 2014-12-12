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
			headerActions: ["headerFeedTemplate", "headerFiltersTemplate", "headerPauseTemplate", "headerSectionTemplate",
				"headerRefreshTemplate", "headerSectionTemplate", "headerFontTemplate", "headerSectionTemplate", "headerFavTemplate"],
			headerActionsData: {
				filterRegexp: /.log$/
			}
		},
		{	viewClass: "EditorClass",
			rootId: "xml-view",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate", "headerSectionTemplate", "headerReadonlyTemplate"],
			headerActionsData: {
				filterRegexp: /.xml$/
			}
		},
		{	viewClass: "JsonViewerClass",
			rootId: "json-view",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate"],
			headerActionsData: {
				filterRegexp: /.json$/
			}
		},
		{	viewClass: "GalleryViewerClass",
			rootId: "gallery-view",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate"],
			headerActionsData: {
				filterRegexp: /.jpg$|.png$|.gif$/,
				isDataURL: true
			}
		}
	].map(function(headersDef) { var res = ViewBuilder.build(headersDef); menuOpenerIds.push(res.ids.sidebarOpenerId); return res.view; });

	ViewBuilder.createDelegateLinkFeedView({ linkOpenerId: "feedbackLinkOpener" });

	var menuSidebarView = new App.Views.MenuSidebarClass({ el: "#menu-sidebar", $menuSidebarOpeners: menuOpenerIds.map(function(id) { return $("#" + id); }) });

	ViewNavigation.init(menuSidebarView, mainViews);

	ViewNavigation.setActiveView("console-view");

	$(".reload").click(function() {
		var view = $(this).prop("activeFeedView");
		view && view.reload();
	});

	$(document).click(function(e) {
		if ($(e.target).hasClass("logJSON")) {
			var jsonView = ViewInstanceManager.getViews("JsonViewerClass")[0];
			if (jsonView) {
				jsonView.clear();
				jsonView.onDataAvailable(null, e.target.textContent);
				ViewNavigation.setActiveView("json-view");
			}
		}
	});

	$(document).keydown(function(e) {
		if (!e.altKey) return;

		switch (e.which) {
			case 49: ViewNavigation.setActiveView("console-view"); break;
			case 50: ViewNavigation.setActiveView("xml-view");	break;
			case 51: ViewNavigation.setActiveView("json-view"); break;
			case 52: ViewNavigation.setActiveView("gallery-view"); break;
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
			var activeView = ViewNavigation.getActiveView();
			if (activeView) activeView.clear();
		} else {
			$(".reload", ViewNavigation.getActiveViewElem()).click();
		}
	});
});

})();
