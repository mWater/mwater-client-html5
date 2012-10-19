var pages = pages || {}

/* Displays details of a test */
pages.Test_2 = function(uid) {
	this.uid = uid;
	var page = this;

	this.displayResults = function() {
		if (page.test.resultsData) {
			page.$("#bluegreen_color").attr('checked', page.test.resultsData.ecoli);
		}
	}


	this.saveResults = function() {
		return {
			ecoli : $("#bluegreen_color").attr('checked') == "checked",
		};
	}

}

pages.Test_2.prototype = new pages.Test();
pages.Test_2.prototype.constructor = pages.Test_2;
