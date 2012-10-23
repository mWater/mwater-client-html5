(function() {
	module("MWaterSqlModelTests");
	var db = window.openDatabase("test", "", "test", 1000000);

	// Create sync database
	var syncDb = new SyncDb(db, MWaterSqlModel.tableDefs);

	// Create model
	var model = new MWaterSqlModel(db, syncDb);

	function reset(success) {
		db.transaction(function(tx) {
			model.dropTables(tx);
			model.createTables(tx);
		}, function(error) {
			ok(false);
		}, success);
	}

	db.transaction(function(tx) {
		model.dropTables(tx);
		model.createTables(tx);
		syncDb.createTables(tx);
		new ModelTests(model, reset);
	}, function(error) {
		ok(false);
	});
})();
