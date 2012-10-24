function GeoLoadTracker() {
	var loads = []

	this.reset = function() {
		loads = [];
	}

	this.getNeeded = function(rect) {
		var best;
		_.each(loads, function(l) {
			// Check if useful
			if (l.rect.contains(rect)) {
				// If complete
				if (!l.until)
					best = null;
				if (best === undefined || (l.until !== null && l.until > best))
					best = l.until;
			}
		});
		if (best)
			return [{
				rect : rect,
				since : best
			}];
		if (best === null)
			return [];
		return [{rect:rect, since: null}];
	}

	// Check if a supercedes b
	function supercedes(a, b) {
		return a.rect.contains(b.rect) && (!a.until || a.until > b.until);
	}

	this.recordLoaded = function(rect, until) {
		var load = { rect: rect, until: until || null };
		
		// Ignore if superceded
		var superceded = _.any(loads, function(l) { return supercedes(l, load) });
		if (superceded)
			return;

		// Remove any contained that are lesser or equal
		loads = _.filter(loads, function (l) {
		  	return !supercedes(load, l);
		});

		// Add new load
		loads.push(load);
	}

}
