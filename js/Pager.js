/*
 * Maintains a stack of "pages" which are similar to activities in Android. All
 * pages reside in a container when active, and are detached when not visible.
 * context: Object whose members will be inserted into each page before create is called
 * container: DOM element wrapped in jQuery where to display pages.
 * 
 * Pages can have the following members, all optional:
 * 
 * create(callback): Called when the page is created. Should put elements inside page.$el jQuery element. Must call callback when completed.
 * 
 * activate(): Called on the page comes to the forefront, either immediately after being created or when a child page is closed.
 * 
 * deactivate(): Called when the page is no longer in the front, either from being closed or from a child page opening
 * 
 * destroy(): Called when the page is closed
 * 
 * actionbarMenu: List if actionbar items. Each item must contain id (string) and title (string).
 * Optional items include icon (url) and ifRoom (boolean: determines if shown in actionbar if room)
 * 
 * actionbarTitle: string of title of page
 * 
 * actionbarMenuClick(id): Called when item is clicked.
 * 
 */
Pager = function(container, context, actionbar) {
    this.container = container;
    this.context = context;

    var that = this;
    var pressedElem;

    // Make links and anything with class 'tappable' act on taps
    container.on("mousedown touchstart", "a,button,.tappable", function(e) {
        $(this).addClass("pressed");
        pressedElem = this;
    });

    container.on("mouseup touchleave touchend touchmove touchcancel scroll", function(e) {
        if (pressedElem) {
            $(pressedElem).removeClass("pressed");
            pressedElem = null;
        }
    });

    // Make checkboxes tappable
    container.on("tap", ".checkbox", function(e) {
        $(this).toggleClass("checked");
        $(this).trigger("checked");
    });

    // Make radio buttons tappable
    container.on("tap", ".radio-button", function(e) {
        // Find parent radiogroup
        $(this).parents(".radio-group").find(".radio-button").removeClass("checked");
        $(this).addClass("checked");
        $(this).trigger("checked");
    });

    // Prevent links from launching
    container.on("click", "a", function(e) {
        return false;
    })


    this.stack = new Array();
    this.state = new Array();

    this.activatePage = function() {
        var page = _.last(this.stack);

        // Create actionbar if present
        if (actionbar) {
            actionbar.menu(page.actionbarMenu || [], function(id) {
                if (id == "home")
                    that.closePage();
                else if (page.actionbarMenuClick)
                    page.actionbarMenuClick(id);
            });

            if (page.actionbarTitle)
                actionbar.title(page.actionbarTitle);
            else
                actionbar.title(null);

            actionbar.up(this.stack.length > 1, this.stack.length > 1 ? this.stack[this.stack.length - 2].actionbarTitle : null);
        }

        if (page.activate)
            page.activate();
    };

    // Try to load from pages global
    this.onLoad = function(name, success, error) {
        if (pages && pages[name])
            success(pages[name]);
        else
            error();
    };

    // Loads a page on top of existing pages. Pass name and args array
    // to create it. Default action is to look in global "pages"
    // for constructor with name
    this.loadPage = function(name, args, callback, onlyCreate) {
        console.log("Pager.loadPage(" + name + ", " + JSON.stringify(args) + ")");

        // Create page
        this.onLoad(name, function(constructor) {
            if (!onlyCreate) {
                // Hide current page
                if (that.stack.length > 0) {
                    if (_.last(that.stack).deactivate)
                        _.last(that.stack).deactivate();
                    _.last(that.stack).$el.detach();
                }
            }

            // Call constructor
            var page = Object.create(constructor.prototype);
            constructor.apply(page, args);

            // Set pager and context
            page.pager = that;
            _.extend(page, context);

            // Add new page
            that.stack.push(page);
            that.state.push({
                name : name,
                args : args
            });
            that.onStateChanged(that.state);

            function activatePage() {
                that.container.html('');
                that.container.append(page.$el);

                // Scroll to top
                container.parent().scrollTop(0)

                that.activatePage(page);
            }

            // Create page element and convenience selector
            page.$el = $('<div id="page"></div>');
            page.$ = function(sel) {
                return page.$el.find(sel);
            };

            // Create page
            if (page.create)
                page.create(function() {
                    if (!onlyCreate)
                        activatePage();
                    if (callback)
                        callback(page);
                });
            else if (!onlyCreate) {
                activatePage();
                if (callback)
                    callback(page);
            }
        }, function(error) {
            console.error("Unable to load page. " + JSON.stringify(error));
            alert("Unable to load page. " + error);
        });
    };

    /* Closes the top page, optionally replacing it with another page */
    this.closePage = function(replaceWith, args) {
        // Ignore if no pages would be left
        if (!replaceWith && this.stack.length <= 1)
            return;

        // If at least one page to close
        if (this.stack.length > 0) {
            var page = this.stack.pop();
            this.state.pop();
            this.onStateChanged(that.state);

            // Deactivate current page and destroy
            if (page.deactivate)
                page.deactivate();
            if (page.destroy)
                page.destroy();

            page.$el.remove();
        }

        if (replaceWith)
            this.loadPage(replaceWith, args);
        else if (this.stack.length > 0) {
            // Activate current page
            this.container.append(_.last(this.stack).$el);
            this.activatePage();
        }
    };

    // Sets the state
    this.setState = function(newstate) {
        // Create each page before last
        if (newstate.length > 1) {
            // Create page, but do not attach
            this.loadPage(_.first(newstate).name, _.first(newstate).args, function() {
                that.setState(_.rest(newstate));
            }, true);
        } else if (newstate.length > 0)
            this.loadPage(newstate[0].name, newstate[0].args);
    };


    this.onStateChanged = function(state) {
    };
};

// Makes rows of a table tappable
Pager.makeTappable = function(table, ontap) {
    table.on("tap", "tr", function(e) {
        ontap(this)
    });

    var pressedElem;

    table.on("mousedown touchstart", "tr", function(e) {
        $(this).addClass("pressed");
        pressedElem = this;
    });

    table.on("mouseup touchleave touchend touchmove touchcancel mousemove scroll", function(e) {
        if (pressedElem) {
            $(pressedElem).removeClass("pressed");
            _.delay(function() {
                $(pressedElem).removeClass("pressed");
                pressedElem = null;
            }, 100);
        }
    });
};

// Makes a table searchable with a searchbar
Pager.makeSearchable = function(table, searchbar) {
    searchbar.on("input change", function(ev) {
        var q = this.value;
        table.find("tr").each(function(i) {
            src = sources[i]
            if (src.name.toLowerCase().indexOf(q.toLowerCase()) == -1)
                $(this).hide();
            else
                $(this).show();
        });
    });
};
