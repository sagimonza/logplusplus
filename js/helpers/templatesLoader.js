
;(function() {

function done() {
	$(document).trigger("templatesReady");
}

var $templates = $('script[type="text/template"][id]'), templateXHRs = 0;
$templates.each(function() {
	var $this = $(this);
	if (!$this.attr("src") && !$this.text()) {
		templateXHRs++;
		$.ajax(
			"js/templates/".concat($this.attr("id"), ".html"),
			{ success: function(data) { $this.text(data); if (--templateXHRs == 0) done(); } }
		);
	}
});

})();