
function MWaterSqlModel(db, syncDb) {
    var that = this;

	this.init = function(success, error) {
		db.transaction(function(tx) {
			// Create model tables
			that.createTables(tx);
			syncDb.createTables(tx);
		}, error, success);
	};
	
	// Resets all databases
	this.reset = function(success, error) {
        db.transaction(function(tx) {
            // Delete tables
            that.dropTables(tx);
            syncDb.dropTables(tx);
            
            // Create model tables
            that.createTables(tx);
            syncDb.createTables(tx);
        }, error, success);
	};
    
    // Create tables if they don't exist
    this.createTables = function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS sources( \
                      uid TEXT PRIMARY KEY DEFAULT (LOWER(HEX(RANDOMBLOB(16)))), \
                      row_version INTEGER DEFAULT 1, \
                      code TEXT, \
                      source_type INTEGER, \
                      name TEXT, \
                      desc TEXT, \
                      latitude REAL, longitude REAL, \
                      photo TEXT, \
                      created_by TEXT);");
        
        tx.executeSql("CREATE TABLE IF NOT EXISTS source_notes( \
                      uid TEXT PRIMARY KEY DEFAULT (LOWER(HEX(RANDOMBLOB(16)))), \
                      row_version INTEGER DEFAULT 1, \
                      source TEXT REFERENCES sources(uid) ON DELETE CASCADE, \
                      created_on INTEGER, \
                      operational INTEGER, \
                      note TEXT, \
                      created_by TEXT);");
        
        tx.executeSql("CREATE TABLE IF NOT EXISTS samples( \
                      uid TEXT PRIMARY KEY DEFAULT (LOWER(HEX(RANDOMBLOB(16)))), \
                      row_version INTEGER DEFAULT 1, \
                      source TEXT REFERENCES sources(uid) ON DELETE CASCADE, \
                      code TEXT, \
                      desc TEXT, \
                      sampled_on INTEGER, \
                      created_by TEXT);");
        
        tx.executeSql("CREATE TABLE IF NOT EXISTS tests( \
                      uid TEXT PRIMARY KEY DEFAULT (LOWER(HEX(RANDOMBLOB(16)))), \
                      row_version INTEGER DEFAULT 1, \
                      sample TEXT REFERENCES samples(uid) ON DELETE CASCADE, \
                      test_type INTEGER NOT NULL, \
                      test_version INTEGER, \
                      code TEXT, \
                      started_on INTEGER, \
                      read_on INTEGER, \
                      dilution INTEGER DEFAULT 1, \
                      results TEXT, \
                      notes TEXT, \
                      photo TEXT, \
                      created_by TEXT);");
    };

    this.dropTables = function (tx) {
        tx.executeSql("DROP TABLE IF EXISTS sources;");
        tx.executeSql("DROP TABLE IF EXISTS source_notes;");
        tx.executeSql("DROP TABLE IF EXISTS samples;");
        tx.executeSql("DROP TABLE IF EXISTS tests;");
    };
    
    this.transaction = function(callback, error, success) {
        db.transaction(callback, error, success);
    };
    
    this.insertRow = function(tx, table, values) {
        tx.executeSql("INSERT INTO " + table
                + " (" + _.keys(values).join()
                + ") VALUES ("
                + _.map(values, function(value, key) {
                     return "?";
                }).join()
                + ");",
                _.values(values));
        syncDb.recordInsert(tx, table, values.uid);
    };
    
    this.updateRow = function(tx, row, values) {
        tx.executeSql("UPDATE " + row.table
                + " SET "
                + _.map(values, function(value, key) {
                     return key + "=?";
                }).join()
                + " WHERE uid=?",
                _.values(values).concat([row.uid]));
        syncDb.recordUpdate(tx, row.table, row.uid);
    };

    this.deleteRow = function(tx, row) {
        tx.executeSql("DELETE FROM " + row.table + " WHERE uid=?", [row.uid]);
        syncDb.recordDelete(tx, row.table, row.uid);
    };
    
    function Row(table) {
        this.table = table;
    }
    
    // Simple query function that uses rowType as a prototype for returned rows
    var query = function(sql, params, rowType, success, error) {
        console.log("query: " + sql + "error: " + typeof error);
        db.transaction(function(tx) {
            tx.executeSql(sql, params, function(tx, results) {
                var rows=[]
                for (var i=0;i<results.rows.length;i++) {
                    var row = Object.create(rowType);
                    _.extend(row, results.rows.item(i));
                    rows.push(row);
                }
                success(rows);
            });    
        }, error);
    }
    
    var queryRowByField = function(table, field, value, rowType, success, error) {
        query("SELECT * FROM " + table + " WHERE " + field + "=?", [value], rowType, function(rows) {
            if (rows.length>0) {
                success(rows[0]);
            }
            else
                success(null);
        }, error);
    }

    this.queryNearbySources = function(latitude, longitude, search, success, error) {
    	var where = " WHERE latitude IS NOT NULL AND longitude IS NOT NULL";
        where += search ? " AND (code LIKE ? OR name LIKE ? OR desc LIKE ?)" : "";
        var sql = "SELECT * FROM sources" + where + " ORDER BY ((latitude-?)*(latitude-?)+(longitude-?)*(longitude-?))";
        var params = [latitude, latitude, longitude, longitude];
        if (search)
            params.unshift(search + "%", search + "%", search + "%");
        query(sql, params, new Row("sources"), success, error);
    };

    this.queryUnlocatedSources = function(createdBy, search, success, error) {
    	var where = " WHERE created_by = ? AND latitude IS NULL";
        where += search ? " AND (code LIKE ? OR name LIKE ? OR desc LIKE ?)" : "";
        var sql = "SELECT * FROM sources" + where + " ORDER BY uid";
        var params = [createdBy];
        if (search)
            params.push(search + "%", search + "%", search + "%");
        query(sql, params, new Row("sources"), success, error);
    };


    this.querySourceByUid = function(uid, success, error) {
        queryRowByField("sources", "uid", uid, new Row("sources"), success, error);
    };
    
    this.querySamplesAndTests = function(sourceUid, success, error) {
        query("SELECT * FROM samples WHERE source=?", [sourceUid], new Row("samples"), function(samples) {
            // Load tests for samples
            query("SELECT tests.* FROM tests INNER JOIN samples ON tests.sample=samples.uid WHERE samples.source=?",
                [sourceUid], new Row("tests"),
                function(tests) {
                    // Create empty tests list for each sample
                    _.each(samples, function(sample) { sample.tests=[]; });
                    _.each(_.groupBy(tests, function(t) { return t.sample; }),
                        function(val, key) {
                            _.find(samples, function(s) { return s.uid==key; }).tests=val;
                        });
                    success(samples);
                }, error);
      }, error);
    };

	function queryTestsGeneric(where, params, success, error) {
    	var cols = []
    	cols = cols.concat(_.map(_.where(MWaterSqlModel.tableDefs, {name:"sources"})[0].cols, function(col) { return "sources."+col+" AS sources__"+col; }));
    	cols = cols.concat(_.map(_.where(MWaterSqlModel.tableDefs, {name:"samples"})[0].cols, function(col) { return "samples."+col+" AS samples__"+col; }));
    	cols = cols.concat(_.map(_.where(MWaterSqlModel.tableDefs, {name:"tests"})[0].cols, function(col) { return "tests."+col+" AS tests__"+col; }));
        var sql = "SELECT " + cols.join() + " FROM tests \
        		LEFT OUTER JOIN samples ON tests.sample=samples.uid \
        		LEFT OUTER JOIN sources ON samples.source=sources.uid \
        		WHERE " + where + " ORDER BY tests.started_on DESC";
        
        db.transaction(function(tx) {
            tx.executeSql(sql, params, function(tx, results) {
                var rows=[]
                for (var i=0;i<results.rows.length;i++) {
                	var r = results.rows.item(i);
                    var row = Object.create(new Row("tests"));

                	row.sample = Object.create(new Row("samples"));
               		row.sample.source = Object.create(new Row("samples"));
                    
                    // Copy test values
                    _.each(r, function(value, key) {
                    	var spl = key.split("__");
                    	if (spl[0]=="tests" && spl[1] != "sample")
                    		row[spl[1]]=value;
                    	else if (spl[0]=="samples" && spl[1] != "source")
                    		row.sample[spl[1]]=value;
                    	else if  (spl[0]=="sources")
                    		row.sample.source[spl[1]]=value;
                    });
                    rows.push(row);
                }
                success(rows);
            });    
        }, error);
		
	}

    this.querySourceNotes = function(sourceUid, success, error) {
        query("SELECT * FROM source_notes WHERE source=?", [sourceUid], new Row("source_notes"), function(notes) {
        	success(notes);
        }, error);
    }
    
    this.querySourceNoteByUid = function(uid, success, error) {
        queryRowByField("source_notes", "uid", uid, new Row("source_notes"), success, error);
    }
        
    this.queryTests = function(createdBy, success, error) {
    	queryTestsGeneric("tests.created_by = ?", [createdBy], success, error);
    }

    this.queryTestByUid = function(uid, success, error) {
    	queryTestsGeneric("tests.uid = ?", [uid], function(rows) {
    		if (rows.length > 0)
    			success(rows[0]);
    		else
    			success(null);
    	}, error);
    }

    // List of source type ids
    this.sourceTypes = _.range(16); 
  }

MWaterSqlModel.tableDefs = [
    { name: "sources", cols: ["uid", "row_version", "code", "source_type", "name", "desc", "latitude", "longitude", "photo", "created_by"]},
    { name: "source_notes", cols: ["uid", "row_version", "source", "created_on", "operational", "note", "created_by"]},
    { name: "samples", cols: ["uid", "row_version", "source", "code", "desc", "sampled_on", "created_by"]},
    { name: "tests", cols: ["uid", "row_version", "sample", "test_type", "test_version", "code", "started_on", "read_on", "dilution", "results", "notes", "photo", "created_by"]},
    ];