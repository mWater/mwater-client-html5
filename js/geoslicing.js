var geoslicing = geoslicing || {};

(function() {
	// Get slice ids for a location, with slice size of size
	geoslicing.getSlices = function(size, lat, lng) {
		var slices = []

		function wrapLat(x) {
			return ((x + 90 + 360) % 180) - 90;
		}

		function wrapLng(x) {
			return ((x + 180 + 360) % 360) - 180;
		}

		// Round lat and lng
		lat = Math.round(lat / size) * size;
		lng = Math.round(lng / size) * size;

		// Create 4 regions
		var rects = []
		rects.push([wrapLat(lat - size), wrapLat(lat), wrapLng(lng - size), wrapLng(lng)])
		rects.push([wrapLat(lat), wrapLat(lat + size), wrapLng(lng - size), wrapLng(lng)])
		rects.push([wrapLat(lat - size), wrapLat(lat), wrapLng(lng), wrapLng(lng + size)])
		rects.push([wrapLat(lat), wrapLat(lat + size), wrapLng(lng), wrapLng(lng + size)])

		return _.map(rects, function(r) {
			return "source.rect:"+r.join();
		});
	};

})();
