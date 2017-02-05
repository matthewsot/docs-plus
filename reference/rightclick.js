$("body").on("mouseup", ".kix-appview-editor", function (e) {
    if (meeting === null || e.button !== 2) return;

    utils.observe(document.body, {
        childList: true,

        attributes: true,
        attributeFilter: [ "style" ],

        subtree: true
    }, function(mutations) {
        $(".goog-menu.goog-menu-vertical").each(function () {
            if($(this).css("display") === "none") return;

            $("#action-context, #action-separator, #action-dropout").remove();

            $(this).append(utils.funcString(function(){/*
                <div id="action-separator" aria-hidden="true" role="separator" aria-disabled="true" style="-moz-user-select: none;" class="goog-menuseparator"></div>
            */}));

            var newMenuItem = $(utils.funcString(function(){/*
                <div id="action-context" aria-haspopup="true" style="-moz-user-select: none;" aria-disabled="false" role="menuitem" class="goog-menuitem apps-menuitem goog-submenu">
                    <div class="goog-menuitem-content">
                        <div class="docs-icon goog-inline-block goog-menuitem-icon"><img class="docs-icon-img-container docs-icon-img docs-icon-clear-formatting" src="" /></div>
                        <span class="goog-menuitem-label">Action</span>
                        <span class="goog-submenu-arrow">►</span>
                    </div>
                </div>
            */}));

            $(newMenuItem).find("img").attr("src", utils.imageDatas["checkmark.blue"])

            var dropoutMenu = $(utils.funcString(function(){/*
                <div id="action-dropout" role="menu" style="-moz-user-select: none; display: none;" class="goog-menu goog-menu-vertical">
                </div>
            */}));

            var allAttendees = action.attendee.getAll();
            for(var i = 0; i < allAttendees.length; i++) {
                var attendee = action.attendee.get(allAttendees[i]);

                var newAttendee = $(utils.funcString(function(){/*
                    <div style="-moz-user-select: none;" aria-disabled="false" role="menuitem" class="action-context-person goog-menuitem apps-menuitem">
                        <div class="goog-menuitem-content">
                            <div class="action-color-bubble docs-icon goog-inline-block goog-menuitem-icon"></div>
                            <span class="goog-menuitem-label">Person 1</span>
                        </div>
                    </div>
                */}));

                $(newAttendee).attr("data-id", attendee.id);
                $(newAttendee).find(".goog-menuitem-label").text(attendee.getName() + " (" + attendee.getTaskCount() + ")");

                var color = attendee.getColor();
                $(newAttendee).find(".action-color-bubble").css("backgroundColor", color);
                if (color.toLowerCase() === "#fff" || color.toLowerCase() === "#ffffff" || color.toLowerCase() === "rgb(255, 255, 255)") {
                    $(newAttendee).find(".action-color-bubble").css("border", "1px solid #22A7F0");
                }

                $(dropoutMenu).append(newAttendee);
            }

            $("body").append(dropoutMenu);

            window.hoveringDropout = false;
            window.hoveringParent = false;

            $(newMenuItem).hover(function() {
                window.hoveringParent = true;
                if($(this).offset().top - 6 + $(dropoutMenu).height() <= $(document).height()) {
                    $(dropoutMenu).css({
                        "left": $(this).parent().offset().left + $(this).parent().width(),
                        "top": $(this).offset().top - 6
                    });
                } else {
                    $(dropoutMenu).css({
                        "left": $(this).parent().offset().left + $(this).parent().width(),
                        "bottom": 0
                    });
                }
                $(dropoutMenu).show();
            }, function() {
                window.hoveringParent = false;

                setTimeout(function () {
                    if(!window.hoveringDropout && !window.hoveringParent) {
                        $(dropoutMenu).hide();
                    }
                }, 10);
            });

            $(dropoutMenu).hover(function() {
                window.hoveringDropout = true;
            }, function () {
                window.hoveringDropout = false;

                setTimeout(function () {
                    if(!window.hoveringDropout && !window.hoveringParent) {
                        $(dropoutMenu).hide();
                    }
                }, 10);
            })

            $(this).append(newMenuItem);
            var that = this;
            setTimeout(function() {
                //Something of a fix for the bug where Action > shows up at the top of the right-click menu
                newMenuItem.appendTo(that);
            }, 100);
        });
    }, true);
});
