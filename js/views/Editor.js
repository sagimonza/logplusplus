;(function() {

Log.Views.EditorClass = Backbone.View.extend({
	initialize: function(options) {
		this.editor = ace.edit("xml");
		this.editor.setTheme("ace/theme/monokai");
		this.editor.getSession().setMode("ace/mode/xml");
		//this.editor.setReadOnly(true);
		this.editor.setPrintMarginColumn(1000);

		this.dataFeedModels = options.dataFeedModels;
		this.dataFeedModels.forEach(function(dataFeedModel) {
			this.listenTo(dataFeedModel, "change:feed", this.clear);
			this.listenTo(dataFeedModel, "dataAvailable", this.onDataAvailable);
		}, this);

		$("#clearEditor").on("click", this.clear.bind(this));
	},

	clear: function() {
		this.editor.setValue("");
	},

	onDataAvailable: function(model, data) {
		var doc = this.editor.getSession().getDocument(), lastRowIndex = Math.max(doc.getLength() - 1, 0);
		doc.insert(doc.indexToPosition(Math.max(doc.getLine(lastRowIndex).length - 1, 0), lastRowIndex), data);
	}
});

})();
