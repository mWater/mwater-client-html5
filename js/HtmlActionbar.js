/* Actionbar implemented in html in iOS style within twitter bootstrap navbar */
var HtmlActionbar = function(container, opts) {
	opts = _.extend({
		defaultTitle : '',
		fixedTop : true,
	}, opts || {});

	// Create sync server
	var menuCallback; 
	
	var html = '<div class="navbar navbar-inverse' + (opts.fixedTop ? ' navbar-fixed-top' : '') + '">';
    html+='<a class="btn btn-navbar dropdown-toggle pull-right" data-toggle="dropdown" id="navbar_dropdown_button"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></a>';
    html+='<ul class="dropdown-menu pull-right" id="navbar_items_dropdown" role="menu"></ul>'
    html+='<ul class="nav pull-right" id="navbar_items"></ul>';
	html+='<div class="navbar-inner" style="padding-left: 10px; text-align:center">';
    html+='<div id="navbar_back" class="button bordered back pull-left">';
    html+='<span class="pointer"></span>';
    html+='<div class="content">Back</div></div>'; 
    html+='<span class="brand" id="navbar_brand" style="float:none; color:white"><span id="navbar_title"></span></span></div></div>';
    
	var navbar = $(html);
            
	container.prepend(navbar);
	if (opts.fixedTop)
		container.css("padding-top", "40px");

	navbar.find("#navbar_back").on("tap", function() {
		if (menuCallback)
			menuCallback("home");
	});
	
	this.menu = function(items, callback) {
		menuCallback = callback;
		
		navbar.find("#navbar_items").html('');
		navbar.find("#navbar_items_dropdown").html('');
		navbar.find("#navbar_dropdown_button").hide();
		
		_.each(items, function(item) {
			nitem = $('<li><a href="#">' + (item.icon ? '<img height="20" width="20" src="' + item.icon + '">' : '') + item.title + '</a></li>')
			nitem.click(function() {
				navbar.find('[data-toggle="dropdown"]').parent().removeClass('open');
				callback(item.id);
				return false;
			});

			if (item.ifRoom) 
				navbar.find("#navbar_items").append('<li class="divider-vertical"></li>').append(nitem);
			else {
				navbar.find("#navbar_dropdown_button").show();
				navbar.find("#navbar_items_dropdown").append(nitem);
			}
		});
	};

	this.title = function(title) {
		navbar.find("#navbar_title").text(title ? title : opts.defaultTitle);
	};

	this.up = function(enabled, prevTitle) {
		if (enabled) {
			navbar.find("#navbar_back").show();
			navbar.find("#navbar_back > .content").text(prevTitle ? prevTitle : opts.defaultTitle).show();
		}
		else
			navbar.find("#navbar_back").hide();
	};

}
