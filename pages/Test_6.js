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
		var r = _.pick(page.test.resultsData || {}, "autoEcoli", "autoTC", "autoAlgo");

		r.manualEcoli = parseInt($("input[name='ecoli']").val()) || undefined;
		r.manualTC = parseInt($("input[name='tc']").val()) || undefined;

		return r;
	}


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
