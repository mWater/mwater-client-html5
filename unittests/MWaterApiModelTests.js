(function() {
	module("MWaterApiModelTests");

	// Create syncServer
	var syncServer = new SyncServer("/mwatertest/apiv2/");
	
	// Create model
	var model = new MWaterApiModel(syncServer);

	function reset(success) {
		$.ajax(syncServer.baseUrl + "reset", {
			type : "POST",
			success : success,
			error : function(jqXHR, err) {
				ok(false);
				start();
			}

		});
	}

	new ModelTests(model, reset);
})();
