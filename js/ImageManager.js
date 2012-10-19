/* cachePath: e.g. "Android/data/co.mwater.clientapp/images" */
function CachedImageManager(syncServer, cachePath) {
	this.syncServer = syncServer;
	this.cachePath = cachePath;
	var that = this;
	var fileTransfer = new FileTransfer();
	var fileSystem = null;

	function createDirs(baseDirEntry, path, success, error) {
		var segs = path.split("/");
		if (segs.length == 1)
			baseDirEntry.getDirectory(segs[0], {
				create : true
			}, success, error);
		else
			baseDirEntry.getDirectory(segs[0], {
				create : true
			}, function(dir) {
				createDirs(dir, segs.slice(1).join("/"), success, error);
			}, error);
	}

	// Gets a directory, creating if necessary. Call success with dirEntry
	function getDirectory(dir, success, error) {
		createDirs(fileSystem.root, dir, success, error);
	}

	function downloadImage(imageUid, url, dirEntry, success, error) {
		fileTransfer.download(encodeURI(url), dirEntry.fullPath + "/" + imageUid + ".jpg", function(entry) {
			success(entry.toURL());
		}, error);
	}

	function findImageFile(dir, imageUid, found, notfound, error) {
		console.log("checking in: " + dir);

		// Get directory
		getDirectory(dir, function(dirEntry) {
			// Get file if present
			dirEntry.getFile(imageUid + ".jpg", {}, function(imageFile) {
				// File present, display file
				found(imageFile.toURL());
			}, function(err) {
				if (err.code == FileError.NOT_FOUND_ERR)
					notfound();
				else
					error(err);
			});
		}, error);
	}

	function loadOrDownloadImage(dirs, remoteUrl, downloadDir, imageUid, success, error) {
		// If no directories left to try, call download
		if (dirs.length == 0) {
			getDirectory(downloadDir, function(dirEntry) {
				downloadImage(imageUid, remoteUrl, dirEntry, success, error);
			}, error);
			return;
		}

		// Try each directory in dirs, using recursion
		findImageFile(_.first(dirs), imageUid, function(url) {// Found
			success(url);
		}, function(url) {// Not found
			loadOrDownloadImage(_.rest(dirs), remoteUrl, downloadDir, imageUid, success, error);
		}, error);
	}

	/* Gets an image thumbnail, calling success with url */
	this.getImageThumbnailUrl = function(imageUid, success, error) {
		console.log("displayImageThumbnail:" + imageUid);
		loadOrDownloadImage([this.cachePath + "/cached/thumbnail", this.cachePath + "/cached/original", this.cachePath + "/pending/original"], syncServer.getImageThumbnailUrl(imageUid), this.cachePath + "/cached/thumbnail", imageUid, success, error);
	}

	/* Gets an image, calling success with url */
	this.getImageUrl = function(imageUid, success, error) {
		console.log("displayImage:" + imageUid);
		loadOrDownloadImage([this.cachePath + "/cached/original", this.cachePath + "/pending/original"], syncServer.getImageUrl(imageUid), this.cachePath + "/cached/original", imageUid, success, error);
	}


	this.addImage = function(uri, photoUid, success, error) {
		// TODO is this a url passed in or a file?
		fileSystem.root.getFile(uri, null, function(fileEntry) {
			// Copy file to pending folder
			getDirectory(that.cachePath + "/pending/original", function(dirEntry) {
				console.log("Moving file to: " + dirEntry.fullPath + "/" + photoUid + ".jpg");
				fileEntry.moveTo(dirEntry, photoUid + ".jpg", success, error);
			}, error);
		}, error);
	}

	// Upload one image to server. Progress is called with (number of images, % complete). Success is called
	// with number of images remaining.
	this.uploadImages = function(progress, success, error) {
		// Copy file to pending folder
		getDirectory(that.cachePath + "/pending/original", function(dirEntry) {
			// Get a list of all the entries in the directory
			dirEntry.createReader().readEntries(function(files) {
				if (files.length == 0) {
					success(0);
					return;
				}

				// Call progress
				progress(files.length, 0);

				// Upload file
				var ft = new FileTransfer();
				ft.upload(files[0].fullPath, encodeURI(syncServer.getImageUrl(files[0].name.split(".")[0])), function() {
					// Success uploading, delete file
					files[0].remove(function() {
						// File removed, call success
						success(files.length - 1);
					}, error);
				}, function(fileTransferError) {
					if (fileTransferError.http_status == 409) {
						// Image already exists, delete file
						// Success uploading, delete file
						files[0].remove(function() {
							// File removed, call success
							success(files.length - 1);
						}, error);
					} else
						error(fileTransferError);
				}, {
					fileKey : "image",
					params: {"clientuid" : syncServer.getClientUid()}
				});
			}, error);
		}, error);
	}


	this.init = function(success, error) {
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
			fileSystem = fs;
			success();
		}, error);
	}

}

function SimpleImageManager(syncServer) {
	this.init = function(success, error) {
		success();
	}


	this.getImageThumbnailUrl = function(imageUid, success, error) {
		success(syncServer.getImageThumbnailUrl(imageUid));
	}


	this.getImageUrl = function(imageUid, success, error) {
		success(syncServer.getImageUrl(imageUid));
	}

}
