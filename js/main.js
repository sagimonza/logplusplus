;(function() {

window.App = {
	Models:			{},
	Collections:	{},
	Views:			{}
};

$(document).on("templatesReady", function() {
	$(document.body).append('<link href="//fonts.googleapis.com/css?family=Inconsolata:400,700" rel="stylesheet" type="text/css">');
	
	var mainViewObjs =	[
		{	viewClass: "ConsoleLinesClass",
			name: "Console",
			rootId: "console-view",
			headerActions: ["headerFeedTemplate", "headerFiltersTemplate", "headerPauseTemplate", "headerSectionTemplate",
				"headerRefreshTemplate", "headerSectionTemplate", "headerFontTemplate", "headerSectionTemplate", "headerFavTemplate"],
			headerActionsData: {
				filterRegexp: /.log$/
			}
		},
		{	viewClass: "EditorClass",
			name: "Editor",
			rootId: "xml-view",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate", "headerSectionTemplate", "headerReadonlyTemplate"],
			headerActionsData: {
				filterRegexp: /.xml$/
			}
		},
		{	viewClass: "JsonViewerClass",
			name: "JSON Viewer",
			rootId: "json-view",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate"],
			headerActionsData: {
				filterRegexp: /.json$/
			}
		},
		{	viewClass: "GalleryViewerClass",
			name: "Gallery",
			rootId: "gallery-view",
			headerActions: ["headerFeedTemplate", "headerRefreshTemplate"],
			headerActionsData: {
				filterRegexp: /.jpg$|.png$|.gif$/,
				isDataURL: true
			}
		}
	].map(function(headersDef) { return ViewBuilder.build(headersDef); });

	ViewNavigation.init(mainViewObjs, [{ viewType: "DelegateLinkFeedView", name: "Open Feedback..." }], "console-view");

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
