// https://stackoverflow.com/questions/951021
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

docs.keydown = async function (e) {
    console.log("Key down:" + e.key);
    if (e.key == "r" && e.altKey) {
        e.preventDefault();
        e.stopPropagation();

        docs.pressLetters("t");
        docs.undo();

        docs.pressLetters("T");
        docs.undo();
        docs.redo();
        docs.pasteText("his line should start with only one 'T'.\n");
        await sleep(500);

        docs.pressLetters("Heytypo");
        for (var i = 0; i < "typo".length; i++) {
            docs.backspace();
        }
        docs.pasteText("\nThis doc's name is: " + docs.name +
                       " and the id is: " + docs.id + "\n" +
                       "There should be a blank line after this:\n" +
                       "\nAnd before this.");
        await sleep(500);

        docs.setColor("gray");
        docs.pasteText("\nThis text should be in gray.");
        await sleep(500);

        docs.setColor("black");
        docs.pasteText("\nThis should be back in black.\n");
        await sleep(500);

        docs.toggleSuperscript();
        docs.pasteText("This should be superscript.");
        await sleep(500);

        docs.toggleSuperscript();
        docs.pasteText("Back to normal.");
        await sleep(500);

        docs.toggleSubscript();
        docs.pasteText("Subscript.");
        await sleep(500);

        docs.toggleSubscript();
        docs.pasteText("Back to normal.");
        await sleep(500);

        docs.toggleBold();
        docs.pasteText("\nThis should be bold.");
        await sleep(500);

        docs.toggleBold();
        docs.pasteText("Back to normal.\n");
        await sleep(500);

        docs.insertLink("https://example.com/", "This should be a link to https://example.com/");
        docs.pasteText("Back to normal.\n");
        await sleep(500);

        docs.pasteText("A few tests require user input:\n" +
                       "1) Select something (or not) and press alt+s to " +
                       "check the selection methods.\n" +
                       "2) Press alt+c to check the cursor method.\n" +
                       "Your cursor should be between these quotes: \"\"\n");
        await sleep(500);

        docs.pressKey(docs.codeFromKey("ArrowLeft"));
        docs.pressKey(docs.codeFromKey("ArrowLeft"));

        docs.getCurrentParagraphText(function (text) {
            var truth = "Your cursor should be between these quotes: \"\"";
            console.log("getCurrentParagraphText got: " + text.trim());
        });

        return false;
    }
    if (e.key == "s" && e.altKey) {
        docs.getSelection(function (selection) {
            alert("You had selected: \"" + selection + "\"");
        });
    }
    if (e.key == "c" && e.altKey) {
        docs.pasteText("\nMaking cursor 10px wide...\n");
        docs.setCursorWidth("10px");
    }
    return true;
};

console.log("Press alt + r to begin the test.");
