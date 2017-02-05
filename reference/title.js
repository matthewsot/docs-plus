$("body").on("keyup", ".docs-title-input", function () {
    meetingsHub.server.setTopic(docs.name, meeting.link)
});