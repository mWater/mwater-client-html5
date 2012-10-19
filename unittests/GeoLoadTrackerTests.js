(function() {
	module("GeoLoadTracker");
	var Rect = utils.Rect;

	test("basics", function() {
		var g = new GeoLoadTracker();
		
		g.recordLoaded(new Rect(0, 0, 10, 10));
		deepEqual(g.getNeeded(new Rect(0, 0, 10, 10)), []);
		deepEqual(g.getNeeded(new Rect(1, 1, 9, 9)), 
			[]);		
		deepEqual(g.getNeeded(new Rect(-1, -1, 11, 11)), 
			[{rect:new Rect(-1, -1, 11, 11), since: null}]);
		deepEqual(g.getNeeded(new Rect(-1, -1, 5, 5)), 
			[{rect:new Rect(-1, -1, 5, 5), since: null}]);
	});
	
	test("partial", function() {
		var g = new GeoLoadTracker();
		
		g.recordLoaded(new Rect(0, 0, 10, 10), "b");
		deepEqual(g.getNeeded(new Rect(0, 0, 10, 10)), 
			[{rect:new Rect(0, 0, 10, 10), since: "b"}]);
		deepEqual(g.getNeeded(new Rect(-1, -1, 11, 11)), 
			[{rect:new Rect(-1, -1, 11, 11), since: null}]);
	});

	test("partial-nested", function() {
		var g = new GeoLoadTracker();
		
		g.recordLoaded(new Rect(0, 0, 10, 10), "b");
		g.recordLoaded(new Rect(4, 4, 6, 6), "c");
		deepEqual(g.getNeeded(new Rect(4, 4, 6, 6)), 
			[{rect:new Rect(4, 4, 6, 6), since: "c"}]);
		deepEqual(g.getNeeded(new Rect(3, 4, 6, 6)), 
			[{rect:new Rect(3, 4, 6, 6), since: "b"}]);
	});
	
	test("lesser ignored", function() {
		var g = new GeoLoadTracker();
		
		g.recordLoaded(new Rect(0, 0, 10, 10), "b");
		g.recordLoaded(new Rect(0, 0, 10, 10), "a");
		deepEqual(g.getNeeded(new Rect(0, 0, 10, 10)), 
			[{rect:new Rect(0, 0, 10, 10), since: "b"}]);
	});

	test("complete wins", function() {
		var g = new GeoLoadTracker();
		
		g.recordLoaded(new Rect(0, 0, 10, 10), "b");
		g.recordLoaded(new Rect(0, 0, 10, 10), null);
		deepEqual(g.getNeeded(new Rect(0, 0, 10, 10)), 
			[]);
	});

})(); 