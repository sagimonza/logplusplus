;(function() {

window.Log = {
	Models:			{},
	Collections:	{},
	Views:			{}
};

$(document).ready(function() {

	$(".reload").click(function() {
		var view = $(this).prop("activeFeedView");
		view && view.reload();
	});

	var fileFeedModel = new Log.Models.FileFeedClass();
	new Log.Views.FileFeedClass({
		el: "#logFile",
		model: fileFeedModel,
		$reloadView: $("#reloadConsole"),
		$pickedLogFilename: $("#pickedLogFilename")
	});

	var fileFeedModel2 = new Log.Models.FileFeedClass();
	new Log.Views.FileFeedClass({
		el: "#xmlFile",
		model: fileFeedModel2,
		$reloadView: $("#reloadEditor"),
		$pickedLogFilename: $("#pickedXMLFilename")
	});

	var linkFeedModel = new Log.Models.LinkFeedClass();
	new Log.Views.LinkFeedClass({
		el: "#logLink",
		model: linkFeedModel,
		filterRegexp: /.log$/,
		$reloadView: $("#reloadConsole"),
		$linkOpenerView: $("#consoleLinkOpener"),
		$pickedLogFilename: $("#pickedLogFilename")
	});

	var linkFeedModel2 = new Log.Models.LinkFeedClass();
	new Log.Views.LinkFeedClass({
		el: "#xmlLink",
		model: linkFeedModel2,
		filterRegexp: /.xml$/,
		$reloadView: $("#reloadEditor"),
		$linkOpenerView: $("#xmlLinkOpener"),
		$pickedLogFilename: $("#pickedXMLFilename")
	});

	var linkFeedModel3 = new Log.Models.LinkFeedClass();
	new Log.Views.LinkFeedClass({
		$delegateViews: [$("#logLink"), $("#xmlLink")],
		model: linkFeedModel3,
		$linkOpenerView: $("#feedbackLinkOpener")
	});

	var filtersModel = new Log.Models.LineFilterClass();
	(new Log.Views.LineFilterClass({ model: filtersModel })).render();

	new Log.Views.MenuSidebarClass({ el: "#menu-sidebar", $menuSidebarOpeners: [$("#console-menu-sidebar-opener"), $("#xml-menu-sidebar-opener")] });

	var consoleLines = new Log.Views.ConsoleLinesClass({ dataFeedModels: [fileFeedModel, linkFeedModel], filtersModel: filtersModel });

	var editor = new Log.Views.EditorClass({ dataFeedModels: [fileFeedModel2, linkFeedModel2] });

});

})();
