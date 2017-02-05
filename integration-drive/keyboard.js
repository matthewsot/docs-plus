docs.keyboardDefaults = {
    hasExtraSpace: false,

    isSelectingName: false,
    
    _currNameText: "",

    isSelectingTime: false,
    
    _currTimeText: "",

    dateDividers: ["/", "-", "."],

    currCursorPosition: 0,
    
    selectedText: null
};

docs.keyboard = {
    get currNameText() {
        return this._currNameText;
    },
    
    set currNameText(text) {
        this._currNameText = text;
        keyboard.setInputText("@" + this._currNameText);
    },
    
    
    get currTimeText() {
        return this._currTimeText;
    },
    set currTimeText(text) {
        this._currTimeText = text;
        keyboard.setInputText("@" + this._currNameText + "#" + text);
    },
};

docs.keyboard.insertText = function (text) {
    if (!keyboard.selectedText) {
        docs.insertText(text);
    }
};
docs.keyboard.backspace = function (count) {
    if (!keyboard.selectedText) {
        docs.backspace(count);
    }
};

docs.keyboard.reset = function (props) {
    for (var prop in keyboardDefaults) {
        if (typeof props === "undefined" || props.indexOf(prop) !== -1) {
            keyboard[prop] = keyboardDefaults[prop];
        }
    }
};

docs.keyboard.createInput = function () {
    if ($("#action-inline-input").length <= 0) {
        $("body").append($("<div></div>", { "id": "action-inline-input" }));
        var offset = docs.getSelectionEl().offset();
        $("#action-inline-input").css({ "left": offset.left, "top": (offset.top + 5) });
    }
};

docs.keyboard.setInputText = function (text) {
    if (keyboard.selectedText !== null) {
        keyboard.createInput();
        $("#action-inline-input").text(text);
    }
};

docs.keyboard.detectFraction = function (text) {
    if (text.indexOf("/") === -1) {
        return false;
    }
    
    var numerator = parseInt(text.split('#')[1].split('/')[0]);
    var denominator = parseInt(text.split('/')[1].trim());
    
    switch (numerator) {
        case 1:
            return [2, 3, 4, 5, 6, 8].indexOf(denominator) !== -1;
        case 2:
            return [3, 5].indexOf(denominator) !== -1;
        case 3:
            return [4, 5, 8].indexOf(denominator) !== -1;
        case 4:
            return [5].indexOf(denominator) !== -1;
        case 5:
            return [6, 8].indexOf(denominator) !== -1;
        case 7:
            return [8].indexOf(denominator) !== -1;
        default:
            return false;
    }
};

docs.keyboard.leaveTag = function (name, date, id) {
    if (!utils.getStorageItem("action-leave-tags", false, true)) {
        return;
    }
    
    docs.keyboard.startBlockingMouse();
    docs.keyboard.startBlockingKeyboard();
    
    var shortName = "";
    var splitName = name.split(' ');
    for (var i = 0; i < splitName.length; i++) {
        if (i === splitName.length - 1 && splitName.length > 1) {
            shortName += splitName[i][0].toUpperCase();
            continue;
        }
        shortName += splitName[i] + " ";
    }
    shortName = shortName.trim();
    
    setTimeout(function () {
        docs.setColor(docs.colors["gray"]);
        if (date === null) {
            docs.insertText(" [" + shortName + "]");
        } else {
            var splitDate = date.split('/');
            var shortDate = splitDate[1] + "/" + splitDate[2];
            docs.insertText(" [" + shortName + ", " + shortDate + "]");
            
            if (keyboard.detectFraction(shortDate)) {
                //TODO: deal w/ fraction dates
            }
        }
        
        if (actionPluginPlatform !== "userscript") {
            setTimeout(function () {
                docs.setColor(docs.colors["white"]);
                docs.toggleSubscript();

                setTimeout(function () {
                    docs.insertText(id);
                    setTimeout(function () {
                        docs.toggleSubscript();
                        
                        //TODO: return to original color
                        docs.setColor(docs.colors["black"]);
                        docs.keyboard.stopBlockingMouse();
                        docs.keyboard.stopBlockingKeyboard();
                    }, 100);
                }, 100);
            }, 100);
        } else {
            docs.setColor(docs.colors["white"]);
            docs.toggleSubscript();
            docs.insertText(id);
            docs.toggleSubscript();
            
            //TODO: return to original color
            docs.setColor(docs.colors["black"]);
            docs.keyboard.stopBlockingMouse();
            docs.keyboard.stopBlockingKeyboard();
        }
    }, 100);
};

