SurveyModel = Backbone.Model.extend({

});

Survey = Backbone.View.extend({
    className : "survey",
    template : _.template('<h2><%=title%></h2><ul class="breadcrumb"></ul><div class="sections"></div>' + '<button type="button" class="btn prev">Back <i class="icon-backward"></i></button>&nbsp;' + '<button type="button" class="btn btn-primary next">Next <i class="icon-forward icon-white"></i></button>'),

    initialize : function() {
        this.title = this.options.title;
        this.sections = this.options.sections;
        this.render();

        // Go to appropriate section TODO
        this.showSection(0);
    },

    events : {
        "tap .next" : "nextSection",
        "tap .prev" : "prevSection",
        "click a.section-crumb" : "crumbSection"
    },

    crumbSection : function(e) {
        // Go to section
        var index = parseInt(e.target.getAttribute("data-value"));
        this.showSection(index);
    },

    nextSection : function() {
        // Validate current section
        var section = this.sections[this.section];
        if (section.validate()) {
            this.showSection(this.section + 1);
        }
    },

    prevSection : function() {
        this.showSection(this.section - 1);
    },

    showSection : function(index) {
        this.section = index;

        _.each(this.sections, function(s) {
            s.$el.hide();
        });
        this.sections[index].$el.show();

        // Setup breadcrumbs
        var tmpl = '<% _.each(sections, function(s, i) { %> <li><a href="#" class="section-crumb" data-value="<%=i%>"><%=s.title%></a> <span class="divider">/</span></li> <% }); %>';
        var visibleSections = _.first(this.sections, index + 1);
        this.$(".breadcrumb").html(_.template(tmpl, {
            sections : _.initial(visibleSections)
        }) + _.template('<li class="active"><%=title%></li>', _.last(visibleSections)));

        // Setup next/prev buttons
        this.$(".prev").toggle(index > 0);
        this.$(".next").toggle(index < this.sections.length - 1);
    },

    render : function() {
        this.$el.html(this.template(this));

        // Add sections
        var sectionsEl = this.$(".sections");
        _.each(this.sections, function(s) {
            sectionsEl.append(s.$el);
        });

        return this;
    }

});

Section = Backbone.View.extend({
    className : "section",
    template : _.template('<h3><%=title%></h3><div class="contents"></div>'),

    initialize : function() {
        this.title = this.options.title;
        this.contents = this.options.contents;

        // Always invisible initially
        this.$el.hide();
        this.render();
    },

    validate : function() {
        // Get all visible items
        var items = _.filter(this.contents, function(c) {
            return c.visible && c.validate;
        });
        return !_.any(_.map(items, function(item) {
            return item.validate();
        }));
    },

    render : function() {
        this.$el.html(this.template(this));

        // Add contents (questions, mostly)
        var contentsEl = this.$(".contents");
        _.each(this.contents, function(c) {
            contentsEl.append(c.$el);
        });

        return this;
    }

});

Question = Backbone.View.extend({
    className : "question",

    template : _.template('<div class="prompt"><%=options.prompt%><%=renderRequired()%></div><div class="answer"></div>'),

    renderRequired : function() {
        if (this.required)
            return '<span class="required">*</span>';
        return '';
    },

    validate : function() {
        var val;

        // Check required
        if (this.required) {
            if (this.model.get(this.id) === undefined || this.model.get(this.id) === null ||
                this.model.get(this.id) === "")
                val = "Required";
        }

        // Check custom validation
        if (!val && this.options.validate) {
            val = this.options.validate();
        }

        // Show validation results TODO
        if (val) {
            this.$el.addClass("invalid");
        } else {
            this.$el.removeClass("invalid");
        }

        return val;
    },

    updateVisibility : function(e) {
        // slideUp/slideDown
        if (this.shouldBeVisible() && !this.visible)
            this.$el.slideDown();
        if (!this.shouldBeVisible() && this.visible)
            this.$el.slideUp();
        this.visible = this.shouldBeVisible();
    },

    shouldBeVisible : function() {
        if (!this.options.conditional)
            return true;
        return this.options.conditional(this.model);
    },

    initialize : function() {
        // Adjust visibility based on model
        this.model.on("change", this.updateVisibility, this);
        
        // Re-render based on model changes
        this.model.on("change:" + this.id, this.render, this);

        this.required = this.options.required;

        this.render();
    },

    render : function() {
        this.$el.html(this.template(this));

        // Render answer
        this.renderAnswer(this.$(".answer"));

        this.$el.toggle(this.shouldBeVisible());
        this.visible = this.shouldBeVisible();
        return this;
    }

});

