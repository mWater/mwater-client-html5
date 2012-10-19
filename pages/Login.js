var pages = pages || {}

/* Login page of application */
pages.Login = function () {
}

_.extend(pages.Login.prototype, {
	create : function(callback) {
		var page = this;
		this.template("login", null, function(out) {
			page.$el.html(out);
			
			page.$("#login_button").on("tap", function() {
				page.$("#login_button").attr("disabled", true);

				var username = page.$("#login_username").val();
				var password = page.$("#login_password").val();
				page.syncServer.login(username, password, function() {
					page.pager.closePage("Main");
				}, function() {
					alert("Login failed");
					page.$("#login_button").attr("disabled", false);
				});
				return false;
			});
			page.$("#signup_button").on("tap", function() {
				page.$("#signup_button").attr("disabled", true);

				var email = page.$("#signup_email").val();
				var username = page.$("#signup_username").val();
				var password = page.$("#signup_password").val();
				page.syncServer.signup(email, username, password, function() {
					page.pager.closePage("Main");
				}, function() {
					alert("Signup failed");
					page.$("#signup_button").attr("disabled", false);
				});
				return false;
			});
			callback();
		});
	}
}); 