docs.keyboard.reset();

docs.keyboard.startBlockingMouse() {
    $(".kix-appview-editor").on("mousedown click mouseup mousemove mouseover", utils.stopEvent);

    $(".kix-appview-editor").children().on("mousedown click mouseup mousemove mouseover", utils.stopEvent);

    $("#attendees-dropdown, #action-button").on("mousedown", keyboard.escape);
}
docs.keyboard.stopBlockingMouse() {
    $(".kix-appview-editor").off("mousedown click mouseup mousemove mouseover").children().off("mousedown click mouseup mousemove mouseover");
    $("#attendees-dropdown, #action-button").off("mousedown", keyboard.escape);
}

docs.keyboard.handleKeyboard(e) {
    if (meeting === null) return;

    if (typeof e.key === "undefined") {
        e.key = utils.keyFromKeyCode(e.shiftKey, e.keyCode);
    }
    
    if (e.key.toLowerCase().indexOf("arrow") !== -1 || e.key.toLowerCase().indexOf("enter") !== -1) {
        utils.stopEvent(e);
    }
}
function startBlockingKeyboard() {
    $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").on("keydown", docs.keyboard.handleKeyboard);
}
function stopBlockingKeyboard() {
    $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").off("keydown", docs.keyboard.handleKeyboard);
}

function capitalizeName(name) {
    //Thanks! https://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
    return name.split(" ").map(function (i) { return i[0].toUpperCase() + i.substring(1) }).join(" ");
}

function enterSelected() {
    var selected = $("#action-inline-selector .selected");
    if (selected.length > 0) {
        var nameToInsert = selected.find("h1").text().trim();
        keyboard.currNameText = keyboard.currNameText.trim();
        var renameThisName = keyboard.currNameText;
        //docs.insertText(nameToInsert.substr(keyboard.currNameText.length, nameToInsert.length  - keyboard.currNameText.length + 1));

        var attendeeId = $(selected).attr("data-id");
        var textToBackspace = keyboard.currNameText.toString();

        var hadExtraSpace = keyboard.hasExtraSpace == true;
        var hadFraction = keyboard.detectFraction(textToBackspace);
        
        if (keyboard.selectedText === null) {
            docs.getCurrentParagraphText(function (text) {
                keyboard.backspace(textToBackspace.length + (hadExtraSpace ? 2 : 1) + (hadFraction ? 1 : 0) + (true ? 1 : 0));

                var endSubstring = text.lastIndexOf("@");
                endSubstring = endSubstring === -1 ? text.length : endSubstring;

                // var attendee = action.attendee.get(parseInt(attendeeId));
                // var tagId = attendee.generateTagId();
                
                // keyboard.leaveTag(attendee.getName(), null, tagId);
                
                if (attendeeId !== "none") {
                    action.server.addTask({
                        attendeeId: parseInt(attendeeId),
                        task: text.substring(0, endSubstring).trim(),
                        // tag: tagId
                    });
                } else {
                    meetingsHub.server.addAttendees([{
                        name: capitalizeName(renameThisName),
                        email: "none",
                        tasks: [{
                            task: text.substring(0, endSubstring).trim()
                        }],
                        force: true
                    }], meeting.link);
                }
            });
        } else {
            if (attendeeId !== "none") {
                for (var i = 0; i < keyboard.selectedText.length; i++) {
                    action.server.addTask({
                        attendeeId: parseInt(attendeeId),
                        task: keyboard.selectedText[i]
                    });
                }
            } else {
                var tasksToAdd = [];
                for (var i = 0; i < keyboard.selectedText.length; i++) {
                    tasksToAdd.push({
                        task: keyboard.selectedText[i]
                    });
                }
                meetingsHub.server.addAttendees([{
                    name: capitalizeName(renameThisName),
                    email: "none",
                    tasks: tasksToAdd,
                    force: true
                }], meeting.link);
            }
            keyboard.selectedText = null;
        }
    }

    keyboard.reset();

    $("#action-inline-selector, #action-inline-input").remove();
    docs.keyboard.stopBlockingMouse();
}

