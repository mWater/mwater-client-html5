var pages = pages || {}

/* EC Compact Dry Plate */
pages.Test_6 = function(uid) {
	this.uid = uid;
	var page = this;
	var tntc = 9999;		// TNTC value

	// Update results to show/hide controls
	function updateEditResults() {
		// Show inputs if not TNTC
		page.$("input[name='ecoli']").toggle(page.$("input[name='ecoli']").val() != tntc);
		page.$("input[name='tc']").toggle(page.$("input[name='tc']").val() != tntc)
	}
	
	this.displayResults = function() {
		// Show auto-count if present
		page.$("#auto_count_button").hide();
        OpenCVActivity.processList(function(list) {
        	if (_.contains(list, "ec-plate")) {
        		page.$("#auto_count_button").show();
        	}
        });
        
        page.$("#auto_count_button").on("tap", function() {
        	takePhotoAndAnalyse();
        });
		
		if (page.test.resultsData) {
			page.$("input[name='ecoli']").val(page.test.resultsData.ecoli);
			page.$("input[name='tc']").val(page.test.resultsData.tc);
			
			page.$("#ecoli_tntc").toggleClass('checked', page.test.resultsData.ecoli == tntc);
			page.$("#tc_tntc").toggleClass('checked', page.test.resultsData.tc == tntc);
		}

		page.$("#ecoli_tntc").on("checked", function() {
			if ($(this).hasClass('checked'))
				$("input[name='ecoli']").val(tntc);
			else
				$("input[name='ecoli']").val('');
			updateEditResults();
		});
		page.$("#tc_tntc").on("checked", function() {
			if ($(this).hasClass('checked'))
				$("input[name='tc']").val(tntc);
			else
				$("input[name='tc']").val('');
			updateEditResults();
		});
		updateEditResults();
	};
	
	// Auto analyzes photo
	function performAutoAnalysis(photoUid) {
		page.imageManager.getImagePath(photoUid, function(path) {
			console.log("Analyzing image: " + path);
			// Call auto-analysis
			OpenCVActivity.process("ec-plate", [ path ], 
				"EC Compact Dry Plate Counter", 
				function(results) {
					console.log("Got results: " + JSON.stringify(results));
					
					// Display error message
					if (results.error) {
						alert(results.error);
						return;
					}
				
					// Record results, deleting manual counts
					page.updateResults({
						"autoEcoli": results.ecoli, 
						"autoTC": results.tc, 
						"autoAlgo": results.algorithm
					});
			}, page.error);
		}, page.error);
	}
	
	// Takes a picture if none present, otherwise re-analyse
	function takePhotoAndAnalyse() {
		if (page.test.photo) {
			performAutoAnalysis(page.test.photo);
		}
		else {
			page.photoDisplayer.takePicture();
		}
	}

	this.photoUpdated = function(photoUid) {
		console.log("photo updated:" + photoUid);
		
        OpenCVActivity.processList(function(list) {
        	if (_.contains(list, "ec-plate")) {
    			if (confirm("Automatically analyze image?")) {
    				performAutoAnalysis(photoUid);
    			}
        	}
        });
	};

	this.saveResults = function() {
		var r = _.pick(page.test.resultsData || {}, "autoEcoli", "autoTC", "autoAlgo");

		r.manualEcoli = $("#ecoli_tntc").hasClass('checked') ? tntc : 
			(parseInt($("input[name='ecoli']").val()) || undefined);
		r.manualTC = $("#tc_tntc").hasClass('checked') ? tntc : 
			(parseInt($("input[name='tc']").val()) || undefined);

		return r;
	};


	this.createTemplateView = function(test) {
		var view = _.clone(test)

		if (view.resultsData) {
			var r = view.resultsData;

			r.ecoli = r.manualEcoli || r.autoEcoli;
			r.ecoliTNTC = r.ecoli == tntc;
			r.tc = r.manualTC || r.autoTC;
			r.tcTNTC = r.tc == tntc;
			
			r.ecoliPresent = r.ecoli > 0;
			r.tcPresent = r.tc > 0;
			
		}
		return view;
	}

}

pages.Test_6.prototype = new pages.Test();
pages.Test_6.prototype.constructor = pages.Test_6;
