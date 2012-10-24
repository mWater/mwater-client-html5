/* Sets up a map to display sources */
function SourceMap(elem, apiUrl, mapOptions, sourceClick) {
	var that = this;

	this.updateMarkers = function() {
		this.geoLoadTracker.reset();
		this.mapMarkerManager.updateMarkers();
	}

	this.displayStatus = function(status) {
		if (status)
			$("#status_control").text(status).show();
		else
			$("#status_control").hide();
	}

	this.createMarker = function(source) {
		var color;
		// Determine color
		if (source.samples.length > 0) {
			color = "#D0D0D0";
			var anl = sampleanalysis.getAnalyses(_.last(source.samples));
			if (anl.length > 0)
				color = anl[0].color;
		} else
			color = "D0D0D0";

		icon = {
			path : google.maps.SymbolPath.CIRCLE,
			fillColor : color,
			fillOpacity : 1,
			scale : 6,
			strokeColor : "black",
			strokeWeight : 2
		};

		var marker = new google.maps.Marker({
			position : new google.maps.LatLng(source.latitude, source.longitude),
			icon : icon
		});

		google.maps.event.addListener(marker, 'click', function() {
			sourceClick(source, marker);
		});

		return marker;
	}


	function markerLoader(need, success, error) {
		var max = 100;

		// Query api
		var params = {
			limit : max,
			latitude : need.rect.y1 + "," + need.rect.y2,
			longitude : need.rect.x1 + "," + need.rect.x2,
			samples : 1
		};

		if (need.since)
			params.uid_gt = need.since;

		// Query server for sources
		$.get(apiUrl + "sources", params).success(function(data) {
			var sources = data.sources;

			// Make into marker
			var dict = {}
			_.each(sources, function(s) {
				dict[s.uid] = that.createMarker(s);
			});

			// Determine if completely loaded
			var until;
			if (sources.length >= max)
				until = _.last(sources).uid;
			else
				until = null;

			success(need.rect, until, dict);
		}).error(function() {
			alert("Error getting data");
		});
	}

	function addMarkers() {
		// Add info control
		that.gmap.controls[google.maps.ControlPosition.TOP_CENTER].push($('<div id="status_control" style="display:none;"></div>').get(0));

		that.geoLoadTracker = new GeoLoadTracker();
		that.mapMarkerManager = new MapMarkerManager(that.gmap, that.geoLoadTracker, markerLoader);
		that.mapMarkerManager.addListener(function(event) {
			if (event == "completed")
				that.displayStatus();
			else if (event == "too_many")
				that.displayStatus("Zoom in to see more");
			else if (event == "loading")
				that.displayStatus("Loading...");
		});
	}

	if (!mapOptions) {
		mapOptions = {
			zoom : 11,
			center : new google.maps.LatLng(-2.55, 32.95),
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
	}

	this.gmap = new google.maps.Map(elem, mapOptions);
	addMarkers();
}
