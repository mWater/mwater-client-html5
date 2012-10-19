var pages = pages || {}

pages.Map = function(center) {
	var map;
	var geoLoadTracker, mapMarkerManager;
	var page = this;

	function markerLoader(need, success, error) {
		var max = 100;

		function createMarker(source) {
			marker = new google.maps.Marker({
				position : new google.maps.LatLng(source.latitude, source.longitude),
				flat : true,
				icon : "images/marker_0.png"
			});
			google.maps.event.addListener(marker, 'click', function() {
				$("#info_control").text("Loading source...").show();
				
				// Synchronize single source
				slices = ["source.uid:" + source.uid];
				page.syncClient.sync(slices, function() {
					$("#info_control").hide();
					page.pager.loadPage("Source", [source.uid]);
				}, function(error) {
					$("#info_control").hide();
					alert("Unable to connect to server");
				});
			});
			return marker;
		}

		// Query api
		var params = {
			limit : max,
			latitude : need.rect.y1 + "," + need.rect.y2,
			longitude : need.rect.x1 + "," + need.rect.x2,
		};

		if (need.since)
			params.uid_gt = need.since;

		// Query server for sources
		$.get(page.syncServer.baseUrl + "sources", params).success(function(data) {
			var sources = data.sources;

			// Make into marker
			var dict = {}
			_.each(sources, function(s) {
				dict[s.uid] = createMarker(s);
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

		/*// Query sources
		 page.model.queryLatLngSources(need.rect, need.since, max, function(rows) {
		 var ms = {};
		 _.each(rows, function(r) {
		 var marker = new google.maps.Marker({
		 position : new google.maps.LatLng(r.latitude, r.longitude),
		 flat : true,
		 icon : "images/marker_0.png"
		 });
		 google.maps.event.addListener(marker, 'click', function() {
		 page.pager.loadPage("Source", [r.uid]);
		 });
		 ms[r.uid] = marker;
		 });

		 success(need.rect, (rows.length > 0 && rows.length < max) ? _.last(rows).uid : null, ms);
		 }, page.error);*/
	}

	function addMarkers() {
		// Add info control
		map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push($('<div id="info_control" style="display:none"></div>').get(0));

		geoLoadTracker = new GeoLoadTracker();
		mapMarkerManager = new MapMarkerManager(map, geoLoadTracker, markerLoader);
		mapMarkerManager.addListener(function(event) {
			if (event == "completed")
				$("#info_control").hide();
			else if (event == "too_many")
				$("#info_control").text("Zoom in to see more").show();
			else if (event == "loading")
				$("#info_control").text("Loading...").show();
			});
	}

	function centerCurrentLocation() {
		navigator.geolocation.getCurrentPosition(function(position) {
			map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
		});
	}


	this.create = function(callback) {
		this.template("map", null, function(out) {
			page.$el.html(out);

			$.getScript("https://www.google.com/jsapi").done(function() {
				google.load("maps", 3, {
					"other_params" : "sensor=true",
					"callback" : function() {
						var mapOptions = {
							zoom : 13,
							center : center ? new google.maps.LatLng(center.latitude, center.longitude) : undefined,
							mapTypeId : google.maps.MapTypeId.HYBRID
						}
						map = new google.maps.Map(page.$("#map_canvas").get(0), mapOptions);
						
						addMarkers();
						if (!center)
							centerCurrentLocation();
					}

				});
			});
			callback();
		});
	}

}
