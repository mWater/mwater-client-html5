var dragscroll = function() {
	var gesturesX = 0;
	var gesturesY = 0;

	var startPosition = 0;
	var velocity = 0;
	var isMouseDown = false;

	var timer;

	function GetVelocity() {
		velocity = startPosition - gesturesY;
	}


	$(document).mousemove(function(e) {
		gesturesX = parseInt(e.pageX, 10);
		gesturesY = parseInt(e.pageY, 10);
		$("#mouse").html(gesturesY);
		if (isMouseDown) {
			window.scrollBy(0, startPosition - gesturesY);
			return false;
		}
	});

	$(document).mousedown(function() {
		startPosition = gesturesY;
		isMouseDown = true;
		timer = window.setTimeout(GetVelocity, 50);
	});

	$(document).mouseup(function() {
		isMouseDown = false;
		if (velocity != 0) {
			$Body = $("body");
			var distance = velocity * 20;
			var scrollToPosition = $Body.scrollTop() + distance;
			$Body.eq(0).animate({
				scrollTop : scrollToPosition
			}, 1000);
			velocity = 0;
		}
		return false;
	});
}