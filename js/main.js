;(function() {

window.Log = {
	Models:			{},
	Collections:	{},
	Views:			{}
};

$(document).ready(function() {

	var dataFeedModel = new Log.Models.FileFeedClass();
	new Log.Views.FileFeedClass({ model : dataFeedModel });

	var filtersModel = new Log.Models.LineFilterClass();
	(new Log.Views.LineFilterClass({ model : filtersModel })).render();

	var consoleLines = new Log.Views.ConsoleLinesClass({ collection : new Log.Collections.ConsoleLinesClass(), dataFeedModel : dataFeedModel, filtersModel : filtersModel });

	$("#clear").on("click", consoleLines.clear.bind(consoleLines));
	$("#reload").on("click", consoleLines.clear.bind(consoleLines));
	$("#favorite").on("click", consoleLines.showNextFavorite.bind(consoleLines));
	$(document).keydown(function(e) { if (e.which == 113) consoleLines.showNextFavorite(); });
	$(document).click(function(e) {
		if ($(e.target).hasClass("logFavorite")) consoleLines.toggleFavorite(e);
	});
});

})();
