var pages = pages || {}

/* Chlorine test */
pages.Test_4 = function(uid) {
	this.uid = uid;
	var page = this;

	this.displayResults = function() {
		if (page.test.resultsData) {
			page.$("#present").toggleClass('checked', page.test.resultsData.present == true);
			$("#mgPerL").val(page.test.resultsData.mgPerL);
			if (!page.test.resultsData.present)
				page.$("#chlorine_value").hide();
		} else {
			page.$("#chlorine_value").hide();
		}
		
		page.$("#present").on('checked', function() {
			if ($("#present").hasClass('checked'))
				page.$("#chlorine_value").show();
			else
				page.$("#chlorine_value").hide();
		});

	}


	this.saveResults = function() {
		var val = {}
		val.present = $("#present").hasClass('checked');
		if (val.present && $("#mgPerL").val() != "") {
			val.mgPerL = parseFloat($("#mgPerL").val());
			if (val.mgPerL == NaN) {
				alert("Invalid value");
				return undefined;
			}
		}

		return val;
	}

}

pages.Test_4.prototype = new pages.Test();
pages.Test_4.prototype.constructor = pages.Test_4;
