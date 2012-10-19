/* Sets up a database for synchronization. Synchronization involves manually recording
 * inserts, updates and deletes in a special table "syncchanges".
 *
 * From this, a change set of upserts and deletes for all tables can be created.
 *
 * Also records which data slices have been downloaded from the server in the table "dataslices".
 *
 */

/* Create SyncDb.
 * db: database
 * tableDefs: array of table definition, each with "name" and a "cols" array of column names, in topological order
 */
function SyncDb(db, tableDefs) {
    this.db = db;
    this.tableDefs = tableDefs;
}

// Creates all of the tables needed if they do not exist
SyncDb.prototype.createTables = function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS syncchanges ( \
                  id INTEGER PRIMARY KEY AUTOINCREMENT, \
                  tablename TEXT NOT NULL, \
                  rowuid TEXT NOT NULL, \
                  action TEXT NOT NULL);");
    
    tx.executeSql("CREATE TABLE IF NOT EXISTS dataslices ( \
                  id TEXT PRIMARY KEY, \
                  serveruntil INTEGER NOT NULL);");
}

// Drops all tables if they exist
SyncDb.prototype.dropTables = function(tx) {
    tx.executeSql("DROP TABLE IF EXISTS syncchanges;");
    tx.executeSql("DROP TABLE IF EXISTS dataslices;");
}

// Records that an insert was done on a specific table of a row with the specified uid
SyncDb.prototype.recordInsert = function(tx, table, uid) {
    tx.executeSql("INSERT INTO syncchanges (tablename, rowuid, action) VALUES (?, ?, ?);",
                  [table, uid, 'I']);
}

// Records that an update was done on a specific table of a row with the specified uid
SyncDb.prototype.recordUpdate = function(tx, table, uid) {
    tx.executeSql("INSERT INTO syncchanges (tablename, rowuid, action) VALUES (?, ?, ?);",
                  [table, uid, 'U']);
}

// Records that an delete was done on a specific table of a row with the specified uid
SyncDb.prototype.recordDelete = function(tx, table, uid) {
    tx.executeSql("INSERT INTO syncchanges (tablename, rowuid, action) VALUES (?, ?, ?);",
                  [table, uid, 'D']);
}

/* Gets object of changes pending. Structure is:
 * tables: list of tables
 * until: up to when (id in syncchanges) are changes recorded for
 *
 * table: name (name of table)
 * upserts: cols and rows to upsert
 * deletes: uid of rows to delete
 */
SyncDb.prototype.getPendingChanges = function(success, error) {
    var that = this;
    
    // Convenience function to fill an array
    function newFilledArray(length, val) {
        var array = [];
        for (var i = 0; i < length; i++) {
            array[i] = val;
        }
        return array;
    }
    
    // Converts sql results to a list
    function resultsToList(results) {
        var rows = []
        for (var i=0;i<results.rows.length;i++)
            rows.push(results.rows.item(i));
        return rows;
    }

    // Processes the list of changes
    function processChanges(tx, results) {
        // Group by table
        var grps = _.groupBy(resultsToList(results), 'tablename');

        // Create changes
        var cs = { tables: []}

        // Begin transaction
        that.db.transaction(function(tx) {
            // Set until
            tx.executeSql("SELECT MAX(id) AS until FROM syncchanges", [], function(tx, results) {
                cs.until = results.rows.item(0).until || 0;
            });
            
            // For each table
            for (var tbl in grps) {
                // Get tableDef
                var tableDef = _.find(that.tableDefs, function(td) { return td.name==tbl; });
                
                var cstable = { name: tbl };
                cs.tables.push(cstable);
                
                // Get inserts updates deletes
                var inserts = _.pluck(_.where(grps[tbl], { action: "I"}), "rowuid");
                var updates = _.pluck(_.where(grps[tbl], { action: "U"}), "rowuid");
                var deletes = _.pluck(_.where(grps[tbl], { action: "D"}), "rowuid");
                
                // Record deletes
                if (deletes.length>0)
                    cstable.deletes = deletes;
                
                // Upserts are inserts/updates without deletes
                var upserts = _.difference(_.union(inserts, updates), deletes);
                
                // Gather upserts
                tx.executeSql("SELECT * FROM " + tbl + " WHERE uid in ("
                    + newFilledArray(upserts.length, "?")
                    + ");",
                    upserts,
                    function(tx, results) {
                        var rows = resultsToList(results);
                        if (rows.length > 0)
                        {
                            // Record upserts, ignoring ignored columns
                            cstable.upserts = { cols: _.keys(_.pick(rows[0], tableDef.cols)), rows: [] }
                            _.each(rows, function(row) {
                                cstable.upserts.rows.push(_.values(_.pick(row, tableDef.cols)));
                            });
                        }
                    });
            }
        }, error, function() {
            success(cs.tables.length>0 ? cs : null);
        });
    }
    
    this.db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM syncchanges ORDER BY tablename, action, rowuid", [], processChanges);
    }, error);
}

