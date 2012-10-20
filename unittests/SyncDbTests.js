(function () {
    module("SyncDb");
    var db = window.openDatabase("test", "", "test", 100000);
    
    var tableDefs = [{name: "test1", cols: ["uid", "a"]}, {name: "test2", cols: ["uid", "b"]}]
    
    var syncDb = new SyncDb(db, tableDefs);

    // Creates the test tables
    function createTables(tx) {
        // Create test tables
        tx.executeSql("DROP TABLE IF EXISTS test1;");
        tx.executeSql("DROP TABLE IF EXISTS test2;");
        tx.executeSql("CREATE TABLE test1 (id integer primary key autoincrement, uid text, a text);");
        tx.executeSql("INSERT INTO test1 (uid,a) VALUES ('uid1', 'test1');");
        tx.executeSql("CREATE TABLE test2 (id integer primary key autoincrement, uid text, b text);");
        tx.executeSql("INSERT INTO test2 (uid,b) VALUES ('uid2', 'test2');");
    }

    // Simple failure function
    function fail(error) {
        ok(false, "sql error: " + error.message);
        start();
    }

    // Converts sql results to a list
    function resultsToList(results) {
        var rows = []
        for (var i=0;i<results.rows.length;i++)
            rows.push(results.rows.item(i));
        return rows;
    }
    
    // Sets up the syncdb and the test tables
    function setup(complete) {
        // Create sync db tables
        db.transaction(function(tx) {
            syncDb.dropTables(tx);
            syncDb.createTables(tx);
        }, fail, function() {
            // Create test database
            db.transaction(createTables, fail, complete);
        });
    }

    // Tests that the set of operations results in the expected change set    
    function testPendingChanges(ops, expected) {
        setup(function() {
            // Perform operations
            db.transaction(ops, fail, function() {
                // Check changeset
                syncDb.getPendingChanges(function(data) {
                    ok(_.isEqual(data, expected));
                    start();
                });
            });
        });
    }
  
    asyncTest("no changes", function() {
        testPendingChanges(
            function(tx) {
            }, null
        );
    });
      
    asyncTest("insert recorded", function() {
        testPendingChanges(
            function(tx) {
                tx.executeSql("INSERT INTO test1 (uid, a) VALUES ('uid2', 'test2');");
                syncDb.recordInsert(tx, 'test1', 'uid2');
            },
            {
                tables: [{
                            name: "test1",
                            upserts: {
                                cols: ['uid', 'a'],
                                rows: [['uid2', 'test2']]
                            }
                        }],
                until: 1
            }
        );
    });
    
    asyncTest("update recorded", function() {
        testPendingChanges(
            function(tx) {
                tx.executeSql("UPDATE test1 SET a='test2' WHERE uid='uid1';");
                syncDb.recordUpdate(tx, 'test1', 'uid1');
            },
            {
                tables: [{
                            name: "test1",
                            upserts: {
                                cols: ['uid', 'a'],
                                rows: [['uid1', 'test2']]
                            }
                        }],
                until: 1
            }
        );
    });

    asyncTest("delete recorded", function() {
        testPendingChanges(
            function(tx) {
                tx.executeSql("DELETE FROM test1 WHERE uid='uid1';");
                syncDb.recordDelete(tx, 'test1', 'uid1');
            },
            {
                tables: [{
                            name: "test1",
                            deletes: ['uid1']
                        }],
                until: 1
            }
        );
    });

    asyncTest("delete beats update", function() {
        testPendingChanges(
            function(tx) {
                tx.executeSql("UPDATE test1 SET a='test2' WHERE uid='uid1';");
                syncDb.recordUpdate(tx, 'test1', 'uid1');
                
                tx.executeSql("DELETE FROM test1 WHERE uid='uid1';");
                syncDb.recordDelete(tx, 'test1', 'uid1');
            },
            {
                tables: [{
                            name: "test1",
                            deletes: ['uid1']
                        }],
                until: 2
            }
        );
    });
    
    asyncTest("multi-table insert recorded", function() {
        testPendingChanges(
            function(tx) {
                tx.executeSql("INSERT INTO test1 (uid, a) VALUES ('uid3', 'test3');");
                syncDb.recordInsert(tx, 'test1', 'uid3');
                tx.executeSql("INSERT INTO test2 (uid, b) VALUES ('uid4', 'test4');");
                syncDb.recordInsert(tx, 'test2', 'uid4');
            },
            {
                tables: [{
                            name: "test1",
                            upserts: {
                                cols: ['uid', 'a'],
                                rows: [['uid3', 'test3']]
                            }
                        },
                        {
                            name: "test2",
                            upserts: {
                                cols: ['uid', 'b'],
                                rows: [['uid4', 'test4']]
                            }
                        }],
                until: 2
            }
        );
    });
    
    // Tests that the changes applies pass checks
    function testApplyChanges(changes, slices, checks) {
        setup(function() {
            // Apply changeset
            syncDb.applyChanges(changes, slices, fail,
                function() {
                    db.transaction(function(tx) {
                        checks(tx);    
                    }, fail, start);
                });
        });
    }
    
    asyncTest("insert applied", function() {
        testApplyChanges(
            {
                tables: [{
                            name: "test1",
                            upserts: {
                                cols: ['uid', 'a'],
                                rows: [['uid2', 'test2']]
                            }
                        }],
                until: 1
            }, ["slice1"], 
            function(tx) {
                tx.executeSql("SELECT * FROM test1;", [], function(tx, results) {
                    ok(_.isEqual(resultsToList(results),
                        [{id: 1, uid:'uid1', a:'test1'},
                         {id: 2, uid:'uid2', a:'test2'}]));
                });
            }
        );
    });

    asyncTest("update applied", function() {
        testApplyChanges(
            {
                tables: [{
                            name: "test1",
                            upserts: {
                                cols: ['uid', 'a'],
                                rows: [['uid1', 'test2']]
                            }
                        }],
                until: 1
            }, ["slice1"], 
            function(tx) {
                tx.executeSql("SELECT * FROM test1;", [], function(tx, results) {
                    ok(_.isEqual(resultsToList(results),
                        [{id: 1, uid:'uid1', a:'test2'}]));
                });
            }
        );
    });

    asyncTest("delete applied", function() {
        testApplyChanges(
            {
                tables: [{
                            name: "test1",
                            deletes: ['uid1']
                        }],
                until: 1
            }, ["slice1"], 
            function(tx) {
                tx.executeSql("SELECT * FROM test1;", [], function(tx, results) {
                    ok(_.isEqual(resultsToList(results), []));
                });
            }
        );
    });

    asyncTest("missing delete ignored", function() {
        testApplyChanges(
            {
                tables: [{
                            name: "test1",
                            deletes: ['uid2']
                        }],
                until: 1
            }, ["slice1"], 
            function(tx) {
                tx.executeSql("SELECT * FROM test1;", [], function(tx, results) {
                    ok(_.isEqual(resultsToList(results), 
                        [{id: 1, uid:'uid1', a:'test1'}]));
                });
            }
        );
    });

    asyncTest("unknown table ignored", function() {
        testApplyChanges(
            {
                tables: [{
                            name: "xxx",
                            upserts: {
                                cols: ['uid', 'a'],
                                rows: [['uid1', 'test2']]
                            }
                        }],
                until: 1
            }, ["slice1"], 
            function(tx) {
                tx.executeSql("SELECT * FROM test1;", [], function(tx, results) {
                    ok(_.isEqual(resultsToList(results),
                        [{id: 1, uid:'uid1', a:'test1'}]));
                });
            }
        );
    });
    
    asyncTest("unknown column ignored", function() {
        testApplyChanges(
            {
                tables: [{
                            name: "test1",
                            upserts: {
                                cols: ['uid', 'a', 'xxx'],
                                rows: [['uid1', 'test2', 'xxx']]
                            }
                        }],
                until: 1
            }, ["slice1"], 
            function(tx) {
                tx.executeSql("SELECT * FROM test1;", [], function(tx, results) {
                    ok(_.isEqual(resultsToList(results), 
                        [{id: 1, uid:'uid1', a:'test2'}]));
                });
            }
        );
    });
    
    asyncTest("changes cleared", function() {
        setup(function() {
            // Make some changes
            db.transaction(function(tx) {
                tx.executeSql("UPDATE test1 SET a='test2' WHERE uid='uid1';");
                syncDb.recordUpdate(tx, 'test1', 'uid1');  
            }, fail, function() {
                // Get changes
                syncDb.getPendingChanges(function(cs) {
                    // Make sure present
                    equal(cs.tables.length, 1);
                    
                    // Clear changes
                    syncDb.clearPendingChanges(cs, function() {
                        // Get changes
                        syncDb.getPendingChanges(function(cs) {
                            // Make sure none present
                            equal(cs, null);
                            start();
                        });
                    }, fail);

                }, fail);
            });
        });
    });
    
    asyncTest("slices applied", function() {
        testApplyChanges(
            {
                tables: [{
                            name: "test1",
                            upserts: {
                                cols: ['uid', 'a'],
                                rows: [['uid1', 'test2']]
                            }
                        }],
                until: 2
            }, ["slice1", "slice2", "slice3"],
            function(tx) {
                stop();
                syncDb.getSliceUntils(["slice1", "slice2"], function(slices) {
                    ok(_.isEqual(slices, { slice1: 2, slice2: 2}));
                    start();
                }, fail);
            }
        );
    });

})();