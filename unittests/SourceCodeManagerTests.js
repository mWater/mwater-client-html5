(function () {
    module("SourceCodeManager");

    // Simple failure function
    function fail(error) {
        ok(false, "error: " + error.message);
        start();
    }

    var syncServer = {
         requestSourceCodes : function(number, success, error) {
             success(_.map(_.range(number), function(x) { return "" + x; }), 100);
         }
    };
    
    var mgr = new SourceCodeManager(syncServer);

    test("0 to start", function() {
        mgr.reset();
        equal(0, mgr.getNumberAvailableCodes(1)); 
    });

    asyncTest("Replenish codes", function() {
        mgr.reset();
        mgr.replenishCodes(10, function() {
            // 10 codes should be available
            equal(10, mgr.getNumberAvailableCodes(1));
            
            // All should expire by 60
            equal(10, mgr.getNumberAvailableCodes(59));
            equal(0, mgr.getNumberAvailableCodes(61));
            start();
        }, fail, 20);
    });

    asyncTest("Gets codes", function() {
        mgr.reset();
        mgr.replenishCodes(10, function() {
            // 10 codes should be available
            equal(10, mgr.getNumberAvailableCodes(1));
            
            mgr.requestCode(function(code) {
                equal(9, mgr.getNumberAvailableCodes(1));
                equal("0", code);
                start();
            }, fail, 1);
        }, fail, 20);
    });
})();
