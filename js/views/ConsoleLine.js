;(function() {

window.ConsoleLineView = function(lineModel) {
	var view = document.createElement("div");
	var hidden = lineModel.hidden ? "hidden" : "";
	view.setAttribute("type", lineModel.type);
	view.setAttribute("severity", lineModel.severity);
	view.setAttribute("class", "logLine ".concat(lineModel.severity, " ", hidden));

	var filters = lineModel.filters, filterLen = filters.length;
	for (var i = 0; i < filterLen; ++i) view.setAttribute("filter" + i, filters[i]);

	var fav = document.createElement("span");
	fav.setAttribute("class", "logFavorite fa fa-star-o");
	view.appendChild(fav);

	if (lineModel.message) {
		var message = lineModel.message, messageLen = message.length;
		for (var  j = 0; j < messageLen; ++j) {
			switch (message[j][0]) {
				case "json":
					var jsonElem = document.createElement("a");
					jsonElem.classList.add("logJSON");
					jsonElem.textContent = message[j][1];
					view.appendChild(jsonElem);
					break;
				case "text": // fall through
				default:
					view.appendChild(document.createTextNode(message[j][1]));
			}
		}
	} else view.appendChild(document.createTextNode(lineModel.text));

	view.el = view;
	view.render = function() { return this; };
	view.hide = function() { this.classList.add("hidden"); };
	view.show = function() { this.classList.remove("hidden"); };
	view.getHeight = function() { return $(this).height(); };
	view.onFavoriteChange = function() {
		$(".logFavorite", this).toggleClass("fa-star-o");
		$(".logFavorite", this).toggleClass("fa-star");
	};
	view.onHiddenChange = function(newHidden) {
		if (newHidden) this.hide();
		else this.show();
	};

	view.__model = lineModel;

	return view;
};

})();
