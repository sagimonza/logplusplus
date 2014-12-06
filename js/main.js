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

	var logFileFeedModel = new Log.Models.FileFeedClass();
	new Log.Views.FileFeedClass({
		el: "#logFile",
		model: logFileFeedModel,
		$reloadView: $("#reloadConsole"),
		$pickedLogFilename: $("#pickedLogFilename")
	});

	var xmlFileFeedModel = new Log.Models.FileFeedClass();
	new Log.Views.FileFeedClass({
		el: "#xmlFile",
		model: xmlFileFeedModel,
		$reloadView: $("#reloadEditor"),
		$pickedLogFilename: $("#pickedXMLFilename")
	});

	var logLinkFeedModel = new Log.Models.LinkFeedClass();
	new Log.Views.LinkFeedClass({
		el: "#logLink",
		model: logLinkFeedModel,
		filterRegexp: /.log$/,
		$reloadView: $("#reloadConsole"),
		$linkOpenerView: $("#consoleLinkOpener"),
		$pickedLogFilename: $("#pickedLogFilename")
	});

	var xmlLinkFeedModel = new Log.Models.LinkFeedClass();
	new Log.Views.LinkFeedClass({
		el: "#xmlLink",
		model: xmlLinkFeedModel,
		filterRegexp: /.xml$/,
		$reloadView: $("#reloadEditor"),
		$linkOpenerView: $("#xmlLinkOpener"),
		$pickedLogFilename: $("#pickedXMLFilename")
	});

	var feedbackLinkFeedModel = new Log.Models.LinkFeedClass();
	new Log.Views.LinkFeedClass({
		$delegateViews: [$("#logLink"), $("#xmlLink")],
		model: feedbackLinkFeedModel,
		$linkOpenerView: $("#feedbackLinkOpener")
	});

	var filtersModel = new Log.Models.LineFilterClass();
	(new Log.Views.LineFilterClass({ model: filtersModel })).render();

	new Log.Views.MenuSidebarClass({ el: "#menu-sidebar", $menuSidebarOpeners: [$("#console-menu-sidebar-opener"), $("#xml-menu-sidebar-opener")] });

	var consoleLines = new Log.Views.ConsoleLinesClass({ dataFeedModels: [logFileFeedModel, logLinkFeedModel], filtersModel: filtersModel });

	var editor = new Log.Views.EditorClass({ dataFeedModels: [xmlFileFeedModel, xmlLinkFeedModel] });

});

})();
