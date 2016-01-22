require(['c4/iframes'], function (iframes) {

//listens to messages from background.js regarding its visibility. if it is visible, it listens to events like
// triggeredQuerys or newResults from its iFrame
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.method == "visibility") {

                /*listens to position changes of the editor's content and adjusts sidebar accordingly (relevant when there's
                 some kind of announcement at the top of the wiki page
                 the listener is registered only when browser action is active because inly then there's a sidebar to
                 adjust and it can be guaranteed that only the current tab's sidebar is altered*/
                jQuery.fn.onPositionChanged = function (trigger, millis) {
                    if (millis == null) millis = 100;
                    var o = $(this[0]); // our jquery object
                    if (o.length < 1) return o;

                    var lastPos = null;
                    var lastOff = null;
                    setInterval(function () {
                        if (o == null || o.length < 1) return o; // abort if element is non existend eny more
                        if (lastPos == null) lastPos = o.position();
                        if (lastOff == null) lastOff = o.offset();
                        var newPos = o.position();
                        var newOff = o.offset();
                        if (lastPos.top != newPos.top || lastPos.left != newPos.left) {
                            $(this).trigger('onPositionChanged', {lastPos: lastPos, newPos: newPos});
                            if (typeof (trigger) == "function") trigger(lastPos, newPos);
                            lastPos = o.position();
                        }
                        if (lastOff.top != newOff.top || lastOff.left != newOff.left) {
                            $(this).trigger('onOffsetChanged', {lastOff: lastOff, newOff: newOff});
                            if (typeof (trigger) == "function") trigger(lastOff, newOff);
                            lastOff = o.offset();
                        }
                    }, millis);

                    return o;
                };

                $("#bodyContent").onPositionChanged(function () {
                    $("#eexcess_sidebar").css({
                        "height": $(".wikiEditor-ui").height(),
                        "width": sidebarWidth,
                        "top": $("#editform").offset().top,
                        "margin-right": "8px"
                    });
                });

                //adding the sidebar
                $(document).ready(function () {
                    if (request.data == true) {
                        //add sidebar
                        addSidebar();

                        //window.addEventListener('message', newTrigger);
                        window.onmessage = function (msg) {
                            if (msg.data.event && msg.data.event === 'eexcess.queryTriggered') {
                                iframes.sendMsgAll({event: 'eexcess.queryTriggered', data: "msg"});
                                handleSearch(msg);
                            }
                        }
                    }

                    //remove sidebar
                    if (request.data == false) {
                        $("#editform").css("width", "100%");
                        $("#eexcess_sidebar").remove();
                    }
                });
            }
        });


    function addSidebar() {
        if ($(".wikiEditor-ui")[0] && $("#editform")[0]) {
            var editor = $("#editform");
            var sidebarWidth = '18%';

            var sidebarTop = editor.offset();
            editor.css("width", "80%");
            var iframeUrl = chrome.extension.getURL('visualization-widgets/SearchResultListVis/index.html');

            $("<div id='eexcess_sidebar'><iframe src='" + iframeUrl + "' /></div>").insertAfter($("#bodyContent")).hide();

            var sidebar = $("#eexcess_sidebar");

            //adjust sidebar position and size according to the wiki editor
            sidebar.css({
                "height": $(".wikiEditor-ui").height(),
                "width": sidebarWidth,
                "top": sidebarTop.top,
                "margin-right": "8px"
            });

            sidebar.css("top", sidebarTop.top);
            //sidebar.show();
            sidebar.slideToggle({direction: "left"});
        } else {
            setTimeout(addSidebar, 10);
        }
    }


// a new search has been triggered. send call to wiki commons as well as mendeley and zwb via the api TODO only one msg
    function handleSearch(msg) {
        var responseWiki;
        var responseEEXCESS;
        var contextKeywords;


        if (msg.data.contextKeywords !== undefined) {
            contextKeywords = msg.data.contextKeywords;
        } else {
            contextKeywords = [{text: msg.data.data}];
        }
        chrome.runtime.sendMessage({
            method: 'triggerQueryCommons',
            data: {
                origin: {module: "wikiRecommender"},
                contextKeywords: contextKeywords
            }
        }, function (response) {
            responseWiki = response;

        });

        chrome.runtime.sendMessage({
            method: 'triggerQuery',
            data: {
                origin: {module: "wikiRecommender"},
                contextKeywords: contextKeywords
            }
        }, function (response) {
            responseEEXCESS = response;
        });
        //TODO break point
        checkResponses();

        //timer to ensure both calls have returned responses
        function checkResponses() {
            if (responseEEXCESS === undefined || responseWiki === undefined) {
                setTimeout(checkResponses, 50);
                //console.log("still undefined")
            } else {
                iframes.sendMsgAll({event: 'eexcess.newResults', dataWiki: responseWiki, dataEEXCESS: responseEEXCESS});
            }
        }
    }

});




