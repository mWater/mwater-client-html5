var pages = pages || {}

/* Displays a list of my tests */
pages.Tests = function() {
	var page = this;

	this.create = function(callback) {
		this.template("tests", null, function(out) {
			page.$el.html(out);

			Pager.makeTappable(page.$("#table"), function(row) {
				// Get test
				page.model.queryTestByUid(row.id, function(test) {
					page.pager.loadPage("Test_" + test.test_type, [test.uid]);	
				}, page.error);
				
			});
			callback();
		});
	};

	this.activate = function() {
		this.refresh("");
	};

	this.refresh = function(query) {
		// Query sources
		// TODO query
		page.model.queryTests(page.syncServer.getUsername(), function(rows) {
			page.template("tests_rows", {
				"rows" : rows
			}, page.$("#table"));
		}, page.error);
	};

	this.actionbarMenu = [{
		id : "new",
		title : "New",
		icon : "images/new.png",
		ifRoom : true
	}];

	this.actionbarTitle = "My Tests";

	this.actionbarMenuClick = function(id) {
		if (id == "new")
		{
			if (confirm("Create a test not associated with a source?"))
				this.pager.loadPage("NewTest");
		}
	}

}