/* Clears pending changes that are contained in changes. If changes null, do nothing */
SyncDb.prototype.clearPendingChanges = function(changes, success, error) {
    if (changes != null) {
        this.db.transaction(function(tx) {
            tx.executeSql("DELETE FROM syncchanges WHERE id<=?", [changes.until]);
        }, error, success);
    }
    else
        success();
}

/* Determines the "until" value of data slices stored. If no data for a
 * slice has ever been received, is zero.
 * success is called with keys of slices, and values of untils */
SyncDb.prototype.getSliceUntils = function(slices, success, error) {
    this.db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM dataslices WHERE id IN ("
            + _.map(slices, function() { return "?"}).join()+ ");", slices,
            function(tx, results) {
                var output = {};
                // Set slices to 0 initially
                _.each(slices, function(slice) { output[slice]=0; });
                for (var i=0;i<results.rows.length;i++)
                    output[results.rows.item(i).id] = results.rows.item(i).serveruntil;
                success(output);
            }, error);
    });
}

/* Applies changes from the server for the specified slices */
SyncDb.prototype.applyChanges = function(changes, slices, error, success) {
    var that = this;
    
    if (!changes)
    {
        success();
        return;
    }

    function performUpserts(tx, tableDef, upserts) {
        _.each(upserts.rows, function(row) {
            // Make into key value set
            var rowobj = _.object(upserts.cols, row);
            
            // Remove unknown columns
            rowobj = _.pick(rowobj, tableDef.cols)
            
            // Make ?, ?, etc. string
            var params = _.map(rowobj, function() { return "?"}).join()
            
            // Perform upsert
            tx.executeSql("UPDATE " + tableDef.name
                + " SET "
                + _.map(rowobj, function(value, key) {
                     return key + "=?";
                }).join()
                + " WHERE uid=?",
                _.values(rowobj).concat([rowobj.uid]),
                function(tx, results) {
                    if (results.rowsAffected == 0) {
                        tx.executeSql("INSERT INTO " + tableDef.name
                            + "(" + _.keys(rowobj).join() + ")"
                            + " VALUES ("
                            + params
                            + ");", _.values(rowobj));
                    }
                });
        });
    }
    
    function performDeletes(tx, tableDef, deletes) {
        _.each(deletes, function(uid) {
            // Perform delete
            tx.executeSql("DELETE FROM " + tableDef.name + " WHERE uid=?", [uid]);
        });
    }
    
    this.db.transaction(function (tx) {
        // Record slices
        _.each(slices, function(slice) {
            tx.executeSql("INSERT OR REPLACE INTO dataslices (id, serveruntil) VALUES (?,?);",
                [slice, changes.until]);
        });
        
        // For each table
        _.each(changes.tables, function(table) {
            // Get tableDef, and ignore if unknown
            var tableDef = _.find(that.tableDefs, function(td) { return td.name==table.name; });
            if (!tableDef)
                return;
            
            // For each upsert
            if (table.upserts)
                performUpserts(tx, tableDef, table.upserts);
            
            // For each delete
            if (table.deletes)
                performDeletes(tx, tableDef, table.deletes);
        });
    }, error, success);
}
