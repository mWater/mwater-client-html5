function Application(opts) {
    var that = this;
    var version = "MWATERVERSION";

    // Setup options
    opts = _.extend({
        localDb : true,
        serverUrl : "http://data.mwater.co/mwater/apiv2/",
        cacheImages : true,
        anchorState : true,
        initialPage : "Main",
        initialPageArgs : [],
        requireLogin : true,
        pageContainer : $("#page_container"),
        actionbar : undefined
    }, opts);

    // Create sync server
    var syncServer = new SyncServer(opts.serverUrl);

    // Open database
    var syncClient;
    if (opts.localDb) {
        var db = window.openDatabase("mwater", "1.0", "mWater", 1000000);

        // Create sync database
        this.syncDb = new SyncDb(db, MWaterSqlModel.tableDefs);

        // Create model
        this.model = new MWaterSqlModel(db, this.syncDb);

        // Create sync client
        syncClient = new SyncClient(this.syncDb, syncServer);
    } else {
        this.model = new MWaterApiModel(syncServer);
    }

    // Create problem reporter
    ProblemReporter.register(opts.serverUrl, version, function() {
        return syncServer.getClientUid();
    });

    // Create source code manager
    var sourceCodeManager = new SourceCodeManager(syncServer);

    // Create authorizer
    var auth = {
        canEdit : function(row) {
            return row.created_by == syncServer.getUsername();
        },
        canDelete : function(row) {
            return row.created_by == syncServer.getUsername();
        },
        canAdd : function(table) {
            return syncServer.loggedIn();
        }

    }

    // Load pages dynamically
    function pagerOnLoad(name, success, error) {
        if (pages && pages[name])
            success(pages[name]);
        else {
            jQuery.getScript("pages/" + name + ".js", function() {
                success(pages[name]);
            }).fail(function(jqxhr, settings, exception) {
                error(exception);
            });
        }
    }

    function error(err) {
        var errStr = "Unknown";
        if (err)
            errStr = err.message || err.code || err.statusText
        alert("Error: " + errStr)
        console.error(JSON.stringify(err));
    }

    if (opts.cacheImages) {
        var imageManager = new CachedImageManager(syncServer, "Android/data/co.mwater.clientapp/images");
    } else {
        var imageManager = new SimpleImageManager(syncServer);
    }
    
    this.createTemplate = function() {
        // Create template engine
        dust.onLoad = function(name, callback) {
            // Load from template
            $.get('templates/' + name + '.template', null, function(data) {
                callback(null, data);
            }, "text").error(function(error) {
                callback(error);
            });
        };
    
        var base = dust.makeBase({
            date : function(chunk, context, bodies, params) {
                function pad2(number) {
                    return (number < 10 ? '0' : '') + number
                }
    
                var d = new Date(params.value * 1000);
                return chunk.write(d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()));
            },
            loc : function(chunk, context, bodies, params) {
                if (params.field)
                    return chunk.write(i18n.localizeField(params.field, params.value));
                return chunk;
            }
    
        });
    
        return function(name, view, callback) {
            dust.render(name, base.push(view), function(err, out) {
                if (err)
                    error(err);
                else {
                    if ( typeof callback == "function")
                        callback(out);
                    else
                        callback.html(out);
                }
            });
        }
    };

    imageManager.init(function() {
        that.model.init(function() {
            // Create pager
            that.pager = new Pager(opts.pageContainer, {
                model : that.model,
                template : that.createTemplate(),
                syncClient : syncClient,
                syncServer : syncServer,
                imageManager : imageManager,
                sourceCodeManager : sourceCodeManager,
                error : error,
                auth : auth,
                appVersion : version
            }, opts.actionbar);

            that.pager.onLoad = pagerOnLoad;

            if (opts.anchorState) {
                // Save state to anchor
                that.pager.onStateChanged = function(state) {
                    window.location.href = "#" + JSON.stringify(state);
                };
            }

            // Listen for back button
            if (window.device && window.device.platform == "Android") {
                document.addEventListener("backbutton", function() {
                    that.pager.closePage();
                }, false);
            }

            // Check if logged in
            if (opts.requireLogin && !syncServer.loggedIn())
                that.pager.loadPage("Login", [function() {
                    that.pager.closePage(opts.initialPage, opts.initialPageArgs);
                }]);
            else if (opts.anchorState && window.location.hash)// Restore state if possible
                that.pager.setState(JSON.parse(decodeURIComponent(window.location.hash.substr(1))));
            else
                that.pager.loadPage(opts.initialPage, opts.initialPageArgs);

            // Check welcome message
            if (syncServer.loggedIn()) {
                syncServer.getWelcome(version, function(valid, message, fatal) {
                    if (!valid) {
                        // Force logout
                        syncServer.manualLogin("", "");
                        
                        // Go to login screen
                        that.pager.closePage("Login", [function() {
                            that.pager.closePage(opts.initialPage, opts.initialPageArgs);
                        }]);
                       return;
                    }                    
                    if (message)
                        alert(message);
                    if (fatal)
                        alert("Please exit application!");
                });
            }
        }, error);
    }, error);
}
