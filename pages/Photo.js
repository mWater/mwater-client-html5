var pages = pages || {}

/* Displays a photo */
pages.Photo = function(uid) {
	var page = this;
	
	this.create = function(callback) {
		this.template("photo", null, function(out) {
			page.$el.html(out);

			page.imageManager.getImageUrl(uid, function(url) {
				page.$("#message_bar").hide();
				page.$("#image").attr("src", url).show();
			}, page.error);

			callback();
		});
	}
}
