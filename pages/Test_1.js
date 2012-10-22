var pages = pages || {}

/* Displays details of a test */
pages.Test_1 = function(uid) {
	this.uid = uid;
	var page = this;

	this.displayResults = function() {
		if (page.test.resultsData) {
			page.$("#blue_color").toggleClass('checked', page.test.resultsData.ecoli == true);
			page.$("#yellow_color").toggleClass('checked', page.test.resultsData.tc == true);
		}
	}


	this.saveResults = function() {
		return {
			ecoli : $("#blue_color").hasClass('checked'),
			tc : $("#yellow_color").hasClass('checked')
		};
	}

}

pages.Test_1.prototype = new pages.Test();
pages.Test_1.prototype.constructor = pages.Test_1;
