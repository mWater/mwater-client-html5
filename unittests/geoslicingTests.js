(function() {
	module("geoslicing");

	test("rounding", function() {
		deepEqual(geoslicing.getSlices(10, 1, 109),
		["source.rect:-10,0,100,110",
		"source.rect:0,10,100,110",
		"source.rect:-10,0,110,120",
		"source.rect:0,10,110,120"]);
	});
	
	test("wrapping", function() {
		deepEqual(geoslicing.getSlices(10, 89, -179),
		["source.rect:80,-90,170,-180",
		"source.rect:-90,-80,170,-180",
		"source.rect:80,-90,-180,-170",
		"source.rect:-90,-80,-180,-170"]);
	});

})();
