/*
 * Keeps track of markers that have been displayed on a map, determining which
 * need to be loaded, loading them, and adding them to the map.
 *
 * Also, hide/show markers as appropriate in order to optimize the speed of display.
 *
 * map: Google maps object
 *
 * geoLoadTracker: GeoLoadTracker object to store which regions have been loaded
 *
 * markerLoader: function(need, function successLoadingMarkers(rect, until, ms), function errorLoadingMarkers(error))
 * 	rect: rectagle that was loaded
 * 	until: null if fully loaded, or last uid loaded if partially loaded.
 * 	need: See GeoLoadTracker.getNeeded result.
 * 	ms: dict of markers by uid.
 */
function MapMarkerManager(map, geoLoadTracker, markerLoader) {
    var markers = {}
    var markerKeys = []
    var maxVisible = 300;
    var loading = 0;

    google.maps.event.addListener(map, 'idle', updateMarkers);

    var listeners = []
    function fireEvent(event) {
        _.each(listeners, function(e) {
            e(event);
        });
    }

    this.addListener = function(listener) {
        listeners.push(listener);
    };

    this.removeListener = function(listener) {
        listeners = _.without(listeners, listener);
    };

    // Remove all markers
    this.reset = function() {
        for ( i = 0; i < markerKeys.length; i++) {
            // Get marker
            var k = markerKeys[i];
            var m = markers[k];
            m.setMap(null);
        }
        markers = {}
        markerKeys = []
    };

    this.updateMarkers = updateMarkers;

    function extendBounds(bounds, extra) {
        var span = bounds.toSpan();

        var x1 = bounds.getSouthWest().lng();
        var y1 = bounds.getSouthWest().lat();
        var x2 = bounds.getNorthEast().lng();
        var y2 = bounds.getNorthEast().lat();

        x1 += (x1 - x2) * extra;
        y1 += (y1 - y2) * extra;
        x2 += (x2 - x1) * extra;
        y2 += (y2 - y1) * extra;

        return new google.maps.LatLngBounds(new google.maps.LatLng(y1, x1), new google.maps.LatLng(y2, x2))
    }

    function updateMarkers() {
        var bounds = map.getBounds();
        if (bounds == null)
            return;

        bounds = extendBounds(bounds, 0.2);
        var visibleCount = 0;
        var visibleUntil, i;

        for ( i = 0; i < markerKeys.length; i++) {
            // Get marker
            var k = markerKeys[i];
            var m = markers[k];

            // Determine if in bounds
            var inBounds = bounds.contains(m.getPosition());

            if (inBounds && m.getMap() == null && visibleCount < maxVisible)
                m.setMap(map);
            else if ((!inBounds || visibleCount >= maxVisible) && m.getMap() != null)
                m.setMap(null);
            if (inBounds) {
                if (visibleCount < maxVisible)
                    visibleUntil = k;
                visibleCount++;
            }
        }

        // Get needed to load
        var rect = new utils.Rect(bounds.getSouthWest().lng(), bounds.getSouthWest().lat(), bounds.getNorthEast().lng(), bounds.getNorthEast().lat());
        var needed = geoLoadTracker.getNeeded(rect);

        // If nothing to load, display completed or too_many
        if (needed.length == 0) {
            if (visibleCount > maxVisible)
                fireEvent("too_many");
            else
                fireEvent("completed");
            return;
        }

        // If needed starts *after* visibleUntil, and we're at max displayable,
        // then we already have more data than we can display
        haveEnough = _.all(needed, function(n) {
            return (visibleUntil !== undefined) && n.since != null && n.since > visibleUntil;
        });
        haveEnough &= visibleCount >= maxVisible;

        if (haveEnough) {
            fireEvent("too_many");
            return;
        }

        if (loading > 0) {
            fireEvent("loading");
            return;
        }

        _.each(needed, function(need) {
            loading++;
            markerLoader(need, successLoadingMarkers, errorLoadingMarkers);
        });
    }

    function successLoadingMarkers(rect, until, ms) {
        loading--;

        geoLoadTracker.recordLoaded(rect, until);

        // Add markers
        _.each(ms, function(value, key) {
            if (!markers[key]) {
                markers[key] = value;
            }
        });

        markerKeys = _.keys(markers).sort();

        updateMarkers()
    }

    function errorLoadingMarkers(error) {
        loading--;
    }

}
