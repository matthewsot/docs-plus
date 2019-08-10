docs.keyboard = {
    "blockedKeydown_": function (e) {
        if (e.docs_plus_) {
            return;
        }
        if (!docs.keyboard.blockedKeydown) {
            return;
        }
        if (typeof e.key === "undefined") {
            e.key = docs.utils.keyFromKeyCode(e.shiftKey, e.keyCode);
        }
        docs.keyboard.blockedKeydown(e);
    },
    "unblockedKeydown_": function (e) {
        if (e.docs_plus_) {
            return;
        }
        if (!docs.keyboard.unblockedKeydown) {
            return;
        }
        if (typeof e.key === "undefined") {
            e.key = docs.utils.keyFromKeyCode(e.shiftKey, e.keyCode);
        }
        docs.keyboard.unblockedKeydown(e);
    },
};

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
    if (docs.keyboard.blockedKeydown) {
        $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").on("keydown", docs.keyboard.blockedKeydown_);
    }
    if (docs.keyboard.unblockedKeydown) {
        $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").off("keydown", docs.keyboard.unblockedKeydown_);
    }
};
docs.keyboard.stopBlockingKeyboard = function () {
    if (docs.keyboard.blockedKeydown) {
        $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").off("keydown", docs.keyboard.blockedKeydown_);
    }
    if (docs.keyboard.unblockedKeydown) {
        $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").on("keydown", docs.keyboard.unblockedKeydown_);
    }
};

$(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").on("keydown", docs.keyboard.unblockedKeydown_);

docs.keyboard.pressKey = function (keyCode) {
    var el = document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentDocument;
    var data = {"keyCode": keyCode};
    var is_command = (keyCode <= 46);
    var key_event;
    if (is_command) {
        key_event = new KeyboardEvent("keydown", data);
    } else {
        key_event = new KeyboardEvent("keypress", data);
    }

    key_event.docs_plus_ = true;
    el.dispatchEvent(key_event);
};

docs.keyboard.typeLetters = function (text) {
    for (var i = 0; i < character.length; i++) {
        docs.keyboard.pressKey(text.charCodeAt(i));
    }
};

docs.keyboard.backspace = function (counts) {
    docs.keyboard.pressKey(8);
};
