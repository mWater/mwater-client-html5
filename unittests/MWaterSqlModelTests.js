(function () {
    module("MWaterSqlModelTests");       
    var db = window.openDatabase("test", "", "test", 1000000);

    // Create sync database
    var syncDb = new SyncDb(db, MWaterSqlModel.tableDefs);
    
    // Create model
    var model = new MWaterSqlModel(db, syncDb);

    db.transaction(function(tx) {
        model.dropTables(tx);
        model.createTables(tx);
        syncDb.createTables(tx);
        new ModelTests(model);
    });
})();