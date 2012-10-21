function MWaterApiModel(syncServer) {
	var that = this;

	this.init = function(success, error) {
		success();
	};

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
		var lat = (latitude - 1) + "," + (latitude + 1);
		var lng = (longitude - 1) + "," + (longitude + 1);

		// TODO include own sources with no location?
		
		$.get(makeUrl("sources"), {
			latitude : lat,
			longitude : lng
		}, function(data) {
			var src = data.sources;
			src = _.sortBy(src, function(s) {
				return (latitude - s.latitude)*(latitude - s.latitude) +
					(longitude - s.longitude)*(longitude - s.longitude);
			});
			
			if (search)
				src = _.filter(src, function(s) {
					return (s.name && s.name.indexOf(search)!=-1) ||
						(s.code && s.code.indexOf(search)!=-1); 
				});
			success(src);
		}).error(error);
	}


	this.querySourceByUid = function(uid, success, error) {
		$.get(makeUrl("sources/" + uid), function(data) {
			success(data);
		}).error(error);
	}


	this.querySamplesAndTests = function(sourceUid, success, error) {
		$.get(makeUrl("sources/" + sourceUid), {
			samples : "all"
		}, function(data) {
			success(data.samples);
		}).error(error);
	};

	this.querySourceNotes = function(sourceUid, success, error) {
		$.get(makeUrl("sources/" + sourceUid + "/source_notes"), function(data) {
			success(data.source_notes);
		}).error(error);
	}


	this.querySourceNoteByUid = function(uid, success, error) {
		$.get(makeUrl("source_notes/" + uid), function(data) {
			success(data);
		}).error(error);
	}


	this.queryTests = function(createdBy, success, error) {
		$.get(makeUrl("sources"), {
			created_by : createdBy
		}, function(data) {
			success(data.tests);
		}).error(error);
	}


	this.queryTestByUid = function(uid, success, error) {
		$.get(makeUrl("tests/" + uid), function(data) {
			success(data);
		}).error(error);
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
