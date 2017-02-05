utils.observe($(".kix-appview-editor")[0], {
    childList: true,
    characterData: true,
    subtree: true
}, function (mutations) {
    if (meeting === null || !utils.getStorageItem("action-leave-tags", false, true)) return;

    var target = $(mutations[0].target);
    if (target.hasClass("kix-lineview-content")) {
        target = target.closest(".kix-lineview");
    }
    if (!target.hasClass("kix-lineview")) {
        return;
    }

    target.find("span").each(function () {
        if ($(this).attr("style") === "font-size:11pt;") {
            var word = $(this).find(".kix-wordhtmlgenerator-word-node");
            if (/^[a-zA-Z]*\d*$/.test(word.text().trim())) {
                var toSet = target.text().trim();
                toSet = toSet.substring(0, toSet.lastIndexOf("[")).trim();
                
                var taskId = action.task.getByTag(word.text().trim()).id;
                
                action.server.setTaskText(taskId, toSet);
            }
        }
    })
}, false);