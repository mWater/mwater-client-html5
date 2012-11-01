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
        var log = getLog();

        console.log("Reporting problem...");

        $.post(baseUrl + "problem_reports", {
            clientuid : getClientUid(),
            version : version,
            log : log,
            desc : desc
        });
    };

    // Capture error logs
    var debouncedReportProblem = _.debounce(this.reportProblem, 5000, true);

    var oldConsoleError = console.error;
    console.error = function(arg) {
        oldConsoleError(arg);

        debouncedReportProblem("Console Error");
    };

    // Capture window.onerror
    var oldWindowOnError = window.onerror;
    window.onerror = function(errorMsg, url, lineNumber) {
        console.log("window.onerror:" + errorMsg + ":" + url + ":" + lineNumber);
        that.reportProblem("Internal Error");
        
        // Put up alert instead of old action
        alert("Internal Error\n" + errorMsg + "\n" + url + ":" + lineNumber);
        //if (oldWindowOnError)
        //    oldWindowOnError(errorMsg, url, lineNumber);
    };
}

ProblemReporter.register = function(baseUrl, version, getClientUid) {
    if (!ProblemReporter.instances)
        ProblemReporter.instances = {}

    if (ProblemReporter.instances[baseUrl])
        return;

    new ProblemReporter(baseUrl, version, getClientUid);
}
