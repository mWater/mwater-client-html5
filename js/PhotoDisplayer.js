/* Handles displaying a photo in a thumbnail and respond to taps on it.
 * element: image element wrapped in jquery
 * imageManager: ImageManager
 * model: MWater model
 * row: row containing "photo" field
 * error: called when error has occurred */
function PhotoDisplayer(page, element, row, error) {
	function takePicture() {
		if (!navigator.camera) {
			alert("Camera not available");
			return;
		}

		function pictureFail() {
			console.error("Failed to take picture");
			alert("Failed to take picture");
		}

		function pictureSucceed(uri) {
			console.log("Succeeded to take picture");

			var photoUid = utils.createUid();

			// Add to image manager
			page.imageManager.addImage(uri, photoUid, function() {
				// Set in row
				page.model.transaction(function(tx) {
					page.model.updateRow(tx, row, {
						photo : photoUid
					});
				}, error, function() {
					row.photo = photoUid;
					displayPhoto();
				});
			}, error);
		}

		// Start get picture
		console.log("About to take picture");
		navigator.camera.getPicture(pictureSucceed, pictureFail, {
			quality : 50,
			destinationType : Camera.DestinationType.FILE_URI,
		});
	}

	function displayPhoto() {
		// Load image
		if (row.photo) {
			page.imageManager.getImageThumbnailUrl(row.photo, function(url) {
				element.attr("src", url);
			}, function() {
				element.attr("src", "images/no-image-icon.jpg");
			});
		}
		else {
			element.attr("src", "images/camera-icon.jpg");
		}
	}

	// Load image
	displayPhoto();

	// Listen for clicks to take photo
	element.on("tap", function() {
		if (row.photo)
			page.pager.loadPage("Photo", [row.photo]);
		else
			takePicture();
	});
}
