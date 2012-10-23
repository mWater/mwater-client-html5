function ModelTests(model, resetTests) {
	// Simple failure function
	function error(err) {
		ok(false, "model error: " + err.message);
		start();
	}

	asyncTest("Insert source and query unlocated not nearby", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "sources", {
					uid : "uid1",
					code : "code1",
					created_by : "test"
				});
			}, error, function() {
				model.queryNearbySources(0, 0, "", function(rows) {
					equal(rows.length, 0);
					start();
				});
			});
		});
	});

	asyncTest("Insert source and query unlocated", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "sources", {
					uid : "uid1",
					code : "code1",
					created_by : "test"
				});
			}, error, function() {
				model.queryUnlocatedSources("test", "", function(rows) {
					equal(rows.length, 1);
					start();
				});
			});
		});
	});

	asyncTest("queryNearby location", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "sources", {
					uid : "uid1",
					code : "code1"
				});
				model.insertRow(tx, "sources", {
					uid : "uid2",
					code : "code1",
					latitude : 0.1,
					longitude : 0.1
				});
				model.insertRow(tx, "sources", {
					uid : "uid3",
					code : "code1",
					latitude : 0.1,
					longitude : 0.2
				});
				model.insertRow(tx, "sources", {
					uid : "uid4",
					code : "code1",
					latitude : 0.1,
					longitude : 0.9
				});
			}, error, function() {
				model.queryNearbySources(0, 0.3, "", function(rows) {
					ok(_.isEqual(_.pluck(rows, "uid"), ["uid3", "uid2", "uid4"]));
					start();
				});
			});
		});
	});

	asyncTest("queryNearby filter", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "sources", {
					uid : "uid1",
					code : "code1"
				});
				model.insertRow(tx, "sources", {
					uid : "uid2",
					code : "code1",
					latitude : 0.1,
					longitude : 0.1
				});
				model.insertRow(tx, "sources", {
					uid : "uid3",
					code : "code1",
					name : "abc",
					latitude : 0.1,
					longitude : 0.2
				});
				model.insertRow(tx, "sources", {
					uid : "uid4",
					code : "code1",
					name : "xyz",
					latitude : 0.1,
					longitude : 0.9
				});
			}, error, function() {
				model.queryNearbySources(0, 0.3, "x", function(rows) {
					ok(_.isEqual(_.pluck(rows, "uid"), ["uid4"]));
					start();
				});
			});
		});
	});

	asyncTest("Update source and query", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "sources", {
					uid : "uid1",
					code : "code1",
					latitude : 0.1,
					longitude : 0.1
				});
			}, error, function() {
				model.queryNearbySources(0, 0, "", function(rows) {
					equal(rows.length, 1);
					model.transaction(function(tx) {
						model.updateRow(tx, rows[0], {
							code : "code2"
						});
					}, error, function() {
						model.queryNearbySources(0, 0, "", function(rows) {
							equal(rows[0].code, "code2");
							start();
						}, error);
					});
				});
			});
		});
	});

	asyncTest("Insert source, delete and query", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "sources", {
					uid : "uid1",
					code : "code1",
					latitude : 0.1,
					longitude : 0.1
				});
			}, error, function() {
				model.queryNearbySources(0, 0, "", function(rows) {
					equal(rows.length, 1);
					model.transaction(function(tx) {
						model.deleteRow(tx, rows[0]);
					}, error, function() {
						model.queryNearbySources(0, 0, "", function(rows) {
							equal(rows.length, 0);
							start();
						}, error);
					});
				});
			});
		});
	});

	/*
	 asyncTest("queryLatLngSources simple", function() {
	 model.transaction(function (tx){
	 resetdb(tx);
	 model.insertRow(tx, "sources", { uid: "uid1", code: "code1" });
	 model.insertRow(tx, "sources", { uid: "uid2", code: "code1", latitude: 10, longitude: 1 });
	 model.insertRow(tx, "sources", { uid: "uid3", code: "code1", latitude: 1, longitude: 2 });
	 model.insertRow(tx, "sources", { uid: "uid4", code: "code1", latitude: 3, longitude: 10 });
	 model.insertRow(tx, "sources", { uid: "uid5", code: "code1", latitude: 3, longitude: 4 });
	 }, error,
	 function() {
	 // Query rectangle x1, y1, x2, y2 with no start uid
	 model.queryLatLngSources(new utils.Rect(1, 2, 11, 4), null, null, function(rows) {
	 ok(_.isEqual(_.pluck(rows, "uid"), ["uid4", "uid5"]));
	 start();
	 });
	 });
	 });

	 asyncTest("queryLatLngSources since", function() {
	 model.transaction(function (tx){
	 resetdb(tx);
	 model.insertRow(tx, "sources", { uid: "uid1", code: "code1" });
	 model.insertRow(tx, "sources", { uid: "uid2", code: "code1", latitude: 10, longitude: 1 });
	 model.insertRow(tx, "sources", { uid: "uid3", code: "code1", latitude: 1, longitude: 2 });
	 model.insertRow(tx, "sources", { uid: "uid4", code: "code1", latitude: 3, longitude: 10 });
	 model.insertRow(tx, "sources", { uid: "uid5", code: "code1", latitude: 3, longitude: 4 });
	 }, error,
	 function() {
	 // Query rectangle x1, y1, x2, y2 with start uid
	 model.queryLatLngSources(new utils.Rect(1, 2, 11, 4), "uid4", null, function(rows) {
	 ok(_.isEqual(_.pluck(rows, "uid"), ["uid5"]));
	 start();
	 });
	 });
	 });

	 asyncTest("queryLatLngSources wrap", function() {
	 model.transaction(function (tx){
	 resetdb(tx);
	 model.insertRow(tx, "sources", { uid: "uid1", code: "code1" });
	 model.insertRow(tx, "sources", { uid: "uid2", code: "code1", latitude: 10, longitude: 175 });
	 model.insertRow(tx, "sources", { uid: "uid3", code: "code1", latitude: 1, longitude: -175 });
	 model.insertRow(tx, "sources", { uid: "uid4", code: "code1", latitude: 3, longitude: 10 });
	 model.insertRow(tx, "sources", { uid: "uid5", code: "code1", latitude: 3, longitude: 4 });
	 }, error,
	 function() {
	 // Query rectangle x1, y1, x2, y2 with no start uid
	 model.queryLatLngSources(new utils.Rect(170, 0, -170, 20), null, null, function(rows) {
	 ok(_.isEqual(_.pluck(rows, "uid"), ["uid2", "uid3"]));
	 start();
	 });
	 });
	 });

	 asyncTest("queryLatLngSources limit", function() {
	 model.transaction(function (tx){
	 resetdb(tx);
	 model.insertRow(tx, "sources", { uid: "uid1", code: "code1" });
	 model.insertRow(tx, "sources", { uid: "uid2", code: "code1", latitude: 10, longitude: 1 });
	 model.insertRow(tx, "sources", { uid: "uid3", code: "code1", latitude: 1, longitude: 2 });
	 model.insertRow(tx, "sources", { uid: "uid4", code: "code1", latitude: 3, longitude: 10 });
	 model.insertRow(tx, "sources", { uid: "uid5", code: "code1", latitude: 3, longitude: 4 });
	 }, error,
	 function() {
	 // Query rectangle x1, y1, x2, y2 with no start uid
	 model.queryLatLngSources(new utils.Rect(1, 2, 11, 4), null, 1, function(rows) {
	 ok(_.isEqual(_.pluck(rows, "uid"), ["uid4"]));
	 start();
	 });
	 });
	 });

	 */

	test("sourceTypes", function() {
		ok(model.sourceTypes.length > 10);
	});

	asyncTest("Insert tests and query", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "tests", {
					uid : "uid1",
					test_type : 1,
					created_by : "test"
				});
				model.insertRow(tx, "tests", {
					uid : "uid2",
					test_type : 1,
					created_by : "test"
				});
				model.insertRow(tx, "tests", {
					uid : "uid3",
					test_type : 2,
					created_by : "test"
				});
			}, error, function() {
				model.queryTests("test", function(rows) {
					equal(rows.length, 3);
					start();
				}, error);
			});
		});
	});

	asyncTest("Insert tests with sample and query", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "samples", {
					uid : "uids1",
					desc : "desc1"
				});
				model.insertRow(tx, "tests", {
					uid : "uidt1",
					test_type : 1,
					sample : "uids1",
					created_by : "test"
				});
			}, error, function() {
				model.queryTests("test", function(rows) {
					equal(rows.length, 1);
					equal(rows[0].uid, "uidt1");
					equal(rows[0].sample.uid, "uids1");
					start();
				}, error);
			});
		});
	});

	asyncTest("Insert tests with sample+source and query", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "sources", {
					uid : "uidss1",
					code : "1234"
				});
				model.insertRow(tx, "samples", {
					uid : "uids1",
					source : "uidss1",
					desc : "desc1"
				});
				model.insertRow(tx, "tests", {
					uid : "uidt1",
					test_type : 1,
					sample : "uids1",
				});
			}, error, function() {
				model.queryTests("test", function(rows) {
					equal(rows.length, 1);
					equal(rows[0].uid, "uidt1");
					equal(rows[0].sample.uid, "uids1");
					equal(rows[0].sample.source.code, "1234");
					start();
				}, error);
			});
		});
	});

	asyncTest("Insert tests with sample and single query", function() {
		resetTests(function() {
			model.transaction(function(tx) {
				model.insertRow(tx, "samples", {
					uid : "uids1",
					desc : "desc1"
				});
				model.insertRow(tx, "tests", {
					uid : "uidt1",
					test_type : 1,
					sample : "uids1",
				});
			}, error, function() {
				model.queryTestByUid("uidt1", function(row) {
					equal(row.uid, "uidt1");
					equal(row.sample.uid, "uids1");
					start();
				}, error);
			});
		});
	});

}
