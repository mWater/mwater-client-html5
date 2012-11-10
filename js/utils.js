var utils = utils || {};

(function() {
	// Creates a 128-bit uid in hex
	utils.createUid = function() {
		s = "";
		var i;
		for (i = 0; i < 8; i++)
			s = s + Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
		return s;
	};

	utils.parseQuery = function() {
		var nvpair = {};
		var qs = window.location.search.replace('?', '');
		var pairs = qs.split('&');
		$.each(pairs, function(i, v) {
			var pair = v.split('=');
			nvpair[pair[0]] = pair[1];
		});
		return nvpair;
	};

	/* Simple rectangle */
	utils.Rect = function(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	};

	utils.Rect.prototype.contains = function(rect) {
		if (rect.y1 < this.y1 || rect.y2 > this.y2)
			return false;
		if (this.x2 >= this.x1) {
			return (rect.x1 <= rect.x2 && rect.x1 >= this.x1 && rect.x2 <= this.x2);
		}

		if (rect.x2 >= rect.x1) {
			return (rect.x1 >= this.x1 || rect.x1 <= this.x2) && (rect.x2 <= this.x2 || rect.x2 >= this.x1);
		}

		return (rect.x1 >= this.x1 && rect.x2 <= this.x2);
	};

	utils.Rect.prototype.pointWithin = function(x, y) {
		if (y < this.y1 || y > this.y2)
			return false;

		if (this.x2 >= this.x1) {
			return (x >= this.x1 && x <= this.x2);
		}

		return (x >= this.x1 || x <= this.x2);
	};

	// Gets string representing relative location of pt2 from pt1
	utils.getRelativeLocation = function (x1, y1, x2, y2) {
		// Convert to relative position (approximate)
		var dy = (y2 - y1) / 57.3 * 6371000;
		var dx = Math.cos(y1 / 57.3) * (x2 - x1) / 57.3 * 6371000;

		// Determine direction and angle
		var dist = Math.sqrt(dx * dx + dy * dy);
		var angle = 90 - (Math.atan2(dy, dx) * 57.3);
		if (angle < 0)
			angle += 360;
		if (angle > 360)
			angle -= 360;

		// Get approximate direction
		var compassDir = (Math.floor((angle + 22.5) / 45)) % 8;
		var compassStrs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

		if (dist > 1000)
			return (dist / 1000).toFixed(1) + "km " + compassStrs[compassDir];
		else
			return (dist).toFixed(0) + "m " + compassStrs[compassDir];
	};

	// Checks if a date is today
	utils.isToday = function(msSinceEpoch) {
		return new Date(msSinceEpoch).toLocaleDateString() == new Date().toLocaleDateString();
	};

})()
