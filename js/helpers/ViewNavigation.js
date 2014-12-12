
;(function() {

window.ViewNavigation = {
	init: function(navView, mainViews) {
		this._navView = navView;
		this._mainViews = mainViews;
	},

	getActiveView: function() {
		var el = this.getActiveViewElem(), activeView;
		this._mainViews.some(function(view) {
			if ($.contains(el, view.el)) return activeView = view; });
		return activeView;
	},

	setActiveView: function(id) {
		this._navView.setActive(id);
	},

	isActiveView: function(view) {
		return view == this.getActiveView();
	},

	getActiveViewElem: function() {
		return $("#" + this._navView.getActive()).get(0);
	}
};

})();