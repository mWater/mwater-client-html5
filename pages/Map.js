var pages = pages || {}

pages.Map = function(center) {
    var map;
    var sourceMap;
    var page = this;

    function sourceClick(source, marker) {
        // Synchronize single source
        if (page.syncClient) {
            sourceMap.displayStatus("Loading source...");

            slices = ["source.uid:" + source.uid];
            page.syncClient.sync(slices, function() {
                sourceMap.displayStatus();
                page.pager.loadPage("Source", [source.uid]);
            }, function(error) {
                sourceMap.displayStatus();
                alert("Unable to connect to server");
            });
        } else
            page.pager.loadPage("Source", [source.uid]);
    }

    function centerCurrentLocation() {
        navigator.geolocation.getCurrentPosition(function(position) {
            sourceMap.gmap.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
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

                        sourceMap = new SourceMap($("#map_canvas").get(0), page.syncServer.baseUrl, mapOptions, sourceClick);

                        if (!center)
                            centerCurrentLocation();
                    }

                });
            });
            callback();
        });
    }

}
