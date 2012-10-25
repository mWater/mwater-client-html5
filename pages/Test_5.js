var pages = pages || {}

/* Generic Microbiology */
pages.Test_5 = function(uid) {
	this.uid = uid;
	var page = this;

	this.displayResults = function() {
		if (page.test.resultsData) {
			page.$("#type").val(page.test.resultsData.type);
			page.$("#value").val(page.test.resultsData.value);
		}
	}


	this.saveResults = function() {
		return {
			type : page.$("#type").val(),
			value : parseFloat(page.$("#value").val())
		};
	}

	this.createTemplateView = function(test) {
		var view = _.clone(test)

		view.types = ["ecoli", "total_coliforms", "thermotolerant_coliforms", "enterococci", "heterotrophic_plate_count", "faecal_streptococci", "clostridium_perfringens"];	
		return view;
	}
}

pages.Test_5.prototype = new pages.Test();
pages.Test_5.prototype.constructor = pages.Test_5;
