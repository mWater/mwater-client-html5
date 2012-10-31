/* Obtains source codes from the server and manages a local store of them */

function SourceCodeManager(syncServer) {
    
    // Gets list of cached source codes in form { code:<code>, expiry:<expiry in s since epoch> }
    function getLocalCodes() {
        if (localStorage.getItem("sourceCodes") == "")
            return [];
        return JSON.parse(localStorage.getItem("sourceCodes"));
    }
    
    // Sets list of cached source codes in form { code:<code>, expiry:<expiry in s since epoch> }
    function setLocalCodes(codes) {
        localStorage.setItem("sourceCodes", JSON.stringify(codes));
    }
    
    // Purge expired code
    function purgeCodes(cutoff) {
        setLocalCodes(_.reject(getLocalCodes(), function(item) {
            return item.expiry < cutoff; 
        }));
    }
    
    // Replenish codes from server to have a minimum of x available
    this.replenishCodes = function(minNumber, success, error, now) {
        var now = now || (new Date()).getTime()/1000;

        // Purge old codes
        purgeCodes(now);

        // Determine how many are needed
        var numNeeded = minNumber - getLocalCodes().length;

        // If have enough
        if (numNeeded <= 0) {
            success();
            return;
        } 
            
        // Request new codes
        syncServer.requestSourceCodes(numNeeded, function(codes, expiry) {
            // Add to local storage, halfing expiry time to be safe
            var newitems = _.map(codes, function(code) {
               return { code: code, expiry : (expiry - now) / 2 + now };   
            });
            
            setLocalCodes(getLocalCodes().concat(newitems));
            success();
        }, error);
    };

    this.getNumberAvailableCodes = function(now) {
        now = now || (new Date()).getTime()/1000;
        purgeCodes(now);
        
        return getLocalCodes().length;
    };
    
	this.requestCode = function(success, error, now) {
	    // Replenish codes to have at least one
	    this.replenishCodes(1, function() {
	        var codes = getLocalCodes();
	        
	        // Remove first code
	        setLocalCodes(_.rest(codes));
	        success(_.first(codes).code); 
	    }, error, now);
	};
	
	// Reset all codes cached
	this.reset = function() {
	    setLocalCodes([]);
	}
}
