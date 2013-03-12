var pages = pages || {}

/* EC Compact Dry Plate*/
pages.Test_6 = function(uid) {
	this.uid = uid;
	var page = this;

	this.displayResults = function() {
		if (page.test.resultsData) {
			page.$("input[name='ecoli']").val(page.test.resultsData.ecoli);
			page.$("input[name='tc']").val(page.test.resultsData.tc);
		}
	}


	this.saveResults = function() {
		var r = _.pick(page.test.resultsData || {}, "autoEcoli", "autoTC", "autoAlgo", "autoEcoliTNTC", "autoTCTNTC");

		r.manualEcoli = parseInt($("input[name='ecoli']").val()) || undefined;
		r.manualEcoliTNTC = $("#ecoli_tntc").hasClass('checked');
		r.manualTC = parseInt($("input[name='tc']").val()) || undefined;
		r.manualTCTNTC = $("#tc_tntc").hasClass('checked');

		return r;
	}


	this.createTemplateView = function(test) {
		var view = _.clone(test)

		if (view.resultsData) {
			var r = view.resultsData;

			r.ecoli = r.manualEcoli || r.autoEcoli;
			r.tc = r.manualTC || r.autoTC;
			r.ecoliTNTC = (r.manualEcoliTNTC === undefined || r.manualEcoliTNTC === null) ? r.autoEcoliTNTC : r.manualEcoliTNTC;   
			r.tcTNTC = (r.manualTCTNTC === undefined || r.manualTCTNTC === null) ? r.autoTCTNTC : r.manualTCTNTC;   
		}
		return view;
	}

}

pages.Test_6.prototype = new pages.Test();
pages.Test_6.prototype.constructor = pages.Test_6;
