/* Obtains source codes from the server and manages a local store of them */

function SourceCodeManager(syncServer) {
	this.requestCode = function(success, error) {
		syncServer.requestSourceCodes(1, function(codes) {
			success(codes[0]);
		}, error);
	}

}
