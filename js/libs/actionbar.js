/**
 * cordova ActionBar plugin
 * Copyright (c) Clayton Grassick 2012
 *
 */
var ActionBar = function() { 
};

ActionBar.prototype.menu = function(items, callback) {
	return cordova.exec(
		callback,
		function(args) {
		        alert("fail: "+ args);
		},
		'ActionBar', 'menu', items);
};

ActionBar.prototype.title = function(title) {
	return cordova.exec(
		function() {},
		function(args) {
		        alert("fail: "+ args);
		},
		'ActionBar', 'title', [title]);
};

// Sets enable state of up button
ActionBar.prototype.up = function(enabled) {
	return cordova.exec(
		function() {},
		function(args) {
		        alert("fail: "+ args);
		},
		'ActionBar', 'up', [enabled]);
};

cordova.addConstructor(function() {
	window.actionbar = new ActionBar();
	
	// backwards compatibility	
	window.plugins = window.plugins || {};
	window.plugins.actionbar = window.actionbar;
});