var pages = pages || {}

/* Petrifilm */
pages.Test_0 = function(uid) {
	this.uid = uid;
	var page = this;

	this.displayResults = function() {
		if (page.test.resultsData) {
			page.$("input[name='ecoli']").val(page.test.resultsData.ecoli);
			page.$("input[name='tc']").val(page.test.resultsData.tc);
			page.$("input[name='other']").val(page.test.resultsData.other);
		}
	}


	this.saveResults = function() {
		var r = _.pick(page.test.resultsData || {}, "autoEcoli", "autoTC", "autoOther", "autoAlgo");

		r.manualEcoli = parseInt($("input[name='ecoli']").val()) || undefined;
		r.manualTC = parseInt($("input[name='tc']").val()) || undefined;
		r.manualOther = parseInt($("input[name='other']").val()) || undefined;

		return r;
	}


	this.parseResults = function(results) {
		var r = JSON.parse(results);

		r.ecoli = r.manualEcoli || r.autoEcoli;
		r.tc = r.manualTC || r.autoTC;
		r.other = r.manualOther || r.autoOther;

		return r;
	}

}

pages.Test_0.prototype = new pages.Test();
pages.Test_0.prototype.constructor = pages.Test_0;
