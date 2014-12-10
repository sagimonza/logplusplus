;(function() {

Log.Views.MenuSidebarClass = Backbone.View.extend({
	events : {
		"click .sidebar-menu-item": "onItemSelected",
		"click #globalFeedback": "openGlobalFeedback"
	},

	initialize: function(options) {
		$("#shield").click(this.hide.bind(this));
		options.$menuSidebarOpeners.forEach(function($menuSidebarOpener)  {
			$menuSidebarOpener.sidr({
				name: "menu-sidebar",
				displace: false,
				onOpen: this.onShow.bind(this)
			});
		}, this);
	},

	hide: function() {
		$.sidr("close", "menu-sidebar");
		$("#shield").hide();
	},

	onShow: function() {
		$("#shield").show();
	},

	onItemSelected: function(e) {
		this.setActive($(e.currentTarget).data("content-id"));
		this.hide();
	},

	setActive: function(id) {
		$(".sidebar-menu-item").removeClass("active");
		$("[data-content-id='" + id + "']").addClass("active");
		$(".main").attr("active", id);
	},

	getActive: function() {
		return $(".main").attr("active");
	},

	openGlobalFeedback: function() {
		this.hide();
	}
});

})();
