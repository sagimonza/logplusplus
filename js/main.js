;(function() {

window.Log = {
	Models:			{},
	Collections:	{},
	Views:			{}
};

$(document).ready(function() {

	var menuSidebarView = new Log.Views.MenuSidebarClass({ el: "#menu-sidebar",
		$menuSidebarOpeners: [$("#console-menu-sidebar-opener"), $("#xml-menu-sidebar-opener"), $("#json-menu-sidebar-opener"), $("#gallery-menu-sidebar-opener")] });

	var fileFeeds = {
		console: { elem: "#logFile", $reload: $("#reloadConsole"), $filename: $("#pickedLogFilename") },
		xml: { elem: "#xmlFile", $reload: $("#reloadEditor"), $filename: $("#pickedXMLFilename") },
		json: { elem: "#jsonFile", $reload: $("#reloadJSON"), $filename: $("#pickedJSONFilename") },
		gallery: { elem: "#galleryFile", $reload: $("#reloadGallery"), $filename: $("#pickedGalleryFilename"), isDataURL: true }
	};

	Object.keys(fileFeeds).forEach(function(feedKey) {
		var feedObj = fileFeeds[feedKey];
		feedObj.model = new Log.Models.FileFeedClass({ isDataURL: feedObj.isDataURL });
		new Log.Views.FileFeedClass({ el: feedObj.elem, model: feedObj.model, $reloadView: feedObj.$reload, $pickedFilename: feedObj.$filename });
	});

	var linkFeeds = {
		console: { elem: "#logLink", $reload: $("#reloadConsole"), regexp: /.log$/, $link: $("#consoleLinkOpener"), $filename: $("#pickedLogFilename") },
		xml: { elem: "#xmlLink", $reload: $("#reloadEditor"), regexp: /.xml$/, $link: $("#xmlLinkOpener"), $filename: $("#pickedXMLFilename") },
		json: { elem: "#jsonLink", $reload: $("#reloadJSON"), regexp: /.json$/, $link: $("#jsonLinkOpener"), $filename: $("#pickedJSONFilename") },
		gallery: { elem: "#galleryLink", $reload: $("#reloadGallery"), regexp: /.jpg$|.png$|.gif$/, $link: $("#galleryLinkOpener"), $filename: $("#pickedGalleryFilename"), isDataURL: true },
		feedback: { $delegate: [$("#logLink"), $("#xmlLink"), $("#galleryLink")], $link: $("#feedbackLinkOpener") }
	};

	Object.keys(linkFeeds).forEach(function(feedKey) {
		var feedObj = linkFeeds[feedKey];
		feedObj.model = new Log.Models.LinkFeedClass({ isDataURL: feedObj.isDataURL });
		new Log.Views.LinkFeedClass({ el: feedObj.elem, $delegateViews: feedObj.$delegate, model: feedObj.model,
			filterRegexp: feedObj.regexp, $reloadView: feedObj.$reload,	$linkOpenerView: feedObj.$link, $pickedFilename: feedObj.$filename });
	});

	var filtersModel = new Log.Models.LineFilterClass();
	(new Log.Views.LineFilterClass({ model: filtersModel })).render();

	var consoleLines = new Log.Views.ConsoleLinesClass({ dataFeedModels: [fileFeeds.console.model, linkFeeds.console.model], filtersModel: filtersModel, menuSidebarView: menuSidebarView });
	var editor = new Log.Views.EditorClass({ dataFeedModels: [fileFeeds.xml.model, linkFeeds.xml.model] });
	var jsonViewer = new Log.Views.jsonViewerClass({ dataFeedModels: [fileFeeds.json.model, linkFeeds.json.model] });
	var galleryViewer = new Log.Views.galleryViewerClass({ dataFeedModels: [fileFeeds.gallery.model, linkFeeds.gallery.model] });

	$(".reload").click(function() {
		var view = $(this).prop("activeFeedView");
		view && view.reload();
	});

	$(document).click(function(e) {
		if ($(e.target).hasClass("logJSON")) {
			jsonViewer.clear();
			jsonViewer.onDataAvailable(null, e.target.textContent);
			menuSidebarView.setActive("json-view");
		}
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
				var $favorite = $(".logFavorite", innerHovered.get(0));
				if ($favorite.length == 1) $favorite.click();
				break;
			default: return;
		}

		e.preventDefault();
		e.stopImmediatePropagation();
	});

	$(document).keydown(function(e) {
		if (!e.ctrlKey) return;

		var method;
		switch (e.which) {
			case 67: // fall through
			case 99: method = "clear"; break;
			case 82: // fall through
			case 114: method = "reload"; break;
		}

		if (!method) return;

		e.preventDefault();

		var el = $("#" + $(".main").attr("active")).get(0);
		if (method == "clear") {
			if ($.contains(el, consoleLines.el)) consoleLines.clear();
			if ($.contains(el, editor.el)) editor.clear();
			if ($.contains(el, jsonViewer.el)) jsonViewer.clear();
			if ($.contains(el, galleryViewer.el)) galleryViewer.clear();
		} else {
			$(".reload", el).click();
		}

	});

});

})();
