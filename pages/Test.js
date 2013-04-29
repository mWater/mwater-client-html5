var pages = pages || {}

/* Displays details of a test */
pages.Test = function() {
	// Updates results in the row and updates the display
	this.updateResults = function(results) {
		var page = this;

		// Convert to json and save, marking test as read
		var update = {
			results : JSON.stringify(results)
		}

		if (!page.test.read_on)
			update.read_on = Math.floor(new Date().getTime() / 1000);

		page.model.transaction(function(tx) {
			page.model.updateRow(tx, page.test, update);
		}, page.error, function() {
			page.refresh();
		});
	}
	
	this.displayTest = function() {
		var page = this;

		// Display photo
		this.photoDisplayer = new PhotoDisplayer(page, page.$("#photo"), page.test, page.error, page.photoUpdated);

		if (!page.auth.canEdit(page.test)) {
			page.$("#edit_results_button, #record_results_button, #edit_notes_button").attr("disabled", true);
		}

		// Listen for record/edit results
		page.$("#edit_results_button, #record_results_button").on("tap", function() {
			page.$("#display_results").hide();
			page.$("#edit_results").show();
		});

		// Listen for save results
		page.$("#save_results_button").on("tap", function() {
			var results = page.saveResults();
			
			// Allow cancelling
			if (!results)
				return;
			
			page.updateResults(results);
		});

		// Listen for cancel results
		page.$("#cancel_results_button").on("tap", function() {
			page.$("#edit_results").hide();
			page.$("#display_results").show();
		});

		// Display results
		page.displayResults();

		// Listen for edit notes
		page.$("#edit_notes_button").on("tap", function() {
			var notes = prompt("Enter notes", page.test.notes);
			if (notes !== null) {
				page.model.transaction(function(tx) {
					page.model.updateRow(tx, page.test, {
						notes : notes
					});
				}, page.error, function() {
					page.refresh();
				});
			}
		});

	}

	this.photoUpdated = function() {
		// Default does nothing
	}

	this.activate = function() {
		this.refresh();
	}

	this.createTemplateView = function(test) {
		return _.clone(test);
	}

	this.refresh = function() {
		var page = this;

		// Query test
		page.model.queryTestByUid(page.uid, function(t) {
			if (t == null) {
				alert("Test not found");
				page.pager.closePage();
				return;
			}

			// Parse JSON
			if (t.results)
				t.resultsData = JSON.parse(t.results);

			page.test = t;

			page.template("test_" + t.test_type, page.createTemplateView(page.test), function(out) {
				page.$el.html(out);
				page.displayTest();
			});
		}, page.error);
	}


	this.actionbarMenu = [ {
		id : "delete",
		title : "Delete Test",
	}, {
		id : "deletePhoto",
		title : "Delete Photo",
	} ];

	this.actionbarTitle = "Test";

	this.actionbarMenuClick = function(id) {
		var page = this;
		if (id == "delete") {
			if (!page.auth.canDelete(page.test)) {
				alert("Insufficient permissions");
				return;
			}

			if (confirm("Permanently delete test?")) {
				page.model.transaction(function(tx) {
					page.model.deleteRow(tx, page.test);
				}, page.error, function() {
					page.pager.closePage();
				});
			}
		}
		if (id == "deletePhoto") {
			if (!page.test.photo) {
				alert("No photo present");
				return;
			}
			
			if (!page.auth.canEdit(page.test)) {
				alert("Insufficient permissions");
				return;
			}

			if (confirm("Permanently delete photo?")) {
				page.model.transaction(function(tx) {
					page.model.updateRow(tx, page.test, { "photo": null });
				}, page.error, function() {
					page.refresh();
				});
			}
		}
	}

}
