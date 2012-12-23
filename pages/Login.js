var pages = pages || {}

/* Login page of application */
pages.Login = function (success) {
    var page = this;
    
    function login() {
        page.$("#login_button").attr("disabled", true);

        var username = page.$("#login_username").val();
        var password = page.$("#login_password").val();
        page.syncServer.login(username, password, function() {
            if (success)
                success(username);
            else
                page.pager.closePage("Main");
        }, function() {
            alert("Login failed");
            page.$("#login_button").attr("disabled", false);
        });
    }
    
    function signup() {
        page.$("#signup_button").attr("disabled", true);

        var email = page.$("#signup_email").val();
        var username = page.$("#signup_username").val();
        var password = page.$("#signup_password").val();
        page.syncServer.signup(email, username, password, function() {
            if (success)
                success(username);
            else
                page.pager.closePage("Main");
        }, function() {
            alert("Signup failed");
            page.$("#signup_button").attr("disabled", false);
        });
    }

	this.create = function(callback) {
		this.template("login", null, function(out) {
			page.$el.html(out);
			
            page.$("#form_login").on("submit", function() {
                login();
                return false;
            });
			page.$("#form_signup").on("submit", function() {
                signup();
                return false;
            });
			callback();
		});
	};
};