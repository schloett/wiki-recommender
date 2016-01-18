//TODO: add listener for editform pos.change

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method == "visibility")

            var editor = $("#editform");
        if (request.data == true) {
            //add toggler (which changes size and sets visible AND restores size and hide)
            var sidebarWidth = '18%';
            //$("#bodyContent").width() - $("#editform").width();
            var sidebarTop = editor.offset();
            editor.css("width", "80%");
            $("#bodyContent").after("<div id='eexcess_sidebar'></div>");
            var sidebar = $("#eexcess_sidebar");
            sidebar.css({
                "height": $(".wikiEditor-ui").height(),
                "width": sidebarWidth
            });
            sidebar.css("top", sidebarTop.top);
            var iframeUrl = chrome.extension.getURL('visualization-widgets/SearchResultListVis/index.html');
            sidebar.append("<iframe src='" + iframeUrl + "' />");

        }
        //remove toggler
        if (request.data == false) {
            editor.css("width", "100%");
            $("#eexcess_sidebar").remove();
        }

    });


