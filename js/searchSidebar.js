require(['c4/iframes'], function (iframes) {


    var prevWindowW;
    var prevWindowH;

    var wikiLeftNavigationMargin;

    var wikiMwContentTextW;
    var wikiContentW;
    var wikiHeaderW;

    // listens to messages from background.js regarding its visibility. if it is visible, it listens to events like triggeredQuerys or newResults from its iFrame
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.method == "visibilityChange") {
                updateSidebar();
            }
            //var id;
            //$(window).resize(function () {
            //    console.log("resize")
            //    clearTimeout(id);
            //    id = setTimeout(doneResizing, 500);
            //
            //});
            //
            //function doneResizing() {
            //    if (prevWindowW > $(window).width()) {
            //        //$("#eexcess_sidebar").css(assembleSidebarCss());
            //        adaptWikiElements(false);
            //
            //    } else {
            //        adaptWikiElements(true);
            //        //adaptWikiElements(false);
            //    }
            //
            //};
        });
    
    // init sidebar
    updateSidebar();

    function updateSidebar() {
        var visible = localStorage.getItem('extensionState') != 'hidden';

        var text;

        if (visible) { // add sidebar
            wikiLeftNavigationMargin = $("#left-navigation").css("margin-left");
            addSidebar();

            prevWindowW = $(window).width();
            prevWindowH = $(window).height();

            //window.addEventListener('message', newTrigger);
            window.onmessage = function (msg) {
                if (msg.data.event && msg.data.event === 'eexcess.queryTriggered') {
                    var contextKeywords;
                    var module = msg.data.data.module;
                    if (module === 'passive-search') {
                        contextKeywords = msg.data.data.contextKeywords;
                    } else {
                        contextKeywords = [{text: msg.data.data}];
                    }
                    handleSearch(contextKeywords, module);
                } else if (msg.data.event && msg.data.event === 'eexcess.openOptions') {
                    if (chrome.runtime.openOptionsPage) {
                        chrome.runtime.openOptionsPage();
                    } else {
                        $.fancybox.open({padding: 0, href: chrome.runtime.getURL('html/options.html'), type: 'iframe'});
                        // window.open(chrome.runtime.getURL('html/options.html'));
                    }
                } else if (msg.data.event && msg.data.event === 'eexcess.openLicenceFilterOptions') {
                    chrome.storage.sync.get(['licenceWhitelist'], function (result) {
                        var content = $('<div class="box"><h1>Whitelisted Licences</h1></div>');
                        var allowedLicences = $('<div id="allowed-licences"></div>');
                        var licenceWhitelist = result.licenceWhitelist ? JSON.parse(result.licenceWhitelist) : {};

                        for (var licence in licenceWhitelist) {
                            var li = $('<li><span>' + licence + '</span> </li>');
                            var rmBtn = $('<button class="fa fa-remove remove-licence-button">remove</button>');
                            rmBtn.click(function () {
                                var licence = $(this).parent().find('span').text();
                                licenceWhitelist[licence] = undefined;
                                chrome.storage.sync.set({licenceWhitelist: JSON.stringify(licenceWhitelist)});
                                $(this).parent().remove();
                            });
                            li.append(rmBtn);
                            allowedLicences.append(li);
                        }

                        content.append(allowedLicences);

                        $.fancybox({
                            content: content,
                            autoSize: true,
                            type: 'html'
                        });
                    });
                }
            };
        } else { // remove sidebar
            adaptWikiElements(true);

            $("#eexcess_sidebar").remove();
        }
    }

    function assembleSidebarCss() {
        var eexcess_sidebar_css = {
            "height": $(window).height(),
            "margin-right": "2px",
            "position": "fixed",
            "padding": "5px"
        };

        return eexcess_sidebar_css;
    }

    function adaptWikiElements(increase) {
        var sidebarWidth = $("#eexcess_sidebar").width();
        //there are 3 wikipedia ui elements whose sizes have to change when the sidebar appears:
        // mw-content-text, content and mw-head. they won't change their size when the body as a whole is
        // selected
        var wikiMwContentText = $("#mw-content-text");
        var wikiContent = $("#content");
        var wikiHeader = $("#mw-head");
        var wikiLeftNavigation = $("#left-navigation");


        if (increase) {
            wikiMwContentText.css("width", "90%");
            wikiContent.css("width", "90%");
            wikiHeader.css("right", 0);
            wikiLeftNavigation.css("float", "left");
            wikiLeftNavigation.css("margin-left", wikiLeftNavigationMargin);
            wikiLeftNavigation.css("padding-right", "0");

        } else {
            //reduce width of wiki elements
            wikiMwContentText.css("width", "84%");
            wikiContent.css("width", "84%");
            wikiHeader.css("right", "15%");
            wikiLeftNavigation.css("float", "right")
            wikiLeftNavigation.css("margin-left", "0");
            wikiLeftNavigation.css("padding-right", "12px");
        }
    }


    function addSidebar() {
        //check if relevant ui elements exist
        if ($(".wikiEditor-ui")[0] && $("#editform")[0]) {

            //$('body').wrapInner('<div id="eexcess_wiki_body" />');
            //$("#eexcess_wiki_body").css("width","80%")

            var iframeUrl = chrome.extension.getURL('visualization-widgets/SearchResultListVis/index.html');
            $("#mw-content-text").append($("<div id='eexcess_sidebar'><iframe src='" + iframeUrl + "' /></div>").hide());

            var sidebar = $("#eexcess_sidebar");
            adaptWikiElements(false);


            //adjust sidebar position and size according to the wiki editor
            sidebar.css(assembleSidebarCss());

            //sidebar.show();
            sidebar.slideToggle({direction: "left"});
            //sidebar.animate({width: "200"});
        } else {
            setTimeout(addSidebar, 10);
        }
    }



    function buildWikiQuery(contextKeywords) {
        var MAX_QUERY_SIZE = 300;
        var mainTopics = [];
        var sideTopics = [];

        $(contextKeywords).each(function () {
            var text = this.text.replace(/ *\([^)]*\)*/g, ""); // rm text appended to keyword in brackets

            if (this.isMainTopic) {
                mainTopics.push(text);
            } else {
                sideTopics.push(text);
            }
        });

        var query = "";

        for (var i = 0; i < mainTopics.length; i++) {
            if (i > 0) {
                // query += ' AND '; // -> replaced with or, because otherwise no results were found if the paragraph title was added as main topic -> TODO improve wiki query
                query += ' OR ';
            }

            if (mainTopics.length > 1 || sideTopics.length > 1) {
                query += '"' + mainTopics[i] + '"';
            } else {
                query += mainTopics[i];
            }

        }

        for (var i = 0; i < sideTopics.length; i++) {
            var topic = '';

            if (i === 0) {
                if (mainTopics.length > 0) {
                    // topic += ' AND '; // -> replaced with or, because otherwise no results were found if the paragraph title was added as main topic -> TODO improve wiki query
                    topic += ' OR ';

                    if (sideTopics.length > 1)
                        topic += '(';
                }
            } else {
                topic += ' OR ';
            }

            if (mainTopics.length > 1 || sideTopics.length > 1) {
                topic += '"' + sideTopics[i] + '"';
            } else {
                topic += sideTopics[i];
            }

            if (query.length + topic.length < MAX_QUERY_SIZE) {
                query += topic;
            } else {
                break;
            }
        }

        if (mainTopics.length > 0 && sideTopics.length > 1)
            query += ')';

        return query;
    }


// a new search has been triggered. send call to wiki commons as well as mendeley and zwb via the api TODO only one msg
    function handleSearch(contextKeywords, module) {
        var wikiQuery;
        var data;

        if (module === 'passive-search') {
            wikiQuery = buildWikiQuery(contextKeywords);
            data = {query: wikiQuery};
        } else {
            wikiQuery = contextKeywords[0].text;
            data = "msg";
        }

        iframes.sendMsgAll({
            event: 'eexcess.queryTriggered',
            data: data
        });

        var responseWiki;
        var responseEEXCESS;

        chrome.runtime.sendMessage({
            method: 'triggerQueryCommons',
            data: {
                origin: {module: "wikiRecommender"},
                query: wikiQuery
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




