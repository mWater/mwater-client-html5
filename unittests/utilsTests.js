(function() {
	module("utils");
	test("isToday", function() {
		ok(utils.isToday(new Date().getTime()));
	});

	module("utils.Rect");

	var Rect = utils.Rect;

	test("contains", function() {
		var a = new Rect(0, 0, 5, 5);
		var b = new Rect(0, 0, 1, 1);
		var c = new Rect(0, 0, 6, 4);
		var d = new Rect(-1, -1, 6, 6);

		ok(a.contains(b));
		ok(!b.contains(a));
		ok(!a.contains(c));
		ok(!c.contains(a));
	});

	test("contains-edge", function() {
		var a = new Rect(170, 0, -170, 5);
		var b = new Rect(0, 0, 1, 1);
		var c = new Rect(170, 0, 175, 5);
		var d = new Rect(175, 0, -175, 5);

		ok(!a.contains(b));
		ok(!b.contains(a));
		ok(a.contains(c));
		ok(a.contains(d));
		ok(!d.contains(a));
	});
})();
