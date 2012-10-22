/* Actionbar implemented in html in iOS style within twitter bootstrap navbar */
var HtmlActionBar = function(container, defaultTitle) {
	var menuCallback; 
	
	var html = '<div class="navbar navbar-inverse navbar-fixed-top">';
	html+='<div class="navbar-inner" style="padding-left: 10px; text-align:center">';
    html+='<div class="black">';
    html+='<div id="navbar_back" class="button bordered back pull-left">';
    html+='<span class="pointer"></span>';
    html+='<div class="content">Back</div></div></div>'; 
    html+='<ul class="nav pull-right" id="navbar_items"></ul>';
    html+='<span class="brand" id="navbar_brand" style="float:none; color:white"><span id="navbar_title"></span></span></div></div>';
	var navbar = $(html);
            
	container.prepend(navbar);
	
	navbar.find("#navbar_back").on("tap", function() {
		if (menuCallback)
			menuCallback("home");
	});
	
	this.menu = function(items, callback) {
		menuCallback = callback;
		
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
		if (enabled) {
			navbar.find("#navbar_back").show();
			navbar.find("#navbar_back > .content").text(prevTitle ? prevTitle : defaultTitle).show();
		}
		else
			navbar.find("#navbar_back").hide();
	};

}