keyboard.escape = function () {
    keyboard.reset();
    $("#action-inline-selector, #action-inline-input").remove();
    docs.keyboard.stopBlockingMouse();
}

$(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]").keydown(function (e) {
    if (meeting === null) return;

    if (typeof e.key === "undefined") {
        e.key = utils.keyFromKeyCode(e.shiftKey, e.keyCode);
    }
    if (e.key === "Shift") return;

    if (!keyboard.isSelectingName && !keyboard.isSelectingTime && (e.key == "Space" || e.key == " ")) {
        keyboard.hasExtraSpace = true;
    } else if (!keyboard.isSelectingName && !keyboard.isSelectingTime && (e.key != "Space" && e.key != " ") && e.key.length == 1 && e.key != "@") {
        keyboard.hasExtraSpace = false;
    }

    if (keyboard.selectedText !== null) {
        utils.stopEvent(e);
    }

    if (e.key === "@" && !keyboard.isSelectingName) {
        if (docs.hasSelection()) {
            keyboard.selectedText = "";
            utils.stopEvent(e);
            
            keyboard.createInput();
            keyboard.setInputText("@");
            
            docs.getSelection(function (currSelectionEl) {
                var currSelection = $(currSelectionEl).text().trim();
                
                if ($(currSelectionEl).find("li").length > 0) {
                    keyboard.selectedText = [];
                
                    //Split it into list items, then add them individually
                    $(currSelectionEl).find("li").each(function () {
                        var text = $(this).text().trim();
                        if (text.length <= 0) return;
                        
                        keyboard.selectedText.push(text);
                    });
                    
                    return;
                } else {
                    keyboard.selectedText = [ currSelection ];
                }
            }, true, true);
        } else {
            keyboard.selectedText = null;
        }

        keyboard.isSelectingName = true;
        docs.keyboard.startBlockingMouse();
        keyboard.currNameText = "";

        $("#action-inline-selector").remove();

        var myCursor = docs.getUserCursor();

        var cursorHeight = parseInt($(myCursor).find(".kix-cursor-caret").css("height").split("px")[0].trim());

        var selectorDropdown = $("<div></div>", { "id": "action-inline-selector" }).css({
            "left": $(myCursor).offset().left + "px",
            "top": $(myCursor).offset().top + cursorHeight + $(myCursor).height() + "px",
            "position": "absolute",
            "z-index": "999",
            "backgroundColor": "#fff"
        });
        action.analytics.increment("inlines-started");

        action.attendee.forEach(function (att) {
            if (att.id < 0) return;

            var newAttendee = $("<div></div>", { "class": "inline-attendee" })
                        .append($("<div></div>", { "class": "action-color-bubble" }))
                        .append($("<h1></h1>").text(att.getName().replace(/#/g, "")/*.toLowerCase().replace(/ /g, "")*/))
                    .attr("data-id", att.id)
                    .click(function () {
                        $(this).parent().find(".selected").removeClass("selected");
                        $(this).addClass("selected");
                        enterSelected();
                    });

            var color = att.getColor();
            $(newAttendee).find(".action-color-bubble").css("backgroundColor", color);
            if (color.toLowerCase() === "#fff" || color.toLowerCase() === "#ffffff" || color.toLowerCase() === "rgb(255, 255, 255)") {
                $(newAttendee).find(".action-color-bubble").css("border", "1px solid #22A7F0");
            }
            $(selectorDropdown).append(newAttendee);
        });

        $(selectorDropdown).find("div:not(.hidden)").first().addClass("selected");

        $("body").append(selectorDropdown);

        return;
    }

    if (e.key === "Backspace" && (keyboard.isSelectingName || keyboard.isSelectingTime)) {
        if (keyboard.isSelectingName && keyboard.currNameText == "") {
            keyboard.reset();
            $("#action-inline-selector, #action-inline-input").remove();
            docs.keyboard.stopBlockingMouse();
            return;
        } else if (keyboard.isSelectingTime && keyboard.currTimeText == "") {
            $("#action-inline-selector").show();
            keyboard.isSelectingName = true;
            keyboard.isSelectingTime = false;
            keyboard.currCursorPosition = keyboard.currNameText.length;
            return;
        }
    }

    if ((keyboard.isSelectingName || keyboard.isSelectingTime) && e.key.indexOf("Arrow") === 0) {
        switch (e.key.toLowerCase()) {
            case "arrowup":
                utils.stopEvent(e);

                if(keyboard.isSelectingName) {
                    var prevOption = $("#action-inline-selector .selected").prevAll(":not(.hidden)");
                    if (prevOption.length > 0) {
                        $("#action-inline-selector .selected").removeClass("selected");
                        prevOption.first().addClass("selected");
                    }
                }
                break;
            case "arrowdown":
                utils.stopEvent(e);

                if(keyboard.isSelectingName) {
                    var nextOption = $("#action-inline-selector .selected").nextAll(":not(.hidden)");
                    if (nextOption.length > 0) {
                        $("#action-inline-selector .selected").removeClass("selected");
                        nextOption.first().addClass("selected");
                    }
                }
                break;
            case "arrowleft":
                if (keyboard.currCursorPosition == 0) {
                    utils.stopEvent(e);
                    return;
                }
                keyboard.currCursorPosition = keyboard.currCursorPosition - 1;
                break;
            case "arrowright":
                if ((keyboard.isSelectingName && keyboard.currCursorPosition == keyboard.currNameText.length) || (keyboard.isSelectingTime && keyboard.currCursorPosition == keyboard.currTimeText.length)) {
                    utils.stopEvent(e);
                    return;
                }
                keyboard.currCursorPosition = keyboard.currCursorPosition + 1;
                break;
        }
        return;
    }


    if (keyboard.isSelectingName && $("#action-inline-selector").length > 0) {
        switch (e.key.toLowerCase()) {
            case "backspace":
                keyboard.currNameText = keyboard.currNameText.slice(0, keyboard.currCursorPosition - 1) + keyboard.currNameText.substring(keyboard.currCursorPosition);

                keyboard.currCursorPosition = keyboard.currCursorPosition - 1;
                break;
            case "enter":
                utils.stopEvent(e);
                action.analytics.increment("inlines-without-times-finished");
                enterSelected();
                return;
            case "escape":
                utils.stopEvent(e);
                keyboard.escape();
                return;
            case "tab":
            case "#":
                utils.stopEvent(e);
                
                var selected = $("#action-inline-selector .selected");
                if (selected.length > 0) {
                    if ($(selected).attr("data-id") === "none") {
                        enterSelected();
                        return;
                    }
                    var nameToInsert = selected.find("h1").text().trim();
                    keyboard.currNameText = keyboard.currNameText;
                    keyboard.insertText(nameToInsert.substr(keyboard.currNameText.length, nameToInsert.length - keyboard.currNameText.length + 1) + "#");

                    keyboard.isSelectingName = false;
                    keyboard.isSelectingTime = true;
                    keyboard.currNameText = nameToInsert;
                    keyboard.currTimeText = "";
                    keyboard.currCursorPosition = 0;
                    action.analytics.increment("inline-times-started");
                }
                $("#action-inline-selector").hide();
                return;
            default:
                if (e.key.length === 1) {
                    keyboard.currCursorPosition++;
                    keyboard.currNameText = keyboard.currNameText + e.key;
                }
                break;
        }
    }

    if (keyboard.isSelectingTime) {
        //todo backspace and stuff
        switch (e.key.toLowerCase()) {
            case "backspace":
                keyboard.currTimeText = keyboard.currTimeText.slice(0, keyboard.currCursorPosition - 1) + keyboard.currTimeText.substring(keyboard.currCursorPosition);

                keyboard.currCursorPosition = keyboard.currCursorPosition - 1;
                break;
            case "tab":
            case "enter":
                utils.stopEvent(e);
                
                action.analytics.increment("inlines-with-time-finished");
                
                var selected = $("#action-inline-selector .selected");
                if (selected.length > 0) {
                    var nameToInsert = selected.find("h1").text().trim();
                    keyboard.currNameText = keyboard.currNameText.trim();
                    //docs.insertText(nameToInsert.substr(keyboard.currNameText.length, nameToInsert.length  - keyboard.currNameText.length + 1));

                    var attendeeId = $(selected).attr("data-id");
                    
                    var wasTime = keyboard.currTimeText.toString();
                    // Standardize all date dividers to /
                    for (var i = 0; i < keyboard.dateDividers; i++) {
                        wasTime.replace(keyboard.dateDividers[i], "/");
                    }
                    var time = wasTime.length > 0 ? wasTime : null;
                    time = action.parseDateString(time);
                    
                    var textToBackspace = "@" + keyboard.currNameText.toString() + "#" + keyboard.currTimeText.toString();

                    var hadExtraSpace = keyboard.hasExtraSpace == true;
                    var hadFraction = keyboard.detectFraction(textToBackspace);
                    
                    if (keyboard.selectedText === null) {
                        docs.getCurrentParagraphText(function (text) {
                            keyboard.backspace(textToBackspace.length + (hadExtraSpace ? 1 : 0) + (hadFraction ? 1 : 0) + 1);
                            var endSubstring = text.lastIndexOf("@");
                            endSubstring = endSubstring === -1 ? text.length : endSubstring;


                            var attendee = action.attendee.get(parseInt(attendeeId)); 
                            var tagId = attendee.generateTagId();

                            keyboard.leaveTag(attendee.getName(), time, tagId);
                    
                            action.server.addTask({
                                attendeeId: parseInt(attendeeId),
                                task: text.substring(0, endSubstring).trim(),
                                dueDate: time,
                                tag: tagId
                            });
                        });
                    } else {
                        for (var i = 0; i < keyboard.selectedText.length; i++) {
                            action.server.addTask({
                                attendeeId: parseInt(attendeeId),
                                task: keyboard.selectedText[i],
                                dueDate: time
                            });
                        }
                    }
                }
                
                keyboard.reset();
                $("#action-inline-selector, #action-inline-input").remove();
                docs.keyboard.stopBlockingMouse();
                break;
            default:
                if (e.key.length === 1) {
                    var parsedInt = parseInt(e.key);

                    var isDateDivider = keyboard.dateDividers.indexOf(e.key) != -1;

                    var alreadyDivided = false;
                    for (var i = 0; i < keyboard.dateDividers.length; i++) {
                        if (keyboard.currTimeText.indexOf(keyboard.dateDividers[i]) != -1) {
                            alreadyDivided = true;
                            break;
                        }
                    }

                    if (isNaN(parsedInt) && (!isDateDivider || alreadyDivided)) {
                        //Allowing text dates
                        //utils.stopEvent(e);
                        //return;
                    }
                    keyboard.currCursorPosition++;
                    keyboard.currTimeText = keyboard.currTimeText + e.key;
                }
                break;
        }
    }

    if (keyboard.isSelectingName) {
        $("#action-inline-selector div").each(function () {
            if ($(this).attr("data-id") == "none") {
                $(this).removeClass("hidden");
                return;
            }

            $(this).toggleClass("hidden", ($(this).find("h1").text().toLowerCase().trim().indexOf(keyboard.currNameText.toLowerCase()) !== 0));
        });

        $("#action-inline-selector .selected").removeClass("selected");

        if($("#action-inline-selector div:not(.hidden)").length <= 0) {
            $("#action-inline-selector .no-attendees").remove();

            $("#action-inline-selector").append($("<div></div>", { "class": "inline-attendee no-attendees" }).attr("data-id", "none")
                    .append($("<div></div>", { "class": "action-color-bubble" }))
                    .append($("<h1></h1>").text("Press [enter] to add this attendee, [esc] to close.").click(function () {
                        $(this).parent().find(".selected").removeClass("selected");
                        $(this).addClass("selected");
                        enterSelected();
                    })));
        } else if ($("#action-inline-selector div:not(.no-attendees, .hidden)").length > 0) {
            $("#action-inline-selector .no-attendees").remove();
        }
        $("#action-inline-selector div:not(.hidden)").first().addClass("selected");
    }
});
