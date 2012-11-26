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
                "rows" : sources.length > 0 ? sources : null,
            }, page.$("#table"));
        }

        // Get location
        function locationSuccess(position) {
            // If lower accuracy, discard
            if (page.location && page.location.coords.accuracy < position.coords.accuracy)
                return;

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
            alert("Unable to determine location. Location is needed to display list of nearby sources.");
            page.pager.closePage();
        }

        if (!page.location) {
            // Set status
            page.$("#message_text").text("Obtaining location...");
            page.$("#message_bar").show();
            
            // Both have to fail to trigger close
            var locationError2 = _.after(2, locationError);
            
            // Get both high and low accuracy, as low is sufficient for initial display
            navigator.geolocation.getCurrentPosition(locationSuccess, locationError2, {
                maximumAge : 3600,
                timeout : 10000,
                enableHighAccuracy : false
            });

            navigator.geolocation.getCurrentPosition(locationSuccess, locationError2, {
                maximumAge : 3600,
                timeout : 30000,
                enableHighAccuracy : true
            });
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

