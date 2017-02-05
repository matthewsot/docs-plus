var docs = docs || { //TODO: cleanup the duplication here + in utils.js
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

docs.runWithCreateKeyboard = function (strToRun, funcName, params) {
    var toRun = "var utils = {};utils.createKeyboardEvent = " + utils.createKeyboardEvent.toString() + ";";

    toRun += strToRun;

    toRun += funcName + '(' + params + ')';

    docs.utils.runInPage(toRun.replace(/\r?\n|\r/g, " "));
};

docs.insertText = function (toInsert) {
    /*function coolerDoInsert(toInsert) {
        var e = new ClipboardEvent('paste', { dataType: 'text/plain', data: toInsert });
        document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentWindow.document.querySelector("[contenteditable=\"true\"]").dispatchEvent(e);
    }*/
    function doInsertText(toInsert) {
        for (var i = 0; i < toInsert.length; i++) {
            var key = toInsert[i];
            var specials = { " ": " ", "\t": "Tab" };
            if (specials[key] !== "undefined") {
                key = specials[key];
            }

            var e = docs.utils.createKeyboardEvent("keypress", {
                "key": key,
                "charCode": toInsert.charCodeAt(i),
                "keyCode": null,
                "bubbles": true,
                "cancelable": true,
                "code": key,
                "pageY": 7,
                "which": toInsert.charCodeAt(i)
            });

            document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentWindow.document.querySelector("[contenteditable=\"true\"]").dispatchEvent(e);
        }
    }
    
    if (docs.platform !== "userscript") {
        docs.runWithCreateKeyboard(doInsertText.toString(), "doInsertText", "\"" + toInsert + "\"");
    } else {
        doInsertText(toInsert);
    }
};

docs.lastBackspace = Date.now();
docs.backspace = function (counts) {
    function doBackspace(counts) {
        var keyboardType = "keypress";
        if (navigator.vendor.toLowerCase().indexOf("google") !== -1) { keyboardType = "keydown"; }
    
        var e = docs.utils.createKeyboardEvent(keyboardType, {
            "key": "Backspace",
            "charCode": 8,
            "keyCode": 8,
            "bubbles": true,
            "cancelable": true,
            "code": "Backspace",
            "pageY": 7,
            "which": 8
        });
    
        if (typeof counts === "undefined") counts = 1;
    
        for (var i = 0; i < counts; i++) {
            document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentWindow.document.querySelector("[contenteditable=\"true\"]").dispatchEvent(e);
        }
    }
    
    if (typeof counts === "undefined") counts = 1;

    var secondsSinceLastBackspace = (Date.now() - docs.lastBackspace) / 1000;

    if (counts === 1 && secondsSinceLastBackspace < 1) return; //just trust me here

    lastBackspace = Date.now();
    var secondsTimeout = secondsSinceLastBackspace < 1 ? (1 - secondsSinceLastBackspace) : 0;


    var toRun = "var utils = {};utils.createKeyboardEvent = " + utils.createKeyboardEvent.toString() + ";";

    toRun += doBackspace.toString();

    toRun += 'doBackspace(' + counts + ')';

    setTimeout(function () {
        docs.utils.runInPage(toRun.replace(/\r?\n|\r/g, " "));
    }, (secondsTimeout * 1000));
    return;
};

docs.colors = {
    "gray": "#jfk-palette-cell-5 > div:nth-child(1)",
    "black": "#jfk-palette-cell-0 > div:nth-child(1)",
    "white": "#jfk-palette-cell-9 > div:nth-child(1)"
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

docs.toggleSubscript = function () {
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
        var comma = {
            "key": ",",
            "charCode": 0,
            "keyCode": 188,
            "bubbles": true,
            "cancelable": true,
            "code": 188,
            "pageY": 7,
            "which": 188,
            "ctrlKey": true
        };

        var ctrlDown = docs.utils.createKeyboardEvent("keydown", ctrl);

        var commaDown = docs.utils.createKeyboardEvent("keydown", comma);
        var commaUp = docs.utils.createKeyboardEvent("keyup", comma);
        var commaPress = docs.utils.createKeyboardEvent("keypress", comma);

        var ctrlUp = docs.utils.createKeyboardEvent("keydown", ctrl);
        var ctrlPress = docs.utils.createKeyboardEvent("keypress", ctrl);

        var el = document.getElementsByClassName("docs-texteventtarget-iframe")[0].contentWindow.document.querySelector("[contenteditable=\"true\"]");
        el.dispatchEvent(ctrlDown);
        el.dispatchEvent(commaDown);
        el.dispatchEvent(commaUp);
        el.dispatchEvent(commaPress);
        el.dispatchEvent(ctrlUp);
        el.dispatchEvent(ctrlPress);
    }
    
    if (docs.platform !== "userscript") {
        docs.runWithCreateKeyboard(_doToggleSubscript.toString(), "_doToggleSubscript", "");
        return;
    } else {
        _doToggleSubscript();
    }
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

    docs.insertText(" ");
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
