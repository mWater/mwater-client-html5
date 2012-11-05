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

    var myLocationMarker, locationWatchId;

    function addMyLocation() {
        function geolocationSuccess(pos) {
            if (sourceMap) {
                var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                console.log("Got position: "+pos.coords.latitude+ ","+ pos.coords.longitude)
                myLocationMarker.setPosition(me);
            }
        }

        function geolocationError() {
            // ...
        }

        if (navigator.geolocation && !locationWatchId)
            locationWatchId = navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, {
                maximumAge : 3000,
                enableHighAccuracy : true
            });
    }

    function removeMyLocation() {
        // End location watch
        if (locationWatchId)
            navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
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
                            mapTypeId : google.maps.MapTypeId.ROADMAP
                        }

                        sourceMap = new SourceMap($("#map_canvas").get(0), page.syncServer.baseUrl, mapOptions, sourceClick);

                        if (!center)
                            centerCurrentLocation();

                        myLocationMarker = new google.maps.Marker({
                            clickable : false,
                            icon : new google.maps.MarkerImage('images/my_location.png', new google.maps.Size(22, 22), new google.maps.Point(0, 0), new google.maps.Point(11, 11)),
                            shadow : null,
                            zIndex : 1000000,
                            map : sourceMap.gmap
                        });
                        addMyLocation();
                    }

                });
            });
            callback();
        });
    };

    this.activate = function() {
        if (sourceMap) {
            sourceMap.reset();
            addMyLocation();
        }
    };

    this.deactivate = function() {
        removeMyLocation();
    };

}
