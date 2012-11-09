var pages = pages || {}

/* Example survey */
pages.ExampleSurvey = function(uid) {
    var page = this;

    function createSurvey(model) {
        var sections = [];
        var questions = [];
        questions.push(new RadioQuestion({
            id : "q1",
            model : model,
            required : true,
            prompt : "Has post-installation water analysis EVER been completed for the site?",
            options : [[true, "Yes"], [false, "No"]],
        }));

        questions.push(new DateQuestion({
            id : "q2",
            model : model,
            required : true,
            prompt : "When was the last water analysis completed?",
            conditional : function(m) {
                return m.get("q1") === true;
            }

        }));

        questions.push(new RadioQuestion({
            id : "q3",
            model : model,
            required : true,
            prompt : "Are all of the water quality parameters below the threshold limits?",
            options : [[true, "Yes"], [false, "No"]],
            conditional : function(m) {
                return m.get("q1") === true;
            }
        }));

        questions.push(new MulticheckQuestion({
            id : "q4",
            model : model,
            prompt : "Which parameters exceed the limits?",
            options : [["tc", "Total Coliforms"], ["ecoli", "E.Coli"], ["turbidity", "Turbidity"], ["ph", "pH"], ["iron", "Iron"], ["other", "Other"]],
            conditional : function(m) {
                return m.get("q3") === false && m.get("q1") === true;
            }
        }));

        questions.push(new NumberQuestion({
            id : "q5",
            model : model,
            prompt : "What is the concentration of Total Coliforms?",
            conditional : function(m) {
                return m.get("q3") === false && m.get("q4") && _.contains(m.get("q4"), "tc") && m.get("q1") === true;
            }
        }));

        questions.push(new NumberQuestion({
            id : "q6",
            model : model,
            prompt : "What is the concentration of E. Coli?",
            conditional : function(m) {
                return m.get("q3") === false && m.get("q4") && _.contains(m.get("q4"), "ecoli") && m.get("q1") === true;
            }
        }));

        questions.push(new NumberQuestion({
            id : "q7",
            model : model,
            prompt : "What is the turbidity?",
            conditional : function(m) {
                return m.get("q3") === false && m.get("q4") && _.contains(m.get("q4"), "turbidity") && m.get("q1") === true;
            }
        }));
        
        questions.push(new NumberQuestion({
            id : "q8",
            model : model,
            prompt : "What is the pH?",
            conditional : function(m) {
                return m.get("q3") === false && m.get("q4") && _.contains(m.get("q4"), "ph") && m.get("q1") === true;
            }
        }));
        
        questions.push(new NumberQuestion({
            id : "q9",
            model : model,
            prompt : "What is the concentration of iron?",
            conditional : function(m) {
                return m.get("q3") === false && m.get("q4") && _.contains(m.get("q4"), "iron") && m.get("q1") === true;
            }
        }));

        sections.push( section = new Section({
            title : "Water Quality",
            contents : questions
        }));

        questions = []
        questions.push(new RadioQuestion({
            id : "q10",
            model : model,
            prompt : "Is there a cover for the system?",
            options : [[true, "Yes"], [false, "No"]],
        }));

        questions.push(new RadioQuestion({
            id : "q11",
            model : model,
            prompt : "Is there a lock and key for the cover?",
            options : [[true, "Yes"], [false, "No"]],
            conditional : function(m) {
                return m.get("q10") === true;
            }

        }));

        questions.push(new RadioQuestion({
            id : "q12",
            model : model,
            prompt : "Was the cover locked when you arrived on site?",
            options : [[true, "Yes"], [false, "No"]],
            conditional : function(m) {
                return m.get("q10") === true && m.get("q11") === true;
            }

        }));

        questions.push(new RadioQuestion({
            id : "q13",
            model : model,
            prompt : "Is there ANY dust built up on the system?",
            options : [[true, "Yes"], [false, "No"]],
        }));

        questions.push(new RadioQuestion({
            id : "q14",
            model : model,
            prompt : "Is there ANY grease collected on the system?",
            options : [[true, "Yes"], [false, "No"]],
        }));

        questions.push(new PhotoQuestion({
            id : "q15",
            model : model,
            prompt : "Please take a picture of any dust or grease on the system.",
            conditional : function(m) {
                return m.get("q13") === true || m.get("q14") === true;
            }
        }));

        sections.push( section = new Section({
            title : "Water System",
            contents : questions
        }));

        var survey = new Survey({
            title : "",
            sections : sections, 
            onFinish : function() {
                alert("Results recorded");
                page.pager.closePage();
            }
        });
        
        return survey;

    }

    this.create = function(callback) {
        this.template("example_survey", {}, function(out) {
            page.$el.html(out);

            // Create model
            page.surveyModel = new SurveyModel();

            // Save regularly
            page.surveyModel.on("change", function() {
                localStorage.setItem("examplesurvey", JSON.stringify(page.surveyModel.toJSON()));    
            });
            
            // Create survey
            page.survey = createSurvey(page.surveyModel);
            page.$(".page").append(page.survey.$el);

            callback();
        });

    };
    
    this.activate = function() {
        // Load model
        if (localStorage.getItem("examplesurvey")) {
            page.surveyModel.set(JSON.parse(localStorage.getItem("examplesurvey")))
        }
    };
    
    this.deactivate = function() {
        localStorage.setItem("examplesurvey", JSON.stringify(page.surveyModel.toJSON()));
    };
}; 