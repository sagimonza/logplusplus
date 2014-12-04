;(function() {

window.Log = {
	Models:			{},
	Collections:	{},
	Views:			{}
};

$(document).ready(function() {

	var fileFeedModel = new Log.Models.FileFeedClass();
	new Log.Views.FileFeedClass({ model : fileFeedModel });

	var linkFeedModel = new Log.Models.LinkFeedClass();
	new Log.Views.LinkFeedClass({ model : linkFeedModel });

	var filtersModel = new Log.Models.LineFilterClass();
	(new Log.Views.LineFilterClass({ model : filtersModel })).render();

	var consoleLines = new Log.Views.ConsoleLinesClass({ dataFeedModels : [fileFeedModel, linkFeedModel], filtersModel : filtersModel });

	$("#clear").on("click", consoleLines.clear.bind(consoleLines));
	$("#reload").on("click", consoleLines.clear.bind(consoleLines));
	$("#favorite").on("click", consoleLines.showNextFavorite.bind(consoleLines));
	$(document).keydown(function(e) { if (e.which == 113) consoleLines.showNextFavorite(); });
	$(document).click(function(e) {
		if ($(e.target).hasClass("logFavorite")) consoleLines.toggleFavorite(e);
	});
});

})();
