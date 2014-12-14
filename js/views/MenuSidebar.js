;(function() {

App.Views.MenuSidebarClass = Backbone.View.extend({
	events : {
		"click .sidebar-content-menu-item": "onItemSelected"
	},

	initialize: function(options) {
		$("#shield").click(this.hide.bind(this));
		this.template = _.template($("#menuSidebarTemplate").html(), { variable : "args" });
		this.$el.html(this.template({
			contentObjs: options.mainViewObjs.map(function(mainViewObj) { return { rootId: mainViewObj.ids.rootId, name: mainViewObj.view.name } })
		}));

		options.mainViewObjs.forEach(function(mainViewObj) {
			$("#" + mainViewObj.ids.sidebarOpenerId).sidr({
				name: "menu-sidebar",
				displace: false,
				onOpen: this.onShow.bind(this)
			});
		}, this);

		var $this = this;
		options.sidebarActionObjs.forEach(function(sidebarActionObj) {
			sidebarActionObj.createHTML = function(ids) {
				var actionHTML = (_.template($("#menuSidebarActionTemplate").html(), { variable : "args" }))({ actionId: ids.mainId, name: sidebarActionObj.name });
				$("ul", $this.$el).append(actionHTML);
			};

			var viewObj = ViewBuilder.createView(sidebarActionObj);
			$("#" + viewObj.ids.mainId).click(this.hide.bind(this));
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
		$(".sidebar-content-menu-item").removeClass("active");
		$("[data-content-id='" + id + "']").addClass("active");
		$(".main").attr("active", id);
	},

	getActive: function() {
		return $(".main").attr("active");
	}
});

})();
