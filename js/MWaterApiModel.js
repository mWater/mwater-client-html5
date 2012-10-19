function MWaterApiModel(syncServer) {
	var that = this;

	this.init = function(success, error) {
		success();
	}


	this.transaction = function(callback, error, success) {
		var tx = {
			error : error,
			success : success
		};
		callback(tx);
	}

	function makeUrl(addr) {
		return syncServer.baseUrl + addr + "?clientuid=" + syncServer.getClientUid();
	}


	this.insertRow = function(tx, table, values) {
		$.ajax(makeUrl(table + "/" + values.uid), {
			type : "PUT",
			data : values,
			success : function() {
				tx.success();
			},
			error : function(jqXHR, err) {
				tx.error(err);
			}

		});
	}


	this.updateRow = function(tx, row, values) {
		$.ajax(makeUrl(row.table + "/" + row.uid), {
			type : "POST",
			data : values,
			success : function() {
				tx.success();
			},
			error : function(jqXHR, err) {
				tx.error(err);
			}

		});
	}


	this.deleteRow = function(tx, row) {
		$.ajax(makeUrl(row.table + "/" + row.uid), {
			type : "DELETE",
			success : function() {
				tx.success();
			},
			error : function(jqXHR, err) {
				tx.error(err);
			}

		});
	}

	function Row(table) {
		this.table = table;
	}


	this.queryNearbySources = function(latitude, longitude, search, success, error) {
		// TODO
		$.get(makeUrl("sources"), function(data) {
			success(data.sources);
		}).error(error);
	}


	this.querySourceByUid = function(uid, success, error) {
		$.get(makeUrl("sources/" + uid), function(data) {
			success(data);
		}).error(error);
	}


	this.querySamplesAndTests = function(sourceUid, success, error) {
		$.get(makeUrl("sources/" + sourceUid), {
			samples: "all"
		}, function(data) {
			success(data.samples);
		}).error(error);
	};

	this.querySourceNotes = function(sourceUid, success, error) {
		success([]);
		// TODO
	}


	this.querySourceNoteByUid = function(uid, success, error) {
		queryRowByField("source_notes", "uid", uid, new Row("source_notes"), success, error);
		// TODO
	}


	this.queryTests = function(createdBy, success, error) {
		// TODO
	}


	this.queryTestByUid = function(uid, success, error) {
		// TODO
	}

	// List of source type ids
	this.sourceTypes = _.range(16);

	/* Obsolote: this.queryLatLngSources = function(rect, since, limit, success, error) {
	 var where;
	 // If wraps
	 if (rect.x1 >= rect.x2)
	 where = " WHERE (latitude >= ? AND latitude <= ?) AND (longitude >= ? OR longitude <= ?)"
	 else
	 where = " WHERE (latitude >= ? AND latitude <= ?) AND (longitude >= ? AND longitude <= ?)"

	 if (since)
	 where += " AND uid > ?";

	 var sql = "SELECT * FROM sources" + where + " ORDER BY uid";
	 if (limit)
	 sql += " LIMIT " + limit;

	 var params = [rect.y1, rect.y2, rect.x1, rect.x2];
	 if (since)
	 params.push(since);

	 query(sql, params, new Row("sources"), success, error);
	 }*/
}
