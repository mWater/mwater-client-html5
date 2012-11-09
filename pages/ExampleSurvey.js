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
            prompt : "Answer this:",
            options : [[true, "Yes"], [false, "No"]],
        }));

        questions.push(new RadioQuestion({
            id : "q2",
            model : model,
            prompt : "Second question:",
            options : [[true, "Yes"], [false, "No"]],
            conditional : function(m) {
                return m.get("q1") === true;
            }

        }));

        questions.push(new MulticheckQuestion({
            id : "q3",
            model : model,
            prompt : "Third question:",
            options : [[true, "Yes"], [false, "No"]],
            conditional : function(m) {
                return m.get("q2") == false;
            }

        }));

        questions.push(new NumberQuestion({
            id : "q4",
            model : model,
            required : true,
            prompt : "Enter exact value:",
        }));

        sections.push( section = new Section({
            title : "Water Quality",
            contents : questions
        }));

        questions = []
        questions.push(new RadioQuestion({
            id : "q5",
            model : model,
            prompt : "Answer this:",
            options : [[true, "Yes"], [false, "No"]],
        }));
        questions.push(new RadioQuestion({
            id : "q6",
            model : model,
            prompt : "Second question:",
            options : [[true, "Yes"], [false, "No"]],
            conditional : function(m) {
                return m.get("q1") === true;
            }

        }));

        questions.push(new PhotoQuestion({
            id : "q7",
            model : model,
            prompt : "Take a photo:",
        }));

        sections.push( section = new Section({
            title : "Site",
            contents : questions
        }));

        var survey = new Survey({
            title : "",
            sections : sections
        });

        return survey;

    }


    this.create = function(callback) {
        this.template("example_survey", {}, function(out) {
            page.$el.html(out);

            // Create model
            var surveyModel = new SurveyModel();

            // Create survey
            var survey = createSurvey(surveyModel);

            page.$(".page").append(survey.$el);

            callback();
        });

    };
}; 