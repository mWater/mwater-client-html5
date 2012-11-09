Survey = Backbone.Model.extend({
    
});

SurveyView = Backbone.View.extend({
    className: "survey",
    template : _.template('<h2><%=title%></h2><ul class="breadcrumb"></ul><div class="sections"></div>' +
            '<button type="button" class="btn prev">Back <i class="icon-backward"></i></button>&nbsp;' +
            '<button type="button" class="btn btn-primary next">Next <i class="icon-forward icon-white"></i></button>'
            ),

    initialize : function() {
        this.title = this.options.title;
        this.sections = this.options.sections;
        this.render();
        
        // Go to appropriate section TODO
        this.showSection(0);
    },
    
    events : {
        "tap .next": "nextSection",
        "tap .prev": "prevSection",
        "click a.section-crumb": "crumbSection"},
    
    crumbSection : function(e) {
        // Go to section
        var index = parseInt(e.target.getAttribute("data-value"));
        this.showSection(index);
    },
    
    validateSection: function() {
        // TODO
        return true;
    },
    
    nextSection: function() {
        // Validate current section
        if (this.validateSection()) {
            this.showSection(this.section+1);        
        }
    },

    prevSection: function() {
        // Validate current section
        if (this.validateSection()) {
            this.showSection(this.section-1);        
        }
    },
    
    showSection: function(index) {
        this.section = index;
        
        _.each(this.sections, function(s) { s.$el.hide(); });
        this.sections[index].$el.show();
        
        // Setup breadcrumbs
        var tmpl = '<% _.each(sections, function(s, i) { %> <li><a href="#" class="section-crumb" data-value="<%=i%>"><%=s.title%></a> <span class="divider">/</span></li> <% }); %>';
        var visibleSections = _.first(this.sections, index+1); 
        this.$(".breadcrumb").html(_.template(tmpl, { sections: _.initial(visibleSections)})
         + _.template('<li class="active"><%=title%></li>', _.last(visibleSections)));
         
         // Setup next/prev buttons
    },

    render : function() {
        this.$el.html(this.template(this));
        
        // Add sections
        var sectionsEl = this.$(".sections");
        _.each(this.sections, function(s) { sectionsEl.append(s.$el); });
        
        return this;
    }
    
});

Section = Backbone.View.extend({
    className: "section",
    template : _.template('<h3><%=title%></h3><div class="contents"></div>'),

    initialize : function() {
        this.title = this.options.title;
        this.contents = this.options.contents;
        
        // Always invisible initially 
        this.$el.hide();
        this.render();
    },

    render : function() {
        this.$el.html(this.template(this));
        
        // Add contents (questions, mostly)
        var contentsEl = this.$(".contents");
        _.each(this.contents, function(c) { contentsEl.append(c.$el); });
        
        return this;
    }
});

Question = Backbone.View.extend({
    className : "question",

    template : _.template('<div class="prompt"><%=options.prompt%><%=renderRequired()%></div><div class="answer"><%=renderAnswer()%></div>'),
    
    renderRequired: function() {
        if (this.required)
            return '<span class="required">*</span>';
        return '';
    },
    
    validate: function() {
        if (this.options.validate)
            return this.options.validate();
        return true;  
    },
    
    updateVisibility: function() {
        // slideUp/slideDown  
        if (this.shouldBeVisible() && !this.visible)
            this.$el.slideDown();
        if (!this.shouldBeVisible() && this.visible)
            this.$el.slideUp();
        this.visible = this.shouldBeVisible();
    },
    
    shouldBeVisible: function() {
        if (!this.options.conditional)
            return true;
        return this.options.conditional(this.model);
    },

    initialize : function() {
        // Adjust visibility based on model
        this.model.on("change", this.updateVisibility, this);
        
        this.required = this.options.required;
        
        this.render();
    },

    render : function() {
        this.$el.html(this.template(this));
        
        if (!this.shouldBeVisible()) {
            this.$el.hide();
            this.visible = false;
        }
        return this;
    }

});

RadioQuestion = Question.extend({
    events: {
        "checked" : "checked",
    },
    
    checked: function(e) {
        var index = parseInt(e.target.getAttribute("data-value"));
        var value = this.options.options[index][0];
        this.model.set(this.id, value);        
    },
    
    renderAnswer : function() {
        return _.template('<div class="radio-group"><%=renderRadioOptions()%></div>', this);
    },

    renderRadioOptions : function() {
        html = "";
        var i;
        for ( i = 0; i < this.options.options.length; i++)
            html += _.template('<div class="radio-button" data-value="<%=position%>"><%=text%></div>', {
                position : i,
                text : this.options.options[i][1]
            });

        return html;
    }

});

MulticheckQuestion = Question.extend({
    events: {
        "checked" : "checked",
    },
    
    checked: function(e) {
        // Get all checked
        var value = [];
        var opts = this.options.options;
        this.$(".checkbox.checked").each(function(index) { value.push(opts[index][0]); });
        this.model.set(this.id, value);        
    },
    
    renderAnswer : function() {
        html = "";
        var i;
        for ( i = 0; i < this.options.options.length; i++)
            html += _.template('<div class="checkbox" data-value="<%=position%>"><%=text%></div>', {
                position : i,
                text : this.options.options[i][1]
            });

        return html;
    }

});

TextQuestion = Question.extend({
    renderAnswer : function() {
        return _.template('<input type="text"/>', this);
    },
    
    events : { "change" : "changed"},
    changed: function() {
        this.model.set(this.id, this.$("input").val());   
    }
});

NumberQuestion = Question.extend({
    renderAnswer : function() {
        return _.template('<input type="number"/>', this);
    },
    
    events : { "change" : "changed"},
    changed: function() {
        this.model.set(this.id, parseFloat(this.$("input").val()));   
    }
});
