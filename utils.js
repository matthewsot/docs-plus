var docs = docs || {
    id: window.location.href.split("/document/d/")[1].split("/")[0],
    get name() {
        return $(".docs-title-input-label-inner").text().trim();
    },
    platform: "chrome" //chrome, firefox, userscript
};
docs.utils = {};

docs.utils.observe = function (el, config, callback, observeOnce) {
    observeOnce = (typeof observeOnce !== "undefined") && observeOnce;

    var observer = new MutationObserver(function(mutations) {
        if (observeOnce) {
            observer.disconnect();
        }
        
        callback(mutations);
    });

    observer.observe(el, config);

    return observer;
};

docs.utils.keyFromKeyCode = function (shifted, keyCode) {
    var specialKeys = { 191: "/", 27: "Escape", 16: "Shift", 17: "Control", 18: "Alt", 8: "Backspace", 32: " ", 13: "Enter", 9: "Tab", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown" };
    var shiftedSpecialKeys = { 191: "?" };
    if (keyCode in specialKeys) {
        if (shifted && keyCode in shiftedSpecialKeys) {
            return shiftedSpecialKeys[keyCode];
        }
        return specialKeys[keyCode];
    } else {
        var c = String.fromCharCode(keyCode);
        if(!shifted) return c.toLowerCase();

        var shifts = { "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")", "-": "_", "=": "+" };
        if (!(c in shifts)) {
            return c.toUpperCase();
        } else {
            return shifts[c];
        }
    }
};

docs.utils.codeFromKey = function(key) {
    var specialKeys = { "/": 191, "Escape": 27, "Shift": 16,
        "Control": 17, "Alt": 18, "Backspace": 8, " ": 32, "Enter": 13,
        "Tab": 9, "ArrowLeft": 37, "ArrowUp": 38, "ArrowRight": 39, "ArrowDown": 40,
    "Delete": 46 };
    if (key in specialKeys) {
        return specialKeys[key];
    }
    return key.charCodeAt(key);
};

//Thanks! https://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
docs.utils.rgb2hex = function(rgb) {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
