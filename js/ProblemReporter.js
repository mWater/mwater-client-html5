function ProblemReporter(baseUrl, version, getClientUid) {
	var history = [];
	var that = this;

	function capture(func) {
		var old = console[func];
		console[func] = function(arg) {
			history.push(arg);
			if (history.length > 200)
				history.splice(0, 20);
			old.call(console, arg);
		}

	}

	capture("log");
	capture("warn");
	capture("error");

	function getLog() {
		var log = "";
		_.each(history, function(item) {
			log += String(item) + "\r\n";
		});
		return log;
	}

	this.reportProblem = function(desc) {
		// Create log string
		var log = getLog;
		$.post(baseUrl + "problem_reports", {
			clientuid : getClientUid(),
			version : version,
			log : log,
			desc : desc
		});
		
	} 
	
	var debouncedReportProblem = _.debounce(this.reportProblem, 5000, true);

	var oldError = console.error;
	console.error = function(arg) {
		oldError(arg);
		
		debouncedReportProblem("Internal Error");
	}

}
