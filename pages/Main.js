var pages = pages || {}

/* Main page of application */
pages.Main = function() {
    var page = this;

    this.create = function(callback) {
        this.template("main", null, function(out) {
            page.$el.html(out);
            page.$("#sources").on("tap", function() {
                page.pager.loadPage("Sources");
            });
            page.$("#map").on("tap", function() {
                page.pager.loadPage("Map");
            });
            page.$("#tests").on("tap", function() {
                page.pager.loadPage("Tests");
            });
            page.$("#settings").on("tap", function() {
                page.pager.loadPage("Settings");
            });
            page.$("#sync_cancel").on("tap", function() {
                syncCancel = true;
                page.$("#sync_cancel").attr("disabled", true);
            });

            callback();
        });
    };

    this.activate = function() {
        // If auto sync
        if (localStorage.getItem("autoSync") != "false")
            synchronize();
    };

    this.actionbarMenu = [{
        id : "sync",
        title : "Sync",
        icon : "images/sync.png",
        ifRoom : true
    }, {
        id : "logout",
        title : "Logout"
    }];

    this.actionbarTitle = "mWater";

    var syncInProgress = false;
    var syncCancel = false;

    function syncSuccess() {
        syncInProgress = false;

        page.$("#sync_error").hide();
        page.$("#sync_progress").hide();
        page.$("#sync_success").show().delay(2000).slideUp();
    }

    function syncError(msg, error) {
        syncInProgress = false;

        console.warn("SyncError:" + JSON.stringify(error || 'Unknown') + ":" + msg);

        page.$("#sync_progress").hide();
        page.$("#sync_success").hide();
        page.$("#sync_error").text("Unable to synchronize: " + msg).show().delay(5000).slideUp();
    }

    function uploadImages() {
        // Now upload images
        if (syncCancel) {
            syncError("Cancelled");
            return;
        }

        // If no image upload, go to success
        if (!page.imageManager.uploadImages) {
            syncSuccess();
            return;
        }

        page.imageManager.uploadImages(function(remaining, percentage) {
            page.$("#sync_progress_message").text("Uploading images. " + remaining + " remaining.");
        }, function(remaining) {
            if (remaining > 0)
                uploadImages();
            else
                syncSuccess();
        }, function(error) {
            syncError("Error connecting to server", error.http_status);
        });
    }

    function syncLocationSuccess(position) {
        // Determine which slices to get based on location
        slices = geoslicing.getSlices(1, position.coords.latitude, position.coords.longitude);

        // Always get own sources
        slices.push("source.created_by:" + page.syncServer.getUsername());

        page.syncClient.sync(slices, uploadImages, function(error) {
            syncError("Error connecting to server", error);
        });
    }

    function synchronize() {
        if (!page.syncClient)
            return;

        if (syncInProgress)
            return;

        syncInProgress = true;
        syncCancel = false;

        page.$("#sync_cancel").attr("disabled", false);
        page.$("#sync_progress").show();
        page.$("#sync_error").hide();
        page.$("#sync_success").hide();

        // Replenish source codes first
        page.sourceCodeManager.replenishCodes(5, function() {
            // Sync based on location
            navigator.geolocation.getCurrentPosition(syncLocationSuccess, function(error) {
                syncError("Unable to get location", error);
            });
        }, function(error) {
            syncError("Error connecting to server", error);
        });
    }


    this.actionbarMenuClick = function(id) {
        // Handle sync event
        if (id == "sync") {
            synchronize();
        } else if (id == "logout") {
            function gotoLoginPage() {
                // Close and go to login page
                page.pager.closePage("Login");
            }

            // Always allow logout
            this.syncServer.logout(gotoLoginPage, gotoLoginPage);
        } else
            alert(id);
    };
};
