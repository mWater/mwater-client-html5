var pages = pages || {}

/* Creates a source */
pages.NewSource = function(location, result) {
	var page = this;

	function createSource() {
		// Get a source code
		page.sourceCodeManager.requestCode(function(code) {
			uid = utils.createUid();

			// Create source
			source = {
				uid : uid,
				code : code,
				name : page.$("#name").val(),
				desc : page.$("#desc").val(),
				source_type : parseInt(page.$("#source_type").val()),
				created_by : page.syncServer.getUsername()
			};
			
			// Add location 
			if (location)
				_.extend(source, location);

			page.model.transaction(function(tx) {
				page.model.insertRow(tx, "sources", source);
			}, page.error, function() {
				if (result)
					result(uid);
				else
					page.pager.closePage("Source", [uid, page.$("#set_location").hasClass("checked")]);
			});

		}, function(error) {
			alert("Unable to generate source id")
		});
	}


	this.create = function(callback) {
		this.template("new_source", {
			sourceTypes : page.model.sourceTypes
		}, function(out) {
			page.$el.html(out);

			// Hide location button if
			if (location)
				page.$("#set_location").hide();

			page.$("#create_button").on("tap", function() {
				if (page.$("#source_type").val() == "")
					alert("Select source type");
				else
					createSource();
			});
			page.$("#cancel_button").on("tap", function() {
				if (result)
					result();
				else
					page.pager.closePage();
			});
			callback();
		});
	};
}