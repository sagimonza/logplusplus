
;(function() {

window.ViewNavigation = {
	init: function(mainViewObjs, sidebarActionObjs, activeViewId) {
		this._navView = new App.Views.MenuSidebarClass({ el: "#menu-sidebar", mainViewObjs: mainViewObjs, sidebarActionObjs: sidebarActionObjs });
		this._mainViews = mainViewObjs.map(function(mainViewObj) { return mainViewObj.view; });
		this.setActiveView(activeViewId);
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