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

});

})();
