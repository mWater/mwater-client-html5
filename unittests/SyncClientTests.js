(function () {
    module("SyncClient");

    // Simple failure function
    function fail(error) {
        ok(false, "sql error: " + error.message);
        start();
    }

    asyncTest("simple upload", function() {
        var slices = ["slice1", "slice2"];
        
        var uploadCount = 0;
        
        var syncServer = {
            uploadChanges: function(changes, success, fail) {
                equal(changes.test, "test");
                equal(changes.until, 5);
                uploadCount++;
                success(changes);
            },
            downloadChanges: function(sliceMap, success, fail) {
                ok(_.isEqual(sliceMap, { slice1: 1, slice2: 2}));
                success({test:"download", until:99});
            }
        }
        
        var i = 0;
        
        var syncDb = {
            getPendingChanges: function(success, fail) {
                if (i<3) {
                    i++;
                    success({test:"test", until:5});
                }
                else
                    success(null);
            },
            clearPendingChanges: function(changes, success, fail) {
                if (changes)
                    equal(changes.until, 5);
                else
                    equal(changes, null);
                success();
            },
            getSliceUntils: function(slices, success, fail) {
                equal(slices.length, 2);
                success({ slice1: 1, slice2: 2});
            },
            applyChanges: function(changes, slices, fail, success) {
                equal(changes.test, "download");
                equal(changes.until, 99);
                equal(slices.length, 2);
                success();
            }
        }
        
        var syncClient = new SyncClient(syncDb, syncServer);
        syncClient.sync(slices, function() {
            equal(uploadCount, 3);
            start();
        }, fail);
    });
    
    asyncTest("null download, null upload", function() {
        var slices = ["slice1", "slice2"];
        
        var syncServer = {
            uploadChanges: function(changes, success, fail) {
                ok(false);
                success(changes);
            },
            downloadChanges: function(sliceMap, success, fail) {
                success(null);
            }
        } 
        
        var syncDb = {
            getPendingChanges: function(success, fail) {
                success(null);
            },
            clearPendingChanges: function(changes, success, fail) {
                equal(changes, null);
                success();
            },
            getSliceUntils: function(slices, success, fail) {
                equal(slices.length, 2);
                success({ slice1: 1, slice2: 2});
            },
            applyChanges: function(changes, slices, fail, success) {
                equal(changes, null);
                success();
            }
        }
        
        var syncClient = new SyncClient(syncDb, syncServer);
        syncClient.sync(slices, function() {
            start();
        }, fail);
    });
})();