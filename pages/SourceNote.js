var pages = pages || {}

/* Displays details of a source note */
pages.SourceNote = function(sourceUid, uid) {
	var page = this;
	var note;

	function setupEvents() {
		// Listen for save
		page.$("#save_button").on("tap", function() {
			// Read values
			note.note = page.$("#note").val();
			note.operational = page.$("#operational").val();
			if (note.operational === "")
				note.operational = null;

			page.model.transaction(function(tx) {
				// Insert if required
				if (!note.uid) {
					note.uid = utils.createUid();
					note.created_on = Math.floor(new Date().getTime() / 1000);
					note.source = sourceUid;
					note.created_by = page.syncServer.getUsername();
					page.model.insertRow(tx, "source_notes", note);
				} else {
					page.model.updateRow(tx, note, {
						note : note.note,
						operational : note.operational
					});
				}
			}, page.error, function() {
				page.pager.closePage();
			});
		});

		// Listen for cancel results
		page.$("#cancel_button").on("tap", function() {
			page.pager.closePage();
		});
	}


	this.activate = function(callback) {
		function displayNote() {
			page.template("source_note", note, function(out) {
				page.$el.html(out);

				page.$("#note").val(note.note);
				page.$("#operational").val(note.operational);

				if (uid && !page.auth.canEdit(note))
					page.$("#save_button").attr("disabled", true);

				setupEvents();
			}, page.error);
		}

		// If existing, load
		if (uid) {
			page.model.querySourceNoteByUid(uid, function(n) {
				note = n;
				displayNote();
			}, page.error);
		} else {
			note = {};
			displayNote();
		}
	}


	this.actionbarMenu = [{
		id : "delete",
		title : "Delete",
	}];

	this.actionbarTitle = "Source Note";

	this.actionbarMenuClick = function(id) {
		var page = this;
		if (id == "delete") {
			if (!note.uid)
				page.pager.closePage();

			if (!page.auth.canDelete(note)) {
				alert("Insufficient permissions");
				return;
			}

			if (confirm("Permanently delete note?")) {
				page.model.transaction(function(tx) {
					page.model.deleteRow(tx, note);
				}, page.error, function() {
					page.pager.closePage();
				});
			}
		}
	}

}
