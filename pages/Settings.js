var pages = pages || {}

/* Settings page of application */
pages.Settings = function() {
    var page = this;

    function refresh(callback) {
        var view = {
            offlineSourceCodes : page.sourceCodeManager.getNumberAvailableCodes(),
            username: page.syncServer.getUsername(),
            appVersion : page.appVersion,
            cordova: cordova.exec !== undefined
        };

        page.template("settings", view, function(out) {
            page.$el.html(out);

            page.$("#auto_sync").toggleClass("checked", localStorage.getItem("autoSync") != "false");
            page.$("#auto_sync").on("checked", function() {
                localStorage.setItem("autoSync", page.$("#auto_sync").hasClass("checked") ? "true" : "false");
            });

            page.$("#request_source_codes").on("tap", function() {
                page.sourceCodeManager.replenishCodes(view.offlineSourceCodes + 5, function() {
                    refresh();
                }, function() {
                    alert("Unable to contact server");
                });
            });

            if (!(page.model instanceof MWaterSqlModel))
                page.$(".local_db_block").hide();

            page.$("#reset_database").on("tap", function() {
                if (confirm("Completely reset local database?"))
                    page.model.reset(function() {
                        alert("Reset complete");
                    }, page.error);
            });
            
            page.$("#test_ecplates").on("tap", function() {
            	// Get camera image
            	navigator.camera.getPicture(function(imgPath) {
                    cordova.exec(
             		   function(args) {
 							alert(JSON.stringify(args));
 						}, function(args) {
 							alert("error: " + args);
 						}, 'OpenCVActivity', 'launch', [ "ec-plate", [ imgPath ],
 								"EC Compact Dry Plate Counter" ]);
            	}, function(message) {
            		alert("Error getting picture: " + message);
            	}, {
          		    destinationType: Camera.DestinationType.FILE_URI 
            	});
            });

            if (callback)
                callback();
        });

    }

    this.create = refresh;
};
