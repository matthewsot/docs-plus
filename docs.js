var docs = docs || { // TODO: cleanup the duplication here + in utils.js
    id: window.location.href.split("/document/d/")[1].split("/")[0],
    get name() {
        return $(".docs-title-input-label-inner").text().trim();
    },
    platform: "chrome" //chrome, firefox, userscript
};

docs.getSelectionEl = function () {
    var selection = null;
    $(".kix-selection-overlay").each(function () {
        if (selection !== null) return;
        
        var hasOverriddenColor = $(this).attr("style").indexOf("background-color") !== -1;
        var isBlack = $(this).css("background-color").replace(/\s/g, "").replace(/,/g, "");
        isBlack = isBlack.indexOf("000") !== -1;
        if (!hasOverriddenColor || isBlack) {
            selection = $(this);
        }
    });
    
    return selection;
};
docs.hasSelection = function () {
    return docs.getSelectionEl() !== null;
};

docs.getSelectionWithObserver = function (callback, defaultToParagraph, getRaw) {
    defaultToParagraph = typeof defaultToParagraph !== "undefined" && defaultToParagraph;
    getRaw = (typeof getRaw !== "undefined" && getRaw);

    var anySelection = $(".kix-selection-overlay").length > 0;
    if (!anySelection) {
        if (defaultToParagraph) {
            //If the caller expects a raw element, we need to give it to them
            docs.getCurrentParagraphText(getRaw ? function (text) { callback($("<span></span>").text(text)[0]); } : callback);
        } else {
            callback(getRaw ? $("<span></span>").text("")[0] : "");
        }
        return;
    }

    docs.utils.observe($(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]")[0], {
        childList: true
    }, function(mutations) {
        callback(getRaw ? mutations[0].target : $(mutations[0].target).text().trim());
    }, true);

    //Send a copy event to get it to update the contents of the div with the current selection
    var e = new CustomEvent("copy");
    $(".docs-texteventtarget-iframe").contents().find("[contenteditable=\"true\"]")[0].dispatchEvent(e);
};
docs.getSelection = docs.getSelectionWithObserver;

docs.colors = {
    "gray": "#docs-material-colorpalette-cell-5 > div:nth-child(1)",
    "black": "#docs-material-colorpalette-cell-0 > div:nth-child(1)",
    "white": "#docs-material-colorpalette-cell-9 > div:nth-child(1)"
};

docs.setColor = function (colorSelector) {
    $("#textColorButton > div:nth-child(1) > div:nth-child(1)")[0].dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    var el = $(colorSelector)[0];
    el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    el.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
};

docs.ctrlKeyShortcut = function (secondKey) {
    function _doToggleSubscript() {
        var ctrl = {
            "key": "Control",
            "charCode": 0,
            "keyCode": 17,
            "bubbles": true,
            "cancelable": true,
            "code": null,
            "pageY": 7,
            "which": 17,
            "ctrlKey": true
        };

        var ctrlDown = docs.utils.createKeyboardEvent("keydown", ctrl);

        var secondDown = docs.utils.createKeyboardEvent("keydown", secondKey);
        var secondUp = docs.utils.createKeyboardEvent("keyup", secondKey);
        var secondPress = docs.utils.createKeyboardEvent("keypress", secondKey);

        var ctrlUp = docs.utils.createKeyboardEvent("keydown", ctrl);
        var ctrlPress = docs.utils.createKeyboardEvent("keypress", ctrl);

        var el = document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentWindow.document.querySelector("[contenteditable=\"true\"]");
        el.dispatchEvent(ctrlDown);
        el.dispatchEvent(secondDown);
        el.dispatchEvent(secondUp);
        el.dispatchEvent(secondPress);
        el.dispatchEvent(ctrlUp);
        el.dispatchEvent(ctrlPress);
    }
    
    if (docs.platform !== "userscript") {
        function escape_quotes(str) {
            //TODO: something that's not practically guaranteed to break here
            return str.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"")
        }
        docs.runWithCreateKeyboard("secondKey=JSON.parse(\"" + escape_quotes(JSON.stringify(secondKey)) + "\");" + _doToggleSubscript.toString(), "_doToggleSubscript", "");
        return;
    } else {
        _doToggleSubscript();
    }
};

docs.toggleSuperscript = function () {
    var el = document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentDocument;
    var data = {"keyCode": 190, "ctrlKey": true};
    key_event = new KeyboardEvent("keydown", data);
    key_event.docs_plus_ = true;
    el.dispatchEvent(key_event);
};
docs.toggleSubscript = function () {
    var el = document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentDocument;
    var data = {"keyCode": 188, "ctrlKey": true};
    key_event = new KeyboardEvent("keydown", data);
    key_event.docs_plus_ = true;
    el.dispatchEvent(key_event);
};
docs.toggleBold = function () {
    var el = document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentDocument;
    var data = {"keyCode": 66, "ctrlKey": true};
    key_event = new KeyboardEvent("keydown", data);
    key_event.docs_plus_ = true;
    el.dispatchEvent(key_event);
};

docs.getCurrentParagraphText = function(callback) {
    //Set up an observer to observe all the paragraphs
    var calledAlready = false;

    var observer = docs.utils.observe($(".kix-paginateddocumentplugin")[0], {
        childList: true,
        subtree: true
    }, function(mutations) {
        mutations.forEach(function(mutation) {
            if($(mutation.target).hasClass("kix-lineview-content")) {
                observer.disconnect();
                
                if (!calledAlready) {
                    var cloned = $(mutation.target).closest(".kix-paragraphrenderer").clone();

                    cloned.find(".goog-inline-block.kix-lineview-text-block").each(function () {
                        var text = $(this).text().trim().toLowerCase();
                        var isSimpleBullet = text.length <= 2;
                        var isParenthBullet = text.length === 3 && text.indexOf("(") === 0 && text.lastIndexOf(")") === 2;
                        var isIIBullet = text.indexOf(".") === (text.length - 1) && (text.match(/i/g) || []).length === text.length - 1;
                        var isNumDotBullet = text.indexOf(".") === (text.length - 1) && (text.match(/\d/g) || []).length === text.length - 1;
                        if ($(this).parent().css("padding-left") === "0px" && (isSimpleBullet || isParenthBullet || isIIBullet || isNumDotBullet)) {
                            $(this).remove(); //It's a dot/#/letter bullet for the list
                        }
                    });

                    var rawText = cloned.text().replace(/\s/g, " ").trim();

                    callback(rawText);

                    docs.backspace();
                }
                calledAlready = true;
            }
        });
    });

    docs.keyboard.typeLetters(" ");
};

docs.getUserCursor = function () {
    var myCursor = null;

    $(".kix-cursor").each(function () {
        var caretColor = $(this).find(".kix-cursor-caret").css("border-left-color").replace(/,/g, "").replace(/\s/g, "").toLowerCase();
        var isCaretBlack = caretColor.indexOf("(000)") !== -1 || caretColor.indexOf("#000") !== -1 || caretColor.indexOf("black") !== -1;
        
        if ($(this).find(".kix-cursor-name").text().trim().length <= 0 && isCaretBlack) {
            myCursor = $(this);
        }
    });
    
    if (myCursor !== null) {
        return myCursor;
    }

    console.log("Couldn't locate the cursor!");
    return $(".kix-cursor").first();
};

docs.setCursorWidth = function(width) {
    docs.getUserCursor().find(".kix-cursor-caret").css("border-width", width);
};

var el = document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentWindow.document.querySelector("[contenteditable=\"true\"]");
ev = new KeyboardEvent("keydown", {"code": 37})
el.dispatchEvent(ev);