RadioQuestion = Question.extend({
    events : {
        "checked" : "checked",
    },

    checked : function(e) {
        var index = parseInt(e.target.getAttribute("data-value"));
        var value = this.options.options[index][0];
        this.model.set(this.id, value);
    },

    renderAnswer : function(answerEl) {
        answerEl.html(_.template('<div class="radio-group"><%=renderRadioOptions()%></div>', this));
    },

    renderRadioOptions : function() {
        html = "";
        var i;
        for ( i = 0; i < this.options.options.length; i++)
            html += _.template('<div class="radio-button <%=checked%>" data-value="<%=position%>"><%=text%></div>', {
                position : i,
                text : this.options.options[i][1], 
                checked : this.model.get(this.id) === this.options.options[i][0] ? "checked" : ""
            });

        return html;
    }

});

MulticheckQuestion = Question.extend({
    events : {
        "checked" : "checked",
    },

    checked : function(e) {
        // Get all checked
        var value = [];
        var opts = this.options.options;
        this.$(".checkbox").each(function(index) {
            if ($(this).hasClass("checked"))
                value.push(opts[index][0]);
        });
        this.model.set(this.id, value);
    },

    renderAnswer : function(answerEl) {
        var i;
        for ( i = 0; i < this.options.options.length; i++)
            answerEl.append($(_.template('<div class="checkbox <%=checked%>" data-value="<%=position%>"><%=text%></div>', {
                position : i,
                text : this.options.options[i][1],
                checked : (this.model.get(this.id) && _.contains(this.model.get(this.id), this.options.options[i][0])) ? "checked" : ""
            })));
    }

});

TextQuestion = Question.extend({
    renderAnswer : function(answerEl) {
        answerEl.html(_.template('<input type="text"/>', this));
        answerEl.find("input").val(this.model.get(this.id));
    },

    events : {
        "change" : "changed"
    },
    changed : function() {
        this.model.set(this.id, this.$("input").val());
    }

});

NumberQuestion = Question.extend({
    renderAnswer : function(answerEl) {
        answerEl.html(_.template('<input type="number"/>', this));
        answerEl.find("input").val(this.model.get(this.id));
    },

    events : {
        "change" : "changed"
    },
    changed : function() {
        this.model.set(this.id, parseFloat(this.$("input").val()));
    }

});

PhotoQuestion = Question.extend({
    renderAnswer : function(answerEl) {
        answerEl.html(_.template('<img style="max-width: 100px;" src="images/camera-icon.jpg"/>', this));
    },

    events : {
        "tap img" : "takePicture"
    },

    takePicture : function() {
        alert("In an app, this would launch the camera activity as in mWater native apps.");
    }

});

DateQuestion = Question.extend({
    events : {
        "change" : "changed"
    },
    
    changed: function() {
        this.model.set(this.id, this.$el.find('input[name="date"]').val());
    },
    renderAnswer : function(answerEl) {
        answerEl.html(_.template('<input name="date" />', this));
        
        answerEl.find('input').val(this.model.get(this.id));
        
        answerEl.find('input').scroller({
            preset : 'date',
            theme : 'ios',
            display : 'modal',
            mode : 'scroller',
            dateOrder : 'mmD ddyy',
        });
    },

});

