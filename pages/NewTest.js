var pages = pages || {}

/* Creates a test */
pages.NewTest = function(sourceUid) {
	var page = this;

	function createTest(testType) {

		function createTestForSample(sampleUid) {
			uid = utils.createUid();

			// Create test
			test = {
				uid : uid,
				test_type : testType,
				test_version : 1,
				sample : sampleUid,
				started_on : Math.floor(new Date().getTime() / 1000),
				created_by : page.syncServer.getUsername()
			};

			page.model.transaction(function(tx) {
				page.model.insertRow(tx, "tests", test);
			}, page.error, function() {
				page.pager.closePage("Test_" + testType, [uid]);
			});
		}

		// If for source, create/find sample
		if (sourceUid) {
			// Get samples and see if one already present for same day
			page.model.querySamplesAndTests(sourceUid, function(samples) {
				if (samples.length > 0 && utils.isToday(_.last(samples).sampled_on * 1000)) {
					// Use existing sample
					createTestForSample(_.last(samples).uid);
					return;
				}

				// Create new sample
				var sampleUid = utils.createUid();

				// Create sample
				sample = {
					uid : sampleUid,
					source : sourceUid,
					sampled_on : Math.floor(new Date().getTime() / 1000),
					created_by : page.syncServer.getUsername()
				};
				page.model.transaction(function(tx) {
					page.model.insertRow(tx, "samples", sample);
				}, page.error, function() {
					createTestForSample(sampleUid);
				});

			}, page.error);
		} else
			createTestForSample(null);
	}


	this.create = function(callback) {
		this.template("new_test", {}, function(out) {
			page.$el.html(out);

			page.$("a").on("tap", function() {
				createTest(parseInt(this.id.substr(5)));
				return false;
			});

			callback();
		});
	};
};
