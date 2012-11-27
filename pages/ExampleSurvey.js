var pages = pages || {}

/* Example survey */
pages.ExampleSurvey = function(uid) {
    var page = this;

    function createSurvey(model) {
        var survey = (function() {
            var model = new surveys.SurveyModel();
            var sections = [], questions = [];
            // START HERE

            /* Facility Type */

            questions.push(new surveys.DropdownQuestion({
                id : "q1",
                model : model,
                required : true,
                prompt : "What is the type of facility?",

                options : [["PipedWater", "Piped Water"], ["PipedWaterRes", "Piped Water with Service Reservoir"], ["GravityFedPiped", "Gravity-fed Piped Water"], ["BoreholeMech", "Deep Borehole with Mechanized Pumping"], ["BoreholeHand", "Deep Borehole with Handpump"], ["ProtectedSpring", "Protected Spring"], ["DugWellPump", "Dug Well with Handpump/windlass"], ["TreatmentPlant", "Water Treatment Plant"]],
            }));

            sections.push(new surveys.Section({
                model : model,
                title : "Choose your survey",
                contents : questions
            }));
            questions = [];

            /* General Information */

            questions.push(new surveys.TextQuestion({
                id : "q2",
                model : model,
                prompt : "Cluster number?",
            }));

            questions.push(new surveys.TextQuestion({
                id : "q3",
                model : model,
                prompt : "Cluster name?",
            }));

            questions.push(new surveys.TextQuestion({
                id : "q4",
                model : model,
                prompt : "What is the name of the community?",
            }));

            questions.push(new surveys.DateQuestion({
                id : "q5",
                model : model,
                prompt : "Date of visit?",
            }));

            questions.push(new surveys.NumberQuestion({
                id : "q6",
                model : model,
                prompt : "How many water samples were taken?",

            }));
            questions.push(new surveys.NumberQuestion({
                id : "q7",
                model : model,
                prompt : "Water sample numbers?",

            }));
            questions.push(new surveys.NumberQuestion({
                id : "q8",
                model : model,
                prompt : "FC/100ml?",

            }));

            sections.push(new surveys.Section({
                model : model,
                title : "General Information",
                contents : questions
            }));

            questions = [];

            /* PipedWater Survey surveys.Section */

            questions.push(new surveys.RadioQuestion({

                id : "q9",
                model : model,
                required : true,
                prompt : "Do any tapstands leak?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q10",
                model : model,
                required : true,
                prompt : "Does surface water collect around any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q11",
                model : model,
                required : true,
                prompt : "Is the area uphill of any tapstand eroded?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q12",
                model : model,
                required : true,
                prompt : "Are pipes exposed close to any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q13",
                model : model,
                required : true,
                prompt : "Is human excreta on the ground within 10m of any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q14",
                model : model,
                required : true,
                prompt : "Is there a sewer within 30m of any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q15",
                model : model,
                required : true,
                prompt : "Has there been discontinuity in the last 10 days at any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q16",
                model : model,
                required : true,
                prompt : "Are there signs of leaks in the mains pipes in the cluster?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q17",
                model : model,
                required : true,
                prompt : "Do the community report any pipe breaks in the last week?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q18",
                model : model,
                required : true,
                prompt : "Is the main pipe exposed anywhere in the cluster?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            sections.push(new surveys.Section({
                model : model,
                title : "Piped Water Survey",
                contents : questions,
                conditional : function(m) {
                    return m.get("q1") === "PipedWater";
                }

            }));
            questions = [];

            /* PipedWaterRes Survey surveys.Section */

            questions.push(new surveys.RadioQuestion({

                id : "q19",
                model : model,
                required : true,
                prompt : "Do any standpipes leak at sample sites?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q20",
                model : model,
                required : true,
                prompt : "Does water collect around any sample site?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q21",
                model : model,
                required : true,
                prompt : "Is area uphill eroded at any sample site?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q22",
                model : model,
                required : true,
                prompt : "Are pipes exposed close to any sample site?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q23",
                model : model,
                required : true,
                prompt : "Is human excreta on ground within 10m of standpipe?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q24",
                model : model,
                required : true,
                prompt : "Sewer or latrine within 30m of sample site?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q25",
                model : model,
                required : true,
                prompt : "Has there been discontinuity within last 10 days at sample site?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q26",
                model : model,
                required : true,
                prompt : "Are there signs of leaks in sampling area?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q27",
                model : model,
                required : true,
                prompt : "Do users report pipe breaks in last week?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q28",
                model : model,
                required : true,
                prompt : "Is the supply main exposed in sampling area?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q29",
                model : model,
                required : true,
                prompt : "Do users report pipe breaks in last week?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q30",
                model : model,
                required : true,
                prompt : "Is the service reservoir cracked or leaking?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q31",
                model : model,
                required : true,
                prompt : "Are the air vents or inspection cover insanitary?",

                options : [[true, "Yes"], [false, "No"]],
            }));


            sections.push(new surveys.Section({
                model : model,
                title : "Piped Water with Service Reservoir Survey",
                contents : questions,
                conditional : function(m) {
                    return m.get("q1") === "PipedWaterRes";
                }

            }));
            questions = [];

            /* GravityFedPiped Survey surveys.Section */

            questions.push(new surveys.RadioQuestion({

                id : "q32",
                model : model,
                required : true,
                prompt : "Does the pipe leak between the source and storage tank?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q33",
                model : model,
                required : true,
                prompt : "Is the storage tank cracked, damaged or leak?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q34",
                model : model,
                required : true,
                prompt : "Are the vents and covers on the tank damaged or open?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q35",
                model : model,
                required : true,
                prompt : "Do any tapstands leak?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q36",
                model : model,
                required : true,
                prompt : "Does surface water collect around any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q37",
                model : model,
                required : true,
                prompt : "Is the area uphill of any tapstand eroded?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q38",
                model : model,
                required : true,
                prompt : "Are pipes exposed close to any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q39",
                model : model,
                required : true,
                prompt : "Is human excreta on the ground within 10m of any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q40",
                model : model,
                required : true,
                prompt : "Has there been discontinuity n the last 10 days at any tapstand?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q41",
                model : model,
                required : true,
                prompt : "Are there signs of leaks in the main supply pipe in the system?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q42",
                model : model,
                required : true,
                prompt : "Do the community report any pipe breaks in the last week?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q43",
                model : model,
                required : true,
                prompt : "Is the main supply pipe exposed anywhere in the system?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            sections.push(new surveys.Section({
                model : model,
                title : "Gravity-fed Piped Water Survey",
                contents : questions,
                conditional : function(m) {
                    return m.get("q1") === "GravityFedPiped";
                }

            }));
            questions = [];

            /* BoreholeMech Survey surveys.Section */

            questions.push(new surveys.RadioQuestion({

                id : "q44",
                model : model,
                required : true,
                prompt : "Is there a latrine or sewer within 100m of pumphouse?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q45",
                model : model,
                required : true,
                prompt : "Is the nearest latrine unsewered?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q46",
                model : model,
                required : true,
                prompt : "Is there any source of other pollution within 50m?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q47",
                model : model,
                required : true,
                prompt : "Is there an uncapped well within 100m?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q48",
                model : model,
                required : true,
                prompt : "Is the drainage around pumphouse faulty?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q49",
                model : model,
                required : true,
                prompt : "Is the fencing damaged allowing animal entry?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q50",
                model : model,
                required : true,
                prompt : "Is the floor of the pumphouse permeable to water?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q51",
                model : model,
                required : true,
                prompt : "Does water forms pools in the pumphouse?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q52",
                model : model,
                required : true,
                prompt : "Is the well seal insanitary?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            sections.push(new surveys.Section({
                model : model,
                title : "Deep Borehole with Mechanized Pumping Survey",
                contents : questions,
                conditional : function(m) {
                    return m.get("q1") === "BoreholeMech";
                }

            }));
            questions = [];


            /* BoreholeHand Survey surveys.Section */

            questions.push(new surveys.RadioQuestion({

                id : "q53",
                model : model,
                required : true,
                prompt : "Is there a latrine within 10m of the borehole?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q54",
                model : model,
                required : true,
                prompt : "Is there a latrine uphill of the borehole?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q55",
                model : model,
                required : true,
                prompt : "Are there any other sources of pollution within 10m of borehole? (e.g. animal breeding, cultivation, roads, industry etc)",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q56",
                model : model,
                required : true,
                prompt : "Is the drainage faulty allowing ponding within 2m of the borehole?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q57",
                model : model,
                required : true,
                prompt : "Is the drainage channel cracked, broken or need cleaning?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q58",
                model : model,
                required : true,
                prompt : "Is the fence missing or faulty?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q59",
                model : model,
                required : true,
                prompt : "Is the apron less than 1m in radius?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q60",
                model : model,
                required : true,
                prompt : "Does spilt water collect in the apron area?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q61",
                model : model,
                required : true,
                prompt : "Is the apron cracked or damaged?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q62",
                model : model,
                required : true,
                prompt : "Is the handpump loose at the point of attachment to apron?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            sections.push(new surveys.Section({
                model : model,
                title : "Deep Borehole with Handpump Survey",
                contents : questions,
                conditional : function(m) {
                    return m.get("q1") === "BoreholeHand";
                }

            }));
            questions = [];


            /* ProtectedSpring Survey surveys.Section */

            questions.push(new surveys.RadioQuestion({

                id : "q63",
                model : model,
                required : true,
                prompt : "Is the spring unprotected?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q64",
                model : model,
                required : true,
                prompt : "Is the masonary protecting the spring faulty?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q65",
                model : model,
                required : true,
                prompt : "Is the backfill area behind the retaining wall eroded?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q66",
                model : model,
                required : true,
                prompt : "Does spilt water flood the collection area?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q67",
                model : model,
                required : true,
                prompt : "Is the fence absent or faulty?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q68",
                model : model,
                required : true,
                prompt : "Can animals have access within 10m of the spring?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q69",
                model : model,
                required : true,
                prompt : "Is there a latrine uphill and/or within 30m of the spring?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q70",
                model : model,
                required : true,
                prompt : "Does surface water collect uphill of the spring?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q71",
                model : model,
                required : true,
                prompt : "Is the diversion ditch above the spring absent or non-functional?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q72",
                model : model,
                required : true,
                prompt : "Are there any other sources of pollution uphill of the spring? (e.g. solid waste)",

                options : [[true, "Yes"], [false, "No"]],
            }));

            sections.push(new surveys.Section({
                model : model,
                title : "Protected Spring Survey",
                contents : questions,
                conditional : function(m) {
                    return m.get("q1") === "ProtectedSpring";
                }

            }));
            questions = [];


            /* DugWellPump Survey surveys.Section */

            questions.push(new surveys.RadioQuestion({

                id : "q73",
                model : model,
                required : true,
                prompt : "Is there a latrine within 10m of the well?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q74",
                model : model,
                required : true,
                prompt : "Is the nearest latrine uphill of the well?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q75",
                model : model,
                required : true,
                prompt : "Is there any other source of pollution within 10m of well? (e.g. animal breeding, cultivation, roads, industry etc)",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q76",
                model : model,
                required : true,
                prompt : "Is the drainage faulty allowing ponding within 2m of the well?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q77",
                model : model,
                required : true,
                prompt : "Is the drainage channel cracked, broken or need cleaning?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q78",
                model : model,
                required : true,
                prompt : "Is the fence missing or faulty?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q79",
                model : model,
                required : true,
                prompt : "Is the cement less than 1m in radius around the top of the well?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q80",
                model : model,
                required : true,
                prompt : "Does spilt water collect in the apron area?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q81",
                model : model,
                required : true,
                prompt : "Are there cracks in the cement floor?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q82",
                model : model,
                required : true,
                prompt : "Is the handpump loose at the point of attachment to well head?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            questions.push(new surveys.RadioQuestion({

                id : "q83",
                model : model,
                required : true,
                prompt : "Is the well-cover insanity?",

                options : [[true, "Yes"], [false, "No"]],
            }));

            sections.push(new surveys.Section({
                model : model,
                title : "Dug Well with Handpump/windlass Survey",
                contents : questions,
                conditional : function(m) {
                    return m.get("q1") === "DugWellPump";
                }

            }));
            questions = [];


            /* Comments surveys.Section */

            questions.push(new surveys.TextQuestion({
                id : "q100",
                model : model,
                prompt : "Additional comments"
            }));

            questions.push(new surveys.TextQuestion({
                id : "q101",
                model : model,
                prompt : "Inspector name",
            }));

            sections.push(new surveys.Section({
                model : model,
                title : "Additional comments",
                contents : questions
            }));
            questions = [];


            // END HERE
            var view = new surveys.SurveyView({
                title : 'WHO UNICEF Sanitary Inspection and Pollution Risk Assessment',
                sections : sections,
                model : model
            });
            return {
                model : model,
                view : view
            };
        })();

        return survey;
    }


    this.create = function(callback) {
        this.template("example_survey", {}, function(out) {
            page.$el.html(out);

            page.survey = createSurvey();
            page.survey.view.options.onFinish = function() {
                alert("Results recorded");
                page.pager.closePage();
            };

            // Save regularly
            page.survey.model.on("change", function() {
                localStorage.setItem("examplesurvey", JSON.stringify(page.survey.model.toJSON()));
            });

            // Create survey
            page.$(".page").append(page.survey.view.$el);

            callback();
        });

    };

    this.activate = function() {
        // Load model
        if (localStorage.getItem("examplesurvey")) {
            page.survey.model.set(JSON.parse(localStorage.getItem("examplesurvey")))
        }
    };

    this.deactivate = function() {
        localStorage.setItem("examplesurvey", JSON.stringify(page.survey.model.toJSON()));
    };

    this.actionbarTitle = "Survey";

    this.actionbarMenu = [{
        id : "reset",
        title : "Reset",
    }];

    this.actionbarMenuClick = function(id) {
        if (id == "reset") {
            if (confirm("Reset entire survey?")) {
                page.survey.model.clear();
            }
        }
    }

};
