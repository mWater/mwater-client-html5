i18n = {
	localizeField: function(field, value) {
		var key = field + "." + value;
		if (this[key])
			return i18n[key];
		return key;
	},
	"sources.source_type.0" : "Piped into dwelling",
	"sources.source_type.1" : "Piped into yard/plot",
	"sources.source_type.2" : "Public tap or standpipe",
	"sources.source_type.3" : "Tubewell",
	"sources.source_type.4" : "Borehole",
	"sources.source_type.5" : "Protected dug well",
	"sources.source_type.6" : "Protected spring",
	"sources.source_type.7" : "Rainwater catchment",
	"sources.source_type.8" : "Unprotected spring",
	"sources.source_type.9" : "Unprotected dug well",
	"sources.source_type.10" : "Cart with tank",
	"sources.source_type.11" : "Tanker-truck",
	"sources.source_type.12" : "Surface Water",
	"sources.source_type.13" : "Bottled Water",
	"sources.source_type.14" : "Public tank or basin",
	"sources.source_type.15" : "Supply network sampling point",
	
	"tests.test_type.0" : "Petrifilm E. coli",
	"tests.test_type.1" : "10mL Colilert",
	"tests.test_type.2" : "100mL E. coli",
	"tests.test_type.3" : "UNC Compartmentalized Bag",
	"tests.test_type.4" : "Chlorine",
	"tests.test_type.5" : "General Microbiology",
	"tests.test_type.6" : "EC Compact Dry Plate",
	
	"tests.test_type.5.type.ecoli" : "E. coli",
	"tests.test_type.5.type.total_coliforms" : "Total Coliforms",
	"tests.test_type.5.type.thermotolerant_coliforms" : "Thermotolerant Coliforms",
	"tests.test_type.5.type.enterococci" : "Enterococci",
	"tests.test_type.5.type.heterotrophic_plate_count" : "Heterotrophic Plate Count",
	"tests.test_type.5.type.faecal_streptococci" : "Faecal streptococci",
	"tests.test_type.5.type.clostridium_perfringens" : "Clostridium perfringens",
	
	"source_notes.operational.null" : "Unknown",
	"source_notes.operational.0" : "Broken",
	"source_notes.operational.1" : "Working",
	"source_notes.operational.false" : "Broken",
	"source_notes.operational.true" : "Working",
}

