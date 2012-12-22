var pages = pages || {}

/* Edits a source */
pages.SourceEdit = function(uid) {
	var page = this;

	this.activate = function() {
		page.model.querySourceByUid(uid, function(source) {
			page.template("source_edit", {
				sourceTypes : page.model.sourceTypes
			}, function(out) {
				page.$el.html(out);
				
				page.$("#name").val(source.name);
				page.$("#desc").val(source.desc);
				page.$("#source_type").val(source.source_type);

				page.$("#save_button").on("tap", function() {
					update = {
						name : page.$("#name").val(),
						desc : page.$("#desc").val(),
						source_type : parseInt(page.$("#source_type").val())
					}

					page.model.transaction(function(tx) {
						page.model.updateRow(tx, source, update);
					}, page.error, function() {
						page.pager.closePage();
					});
				});
				page.$("#cancel_button").on("tap", function() {
					page.pager.closePage();
				});
			});
		}, page.error);
	};
}
