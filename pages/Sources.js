var pages = pages || {}

/* Displays a list of nearby sources */
pages.Sources = function() {
	var page = this;

	this.create = function(callback) {
		this.template("sources", null, function(out) {
			page.$el.html(out);

			Pager.makeTappable(page.$("#table"), function(row) {
				page.pager.loadPage("Source", [row.id]);
			});
			callback();
		});
	};

	this.activate = function() {
		this.refresh("");
	};

	this.refresh = function(query) {
		function displaySources(sources) {
			page.$("#message_bar").hide();
			page.template("sources_rows", {
				"rows" : sources
			}, page.$("#table"));
		}

		// Get location
		function locationSuccess(position) {
			page.location = position;

			// Query sources
			page.model.queryNearbySources(position.coords.latitude, position.coords.longitude, query, function(rows) {
				// Add unlocated sources to bottom
				if (page.syncServer.loggedIn()) {
					page.model.queryUnlocatedSources(page.syncServer.getUsername(), query, function(rows2) {
						displaySources(rows.concat(rows2));
					}, page.error);
				} else
					displaySources(rows);
			}, page.error);
		}

		function locationError(position) {
			alert("Unable to determine location");
		}

		if (!page.location) {
			// Set status
			page.$("#message_text").text("Obtaining location...");
			page.$("#message_bar").show();
			navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
		} else
			locationSuccess(page.location);
	};

	this.actionbarMenu = [{
		id : "new",
		title : "New",
		icon : "images/new.png",
		ifRoom : true
	}, {
		id : "search",
		title : "Search",
		icon : "images/search.png",
		ifRoom : true
	}];

	this.actionbarTitle = "Sources";

	this.actionbarMenuClick = function(id) {
		if (id == "search")
			this.refresh(prompt("Search for:"));
		else if (id == "new") {
			if (!page.auth.canAdd("sources")) {
				alert("Insufficient permissions");
			} else
				page.pager.loadPage("NewSource");
		} else
			alert(id);
	}

}

