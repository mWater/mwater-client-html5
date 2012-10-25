sampleanalysis = {};
(function() {
	sampleanalysis.getAnalyses = function(sample) {
		analyses = []
		anl = sampleanalysis.getEcoliAnalysis(sample);
		if (anl != null)
			analyses.push(anl);
		return analyses;
	};

	sampleanalysis.getEcoliAnalysis = function(sample) {
		// Analyse E.Coli
		var emin = null
		var emax = null
		_.each(sample.tests, function(test) {
			range = getEcoliRange(test);
			if (emin == null || (range.min && range.min > emin))
				emin = range.min;
			if (emax == null || (range.max && range.max < emax))
				emax = range.max;
		});
		// If min or max found, record analysis
		if (emin || emax) {
			anl = {
				name : "E.Coli",
				namestyle : "font-style:italic;"
			}

			var uncertain = false;
			if (emin && emax && emax < emin + 1) {
				emax = emin + 1;
				uncertain = true;
			}

			anl.color = getEcoliColor(emax);
			anl.risk = getEcoliRisk(emax);

			if (emin && emax) {
				if (uncertain)
					anl.text = emin + " CFU/100ml";
				else if (emax == emin + 1)
					anl.text = emin + " CFU/100ml";
				else
					anl.text = emin + "-" + (emax - 1) + " CFU/100ml";
			} else if (emax)
				anl.text = "<" + emax + " CFU/100ml";
			else if (emin)
				anl.text = ">=" + emin + " CFU/100ml";
			return anl;
		}
		return null;
	};


	/* Summarizes into summary and color */
	sampleanalysis.summarizeTest = function(test) {
		if (!test.results) {
			return {
				text : "Pending"
			};
		}

		var results = $.parseJSON(test.results)
		
		// Create sample to analyse
		var sample = {
			tests : [test]
		}
		var anl = sampleanalysis.getEcoliAnalysis(sample);

		
		if (test.test_type == 4) // Chlorine
		{
			if (results.positive)
				return {
					text : "Positive",
					color : "Green"
				};
			else
				return {
					text : "Negative",
					color : "Red"
				};
		}

		if (test.test_type == 5) // General
		{
			return {
				text: i18n.localizeField("tests.test_type.5.type", results.type) + ": " + results.value + "/100mL",
				color: anl ? anl.color : null
			}
		}

		if (!anl)
			return {
				text : ""
			};
		else
			return {
				text : anl.text,
				color : anl.color
			};
	}

	function getEcoliRisk(level) {
		if (level == null)
			return 0;
		if (level <= 1)
			return 1;
		if (level <= 10)
			return 2;
		if (level <= 100)
			return 3;
		if (level <= 1000)
			return 4;
		return 5;
	}

	function getEcoliRange(test) {
		// Gets range of ecoli results (>=min, <max)
		if (!test.results)
			return {
				min : null,
				max : null
			};

		var results = $.parseJSON(test.results)
		var ecoli = 0
		if (test.test_type == 0) {// Petrifilm
			ecoli = null
			if (results.autoEcoli)
				ecoli = results.autoEcoli;
			if (results.manualEcoli)
				ecoli = results.manualEcoli;
			if (ecoli == null)
				return {
					min : null,
					max : null
				};
			return {
				min : ecoli * test.dilution * 100,
				max : ((ecoli + 1) * test.dilution * 100)
			};
		}
		if (test.test_type == 1) {// 10ml Colilert
			if (results.ecoli == true)
				return {
					min : test.dilution * 10,
					max : null
				};
			if (results.ecoli == false)
				return {
					min : null,
					max : test.dilution * 10
				};
			return {
				min : null,
				max : null
			};
		}
		if (test.test_type == 2) {// 100ml Colilert
			if (results.ecoli == true)
				return {
					min : test.dilution,
					max : null
				};
			if (results.ecoli == false)
				return {
					min : null,
					max : test.dilution
				};
			return {
				min : null,
				max : null
			};
		}
		if (test.test_type == 5) {// General microbiology
			if (results.type == "ecoli")
				return {
					min : test.dilution * results.value,
					max : test.dilution * results.value
				};
		}

		return {
			min : null,
			max : null
		};
	}

	function getEcoliColor(level) {
		if (level == null)
			return "#FF4040";
		if (level <= 1)
			return "#62B9FC";
		if (level <= 10)
			return "#40FF40";
		if (level <= 100)
			return "#FFFF40";
		if (level <= 1000)
			return "#FFA040";
		return "#FF4040";
	}

})();
