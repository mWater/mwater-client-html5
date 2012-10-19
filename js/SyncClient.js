/* Responsible for synchronizing a SyncDb-enabled database with a server
 * Synchronization is always done by first uploading and then downloading
 * any changes to be applied. All uploads must be completed before any downloads
 * can be applied.
 */

/* syncDb: SyncDb to use
 * syncServer: object with two functions
 * uploadChanges(changes, success(), error())
 * downloadChanges(sliceMap, success(changes), error())
 *
 * sliceMap is map from slice id to "until" value. Determines what to download: everthing after "until"
 */
function SyncClient(syncDb, syncServer) {
    this.syncDb = syncDb;
    this.syncServer = syncServer;
}

/* Synchronize for a client with the specified slices */
SyncClient.prototype.sync = function(slices, success, error) {
    var that = this;

    // First upload changes
    this.upload(function(changes) {
        // Upload completed, record success
        that.syncDb.clearPendingChanges(changes, function() {
            that.download(slices, success, error);
        }, error);
    }, error);
}

/* Downloads any changes. Calls success with parameters:
 * changes: changes that were received. null for none */
SyncClient.prototype.download = function(slices, success, error) {
    var that = this;
 
    // Start download after determining slices needed
    that.syncDb.getSliceUntils(slices, function(sliceMap) {
        that.syncServer.downloadChanges(sliceMap, function(changes) {
            // Now have changes data, apply
            that.applyChanges(changes, slices, success, error);
        }, error);
    }, error);
}

/* Uploads any local changes. Calls success with parameters:
 * changes: changes that were uploaded, or null if none */
SyncClient.prototype.upload = function(success, error) {
    var that = this;
    this.syncDb.getPendingChanges(function(changes) {
        // Check if upload needed
        if (changes != null) {
            that.syncServer.uploadChanges(changes, function() {
                success(changes);
            }, error);
        }
        else {
            success(null);
        }
    }, error);
}

/* Applies changes that have been downloaded */
SyncClient.prototype.applyChanges = function(downloadedChanges, slices, success, error) {
    var that = this;

    // Apply changes, but first call upload and see if upload was needed
    this.upload(function(uploadedChanges) {
        // If upload was needed, try applying changes again, as more
        // may have accumulated
        if (uploadedChanges)
            that.applyChanges(downloadedChanges, slices, success, error);
        else {
            // Apply changes to syncDb
            that.syncDb.applyChanges(downloadedChanges, slices, error, success);
        }
    }, error);
}