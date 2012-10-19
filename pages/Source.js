var pages = pages || {}

/* Displays details of a source */
pages.Source = function(uid, setLocation) {
	this.uid = uid;

	var page = this;
	var source;

	var locationWatchId;
	var position;

	this.refresh = function() {
		function displaySource() {
			actionbar.title("Source " + source.code);

			// Display photo
			new PhotoDisplayer(page, page.$("#photo"), source, page.error);

			page.$("#location_set").on("tap", function() {
				setLocation = true;
				displayLocation();
			});

			page.$("#location_map").on("tap", function() {
				if (source.latitude)
					page.pager.loadPage("Map", [{
						latitude : source.latitude,
						longitude : source.longitude
					}]);
			});

			page.$("#add_test_button").on("tap", function() {
				page.pager.loadPage("NewTest", [source.uid]);
			});

			page.$("#add_note_button").on("tap", function() {
				page.pager.loadPage("SourceNote", [source.uid]);
			});

			Pager.makeTappable(page.$("#tests"), function(row) {
				// Get test
				page.model.queryTestByUid(row.id, function(test) {
					page.pager.loadPage("Test_" + test.test_type, [test.uid]);
				}, page.error);
			});
			
			Pager.makeTappable(page.$("#notes"), function(row) {
				page.pager.loadPage("SourceNote", [source.uid, row.id]);
			});
			
			if (!page.auth.canEdit(source)) {
				page.$("#edit_source_button, #location_set").attr("disabled", true);
			}
			
			displayLocation();

			// Fill water analyses
			page.model.querySamplesAndTests(source.uid, function(samples) {
				var view = {
					analyses : []
				}

				_.each(samples, function(sample) {
					_.each(sampleanalysis.getAnalyses(sample), function(anl) {
						anl.sample = sample;
						view.analyses.push(anl);
					});
				});
				page.template("source_analyses", view, $("#analyses"));

				var view = {
					tests : []
				}

				_.each(samples, function(sample) {
					_.each(sample.tests, function(test) {
						test.summary = sampleanalysis.summarizeTest(test);
						view.tests.push(test);
					});
				});
				page.template("source_tests", view, $("#tests"));


			}, page.error);

			// Fill notes
			page.model.querySourceNotes(source.uid, function(notes) {
				var view = {
					notes : notes
				}
				page.template("source_notes", view, $("#notes"));
			}, page.error);
		}


		this.model.querySourceByUid(this.uid, function(src) {
			if (src == null) {
				alert("Source not found");
				page.pager.closePage();
				return;
			}
			source = src;
			page.template("source", source, function(out) {
				page.$el.html(out);
				displaySource();
			});
		}, page.error);
	}

	function displayLocation() {
		if (!source)
			return;

		page.$("#location_map").attr("disabled", !source.latitude);

		// If setting location and position available, set position
		if (setLocation && position) {
			setLocation = false;
			// Set in source
			page.model.transaction(function(tx) {
				page.model.updateRow(tx, source, {
					latitude : position.coords.latitude,
					longitude : position.coords.longitude,
				});
			}, page.error, function() {
				page.refresh();
			});
			return;
		}

		// If setting location, indicate
		if (setLocation)
			page.$("#location").text("Setting location...");
		else if (!source.latitude)// If no position, indicate
			page.$("#location").html('Unspecified location');
		else if (!position)// If waiting for position
			page.$("#location").html('<img src="images/ajax-loader.gif"/>Waiting for GPS');
		else
			page.$("#location").text(utils.getRelativeLocation(position.coords.longitude, position.coords.latitude, source.longitude, source.latitude));
	}


	this.activate = function() {
		this.refresh();

		function geolocationSuccess(pos) {
			position = pos;
			displayLocation();
		}

		function geolocationError(error) {
			//page.$("#location").text("Error finding location");
		}

		// Start location watch
		locationWatchId = navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, {
			maximumAge : 3000,
			enableHighAccuracy : true
		});
	}


	this.deactivate = function() {
		// End location watch
		navigator.geolocation.clearWatch(locationWatchId);
	}


	this.actionbarMenu = [{
		id : "delete",
		title : "Delete",
	}];

	this.actionbarTitle = "Source";

	this.actionbarMenuClick = function(id) {
		if (id == "delete") {
			if (!page.auth.canDelete(source))
				alert("Insufficient permissions");
				
			if (confirm("Permanently delete source?")) {
				page.model.transaction(function(tx) {
					page.model.deleteRow(tx, source);
				}, page.error, function() {
					page.pager.closePage();
				});
			}
		}
	}

}
