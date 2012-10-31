var pages = pages || {}

/* Settings page of application */
pages.Settings = function() {
    var page = this;

    this.create = function(callback) {
        this.template("settings", null, function(out) {
            page.$el.html(out);

            page.$("#auto_sync").toggleClass("checked", localStorage.getItem("auto_sync") != "false");
            page.$("#auto_sync").on("checked", function() {
                localStorage.setItem("auto_sync", page.$("#auto_sync").hasClass("checked") ? "true" : "false");
            });
            

            if (!(page.model instanceof MWaterSqlModel))
                page.$("#reset_database_block").hide();

            page.$("#reset_database").on("tap", function() {
                if (confirm("Completely reset local database?"))
                    page.model.reset(function() {
                        alert("Reset complete");
                    }, page.error);
            });

            callback();
        });
    };
};
