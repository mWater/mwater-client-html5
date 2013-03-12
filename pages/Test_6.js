var pages = pages || {}

/* EC Compact Dry Plate*/
pages.Test_6 = function(uid) {
	this.uid = uid;
	var page = this;
	var tntc = 9999;		// TNTC value

	this.displayResults = function() {
		if (page.test.resultsData) {
			page.$("input[name='ecoli']").val(page.test.resultsData.ecoli);
			page.$("input[name='tc']").val(page.test.resultsData.tc);
			
			page.$("input[name='ecoli']").toggle(page.test.resultsData.ecoli != tntc);
			page.$("input[name='tc']").toggle(page.test.resultsData.tc != tntc)
		}
	};

	this.photoUpdated = function(photoUid) {
		console.log("photo updated:" + photoUid);
		if (cordova && cordova.exec) {
			if (confirm("Automatically analyze image?")) {
				page.imageManager.getImagePath(photoUid, function(path) {
					console.log("Analyzing image: " + path);
					// Call auto-analysis
					cordova.exec(function(results) {
						console.log("Got results: " + JSON.stringify(results));
						
						// Record results, deleting manual counts
						page.updateResults({
							"autoEcoli": results.ecoli, 
							"autoTC": results.tc, 
							"autoAlgo": results.algorithm
						});
					}, page.error, 'OpenCVActivity', 'launch', [ "ec-plate",
							[ path ], "EC Compact Dry Plate" ]);

				}, page.error);
			}
		}
	};

	this.saveResults = function() {
		var r = _.pick(page.test.resultsData || {}, "autoEcoli", "autoTC", "autoAlgo");

		r.manualEcoli = $("#ecoli_tntc").hasClass('checked') ? 9999 : 
			(parseInt($("input[name='ecoli']").val()) || undefined);
		r.manualTC = $("#tc_tntc").hasClass('checked') ? 9999 : 
			(parseInt($("input[name='tc']").val()) || undefined);

		return r;
	};


	this.createTemplateView = function(test) {
		var view = _.clone(test)

		if (view.resultsData) {
			var r = view.resultsData;

			r.ecoli = r.manualEcoli || r.autoEcoli;
			r.tc = r.manualTC || r.autoTC;
		}
		return view;
	}

}

pages.Test_6.prototype = new pages.Test();
pages.Test_6.prototype.constructor = pages.Test_6;
