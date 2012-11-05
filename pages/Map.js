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

    function addMyLocation() {
        var myloc = new google.maps.Marker({
            clickable : false,
            icon : new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png', new google.maps.Size(22, 22), new google.maps.Point(0, 18), new google.maps.Point(11, 11)),
            shadow : null,
            zIndex : 999,
            map : sourceMap.gmap
        });

        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(function(pos) {
                var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                myloc.setPosition(me);
            }, function(error) {
                // ...
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
                            mapTypeId : google.maps.MapTypeId.ROADMAP
                        }

                        sourceMap = new SourceMap($("#map_canvas").get(0), page.syncServer.baseUrl, mapOptions, sourceClick);

                        if (!center)
                            centerCurrentLocation();

                        addMyLocation();
                    }

                });
            });
            callback();
        });
    };

    this.activate = function() {
        if (sourceMap)
            sourceMap.reset();
    };
}
