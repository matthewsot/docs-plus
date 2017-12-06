docs.keyboard = {};

docs.keyboard.startBlockingMouse = function () {
    $(".kix-appview-editor").on("mousedown click mouseup mousemove mouseover", docs.utils.stopEvent);

    $(".kix-appview-editor").children().on("mousedown click mouseup mousemove mouseover", docs.utils.stopEvent);

    $("#attendees-dropdown, #action-button").on("mousedown", keyboard.escape);
};
docs.keyboard.stopBlockingMouse = function () {
    $(".kix-appview-editor").off("mousedown click mouseup mousemove mouseover").children().off("mousedown click mouseup mousemove mouseover");
    $("#attendees-dropdown, #action-button").off("mousedown", keyboard.escape);
};

docs.keyboard.startBlockingKeyboard = function () {
    $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").on("keydown", docs.keyboard.handleKeyboard);
};
docs.keyboard.stopBlockingKeyboard = function () {
    $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").off("keydown", docs.keyboard.handleKeyboard);
};

$(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").keydown(function (e) {
    if (!docs.keyboard.handleKeydown) return;

    if (typeof e.key === "undefined") {
        e.key = docs.utils.keyFromKeyCode(e.shiftKey, e.keyCode);
    }
    docs.keyboard.handleKeydown(e);
});
