var pages = pages || {}

/* Displays details of a test */
pages.Test_1 = function(uid) {
	this.uid = uid;
	var page = this;

	this.displayResults = function() {
		if (page.test.resultsData) {
			page.$("#blue_color").attr('checked', page.test.resultsData.ecoli);
			page.$("#yellow_color").attr('checked', page.test.resultsData.tc);
		}
	}


	this.saveResults = function() {
		return {
			ecoli : $("#blue_color").attr('checked') == "checked",
			tc : $("#yellow_color").attr('checked') == "checked"
		};
	}

}

pages.Test_1.prototype = new pages.Test();
pages.Test_1.prototype.constructor = pages.Test_1;
