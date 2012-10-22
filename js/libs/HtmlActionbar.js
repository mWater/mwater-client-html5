/* Actionbar implemented in html in iOS style within twitter bootstrap navbar */
var HtmlActionBar = function(container, defaultTitle) {
	
	var navbar = $('<div class="navbar navbar-inverse navbar-fixed-top"> \
            <div class="navbar-inner" style="padding-left: 10px; text-align:center"> \
            <div class="black"> \
            <div id="navbar_back" class="button bordered back pull-left"> \
                    <span class="pointer"></span> \
                    <div class="content"> \
                        Back \
                    </div> \
                </div> \   
            </div> \ 
            <ul class="nav pull-right" id="navbar_items"> \
            </ul> \
            <span class="brand" id="navbar_brand" style="float:none; color:white"><span id="navbar_title"></span></span> \
            </div> \
            </div>');
            
	container.prepend(navbar);
	
	this.menu = function(items, callback) {
		navbar.find("#navbar_items").html('');
		_.each(items, function(item) {
			nitem = $('<li><a href="#">' + (item.icon ? '<img height="20" width="20" src="' + item.icon + '">' : '') + item.title + '</a></li>')
			nitem.click(function() {
				callback(item.id);
				return false;
			});

			navbar.find("#navbar_items").append(nitem);
		});
	};

	this.title = function(title) {
		navbar.find("#navbar_title").text(title ? title : defaultTitle);
	};

	this.up = function(enabled, prevTitle) {
		if (enabled)
			navbar.find("#navbar_back").text(prevTitle ? prevTitle : defaultTitle).show();
		else
			navbar.find("#navbar_back").hide();
	};

}
