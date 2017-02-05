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
    if (typeof specialKeys[keyCode] !== "undefined") {
        if (shifted && typeof shiftedSpecialKeys[keyCode] !== "undefined") {
            return shiftedSpecialKeys[keyCode];
        }
        return specialKeys[keyCode];
    } else {
        var c = String.fromCharCode(keyCode);
        if(!shifted) return c.toLowerCase();

        var shifts = { "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")", "-": "_", "=": "+" };
        var foundShift = shifts[c];
        if (typeof foundShift === "undefined") {
            return c.toUpperCase();
        } else {
            return shifts[c];
        }
    }
};

docs.utils.createKeyboardEvent = function (type, info) {
    var e = new KeyboardEvent(type, info);
    if(e.keyCode == 0) {
        /* http://jsbin.com/awenaq/3/edit?js,output */
        e = document.createEventObject ?
            document.createEventObject() : document.createEvent("Events");
      
        if(e.initEvent){
          e.initEvent(type, true, true);
        }

        for (var prop in info) {
            e[prop] = info[prop];
        }
    }

    return e;
}

docs.utils.runInPage = function (script) {
    if (actionPluginPlatform === "firefox") {
        var th = document.body;
        var s = document.createElement('script');
        s.setAttribute('type', 'text/javascript');
        s.innerHTML = script;
        th.appendChild(s);
        return;
    }
    window.location = "javascript:" + script;
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
