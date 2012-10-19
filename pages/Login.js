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

				var username = page.$("#login [name='username']").val();
				var password = page.$("#login [name='password']").val();
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

				var email = page.$("#signup [name='email']").val();
				var username = page.$("#signup [name='username']").val();
				var password = page.$("#signup [name='password']").val();
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