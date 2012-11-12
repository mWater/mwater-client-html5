(function() {
    module("SyncClientServer");

    // Simple failure function
    function fail(error) {
        ok(false, "sql error: " + error.message);
        start();
    }

    var serverUrl = "/mwater/apiv2/";

    // Create sync server
    var syncServer = new SyncServer(serverUrl);
    
    asyncTest("add source", function() {
        // Add source
        var uid = utils.createUid();
        
        var cs = { tables: []};
        
        var table = { name: "sources",
            upserts: { cols: ['uid', 'code'], rows: [[uid, 'test']]}
        };
        cs.tables.push(table);

        syncServer.uploadChanges(cs, function() {
            ok(true);
            start();
        }, fail);
    });
    
    asyncTest("add source extra field", function() {
        // Add source
        var uid = utils.createUid();
        
        var cs = { tables: []};
        
        var table = { name: "sources",
            upserts: { cols: ['uid', 'code', 'xyz'], rows: [[uid, 'test', 'abc']]}
        };
        cs.tables.push(table);

        syncServer.uploadChanges(cs, function() {
            ok(true);
            start();
        }, fail);
    });
})(); 