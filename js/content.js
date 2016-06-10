require(['c4/cmsMarkup', 'c4/iframes', 'c4/paragraphDetection', 'c4/APIconnector'], function (cms, iframes, paragraphDetection, APIconnector) {
    var markup = cms.detectMarkup();

    var insertMarkupHandler = function (msg) {
        if (msg.data.event) {
            if (msg.data.event.startsWith('eexcess.insertMarkup')) {
                var markupText;
                var documentInformation = msg.data.data.documentInformation;

                switch (msg.data.event) {
                    case 'eexcess.insertMarkup.text':
                        markupText = cms.createMarkup(documentInformation, markup);
                        break;
                    case 'eexcess.insertMarkup.image':
                        markupText = cms.createMarkup(documentInformation, markup);
                        break;
                }

                if (markupText) {
                    insertAtCaret($('textarea#wpTextbox1')[0], markupText);
                }
            }
        }
    };

    var insertAtCaret = function (textarea, text) {
        var startPos = textarea.selectionStart;
        var endPos = textarea.selectionEnd;
        var scrollTop = textarea.scrollTop;
        textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos, textarea.value.length);
        textarea.focus();
        textarea.selectionStart = startPos + text.length;
        textarea.selectionEnd = startPos + text.length;
        textarea.scrollTop = scrollTop;
    };

    var detectLanguageHandler = function(msg) {
        if (msg.data.event == 'eexcess.detectLang.request') {
            iframes.sendMsgAll({event: 'eexcess.detectLang.response', language: cms.detectLang(markup)});
        }
    };

    // search on enter
    var searchResultsForParagraphOnEnter = function (e) {
        if (e.keyCode == 13) { // enter
            // show loading bar
            iframes.sendMsgAll({event: 'eexcess.queryTriggered', data: "msg"});

            // detect active paragraph
            var cursorPosition = this.selectionStart;

            // find paragraph start
            var delimiter = "==";
            var text = this.value;
            var start = 0;
            var pos = this.value.indexOf(delimiter);

            while (pos != -1 && pos < cursorPosition) {
                start = pos + delimiter.length;
                pos = this.value.indexOf(delimiter, start);
            }

            // find paragraph end
            var end = this.value.indexOf(delimiter, cursorPosition) - 1;

            if (end < 0) {
                end = text.length;
            }

            var paragraph = text.substring(start, end);

            // extract keywords & generate query
            paragraphDetection.paragraphToQuery(paragraph, function (res) {
                if (typeof res.query !== 'undefined') { // submit query
                    window.postMessage({event: 'eexcess.queryTriggered',
                        data: {
                            contextKeywords: res.query.contextKeywords,
                            module: 'passive-search'
                        }
                    }, '*');
                }
            });
        }
    };

    var augmentationComponents = {
        img: null,
        selection: null
    };

    var initAugmentationComponents = function () {
        augmentationComponents.img = $('<div id="search-ex-aug" title="Search with the (automatically recognised) Named Entities in this selection"></div>')
            .css('position', 'absolute')
            .css('width', '30px')
            .css('height', '30px')
            .css('cursor', 'pointer')
            .css('title', '"button2"')
            .css('background-image', 'url("' + chrome.extension.getURL('media/img/search.png') + '")')
            .css('background-size', 'contain').hide();

        augmentationComponents.img.click(function(e) {
            // show loading bar
            iframes.sendMsgAll({event: 'eexcess.queryTriggered', data: "msg"});

            paragraphDetection.paragraphToQuery(augmentationComponents.selection, function (res) {
                if (typeof res.query !== 'undefined') { // submit query
                    window.postMessage({event: 'eexcess.queryTriggered',
                        data: {
                            contextKeywords: res.query.contextKeywords,
                            module: 'passive-search'
                        }
                    }, '*');
                }
            });

            $(this).fadeOut('fast');
        });

        $('body').append(augmentationComponents.img);
    };

    var removeAugmentationComponents = function () {
        augmentationComponents.img.remove();
    };

    var queryFromSelection = function(e) {
        if (window.getSelection().toString() !== '') {
            augmentationComponents.selection = window.getSelection();
            augmentationComponents.selection = augmentationComponents.selection.toString();

            var topPos = e.pageY + 10;
            augmentationComponents.img.css('top', topPos).css('left', e.pageX).fadeIn('fast');
        } else {
            augmentationComponents.img.fadeOut('fast');
        }
    };

    // init api connector with origin
    chrome.storage.sync.get(['uuid'], function (result) {
        var uuid;

        if (result.uuid) {
            uuid = result.uuid;
        } else {
            uuid = util.randomUUID();
            chrome.storage.sync.set({uuid: uuid});
        }

        var manifest = chrome.runtime.getManifest();
        var settings = {
            origin: {
                userID: uuid,
                clientType: manifest.name + "/chrome-extension",
                clientVersion: manifest.version
            }
        };

        APIconnector.init(settings);
    });

    var showPreviewPopup = function(title, provider, uri, img, description, creator, year) {
        var preview = $('<div class="result-preview"><div><label class="preview-title">PREVIEW</label></div></div>');

        if (creator)
            preview.append('<div><label>Creator:</label> ' + creator + '</div>');

        if (year)
            preview.append('<div><label>Year:</label> ' + year + '</div>');

        preview.append('<div><label>Provider:</label> ' + provider + '</div>');
        preview.append('<div><label>Title:</label> ' + title + '</div>');

        if (description)
            preview.append('<div><label>Description:</label> ' + description + '</div>');

        if (img)
            preview.append('<img src="' + img + '" />');

        preview.append('<a class="pull-right" href="' + uri + '" target="_blank">open external</a>');

        $.fancybox({ content: preview });
    };

    var showPreviewHandler = function (msg) {
        if (msg.data.event) {
            if (msg.data.event.startsWith('eexcess.showPreview')) {
                if (msg.data.data.img) { // eexcess-image
                    showPreviewPopup(msg.data.data.title, msg.data.data.provider, msg.data.data.uri, msg.data.data.img)
                } else { // eexcess-text
                    APIconnector.getDetails(msg.data.data.detailsRequest, function(result) {
                        var creator, year, provider, title, description, uri;

                        if (result.data.documentBadge[0].detail) {
                            if (result.data.documentBadge[0].detail.eexcessProxy.dccreator && result.data.documentBadge[0].detail.eexcessProxy.dccreator.length > 0)
                                creator = result.data.documentBadge[0].detail.eexcessProxy.dccreator;

                            if (result.data.documentBadge[0].detail.eexcessProxy.dctermsdate && result.data.documentBadge[0].detail.eexcessProxy.dctermsdate.length > 0)
                                year = result.data.documentBadge[0].detail.eexcessProxy.dctermsdate;

                            if (result.data.documentBadge[0].provider && result.data.documentBadge[0].provider.length > 0) {
                                provider = result.data.documentBadge[0].provider;
                            } else {
                                provider = msg.data.data.detailsRequest.documentBadge.provider;
                            }

                            if (result.data.documentBadge[0].detail.eexcessProxy.dctitle && result.data.documentBadge[0].detail.eexcessProxy.dctitle.length > 0) {
                                title = result.data.documentBadge[0].detail.eexcessProxy.dctitle;
                            } else {
                                title = msg.data.data.title;
                            }

                            if (result.data.documentBadge[0].detail.eexcessProxy.dcdescription && result.data.documentBadge[0].detail.eexcessProxy.dcdescription.length > 0)
                                description = result.data.documentBadge[0].detail.eexcessProxy.dcdescription;
                        }

                        if (result.data.documentBadge[0].uri && result.data.documentBadge[0].uri.length > 0) {
                            uri = result.data.documentBadge[0].uri;
                        } else {
                            uri = msg.data.data.detailsRequest.documentBadge.uri;
                        }

                        showPreviewPopup(title, provider, uri, undefined, description, creator, year);
                    });
                }

                // make link https TODO replace with custom details view with same layout for every provider
                // var link = msg.data.data.link;
                // var protocol = 'http';

                // if (link.startsWith(protocol) && link[protocol.length] == ':') {
                //     link = link.substr(0, protocol.length) + 's' + link.substr(protocol.length);
                // }

                // $.fancybox.open({padding: 0, href: link, type: 'iframe'});
            }
        }
    };

    var run = function() {
        $('#wpTextbox1').bind('keyup', searchResultsForParagraphOnEnter)
            .bind('mouseup', queryFromSelection);
        initAugmentationComponents();

        window.addEventListener('message', detectLanguageHandler);
        window.addEventListener('message', insertMarkupHandler);
        window.addEventListener('message', showPreviewHandler);
    };
    var kill = function () {
        $('#wpTextbox1').unbind('keyup', searchResultsForParagraphOnEnter)
            .unbind('mouseup', queryFromSelection);
        removeAugmentationComponents();

        window.removeEventListener('message', detectLanguageHandler);
        window.addEventListener('message', insertMarkupHandler);
        window.addEventListener('message', showPreviewHandler);
    };

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request && request.method === 'visibility') {
            if (request.data) { // start sidebar
                run();
            } else { // hide/deactivate sidebar
                kill();
            }
        }
    });
});
