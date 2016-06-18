require(['c4/cmsMarkup', 'c4/iframes', 'c4/paragraphDetection', 'c4/APIconnector'], function (cms, iframes, paragraphDetection, APIconnector) {
    var markup = cms.detectMarkup();

    var insertMarkupHandler = function (msg) {
        if (msg.data.event) {
            if (msg.data.event == 'eexcess.insertMarkup') {
                var documentInformation = msg.data.data;
                var markupText = cms.createMarkup(documentInformation, markup);

                if (markupText)
                    insertAtCaret($('textarea#wpTextbox1')[0], markupText);
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

    var showFancyBox = function(content) {
        $.fancybox({
            content: content,
            autoSize: true,
            type: 'html'
        });
    };

    var showPreviewPopup = function(data) {
        var preview = $('<div class="result-preview"><a class="fa fa-external-link pull-right" href="' + data.documentBadge.uri + '" target="_blank">open external</a><div><label class="preview-title">PREVIEW</label></div></div>');

        if (data.creator)
            preview.append('<div><label>Creator:</label> ' + data.creator + '</div>');

        if (data.date) {
            data.date = ("" + data.date).substr(0, 4);

            if (!isNaN(parseFloat(data.date)) && isFinite(data.date)) {
                preview.append('<div><label>Year:</label> ' + data.date + '</div>');
            }
        }

        preview.append('<div><label>Provider:</label> ' + data.documentBadge.provider + '</div>');

        if (data.licence) {
            var licenceDiv = $('<div><label>Licence:</label> ' + data.licence + ' </div>');

            var addBtn = $('<button class="fa fa-plus" style="display: none;"> add to whitelist-filter</button>');
            addBtn.click(function () {
                chrome.storage.local.get('licenceWhitelist', function (result) {
                    var whitelist = result.licenceWhitelist ? JSON.parse(result.licenceWhitelist) : undefined;

                    if (whitelist) {
                        whitelist[data.licence] = true;
                    } else {
                        whitelist = {};
                        whitelist[data.licence] = true;
                    }

                    chrome.storage.local.set({licenceWhitelist: JSON.stringify(whitelist)});
                    addBtn.hide();
                    rmBtn.show();
                });
            });

            var rmBtn = $('<button class="fa fa-remove" style="display: none;"> remove from whitelist-filter</button>');
            rmBtn.click(function () {
                chrome.storage.local.get('licenceWhitelist', function (result) {
                    var whitelist = JSON.parse(result.licenceWhitelist);
                    whitelist[data.licence] = false;

                    chrome.storage.local.set({licenceWhitelist: JSON.stringify(whitelist)});
                    rmBtn.hide();
                    addBtn.show();
                });
            });

            chrome.storage.local.get('licenceWhitelist', function (result) {
                var whitelist = result.licenceWhitelist ? JSON.parse(result.licenceWhitelist) : undefined;

                if (whitelist && whitelist[data.licence]) {
                    rmBtn.show();
                } else {
                    addBtn.show();
                }
            });

            licenceDiv.append(addBtn);
            licenceDiv.append(rmBtn);
            preview.append(licenceDiv);
        }

        preview.append('<div><label>Title:</label> ' + data.title + '</div>');

        if (data.description)
            preview.append('<div><label>Description:</label> ' + data.description + '</div>');

        var insertBtn = $('<button class="fa fa-arrow-right pull-right"> insert ' + (data.type == 'eexcess-text' ? 'reference' : 'image') + '</button>');
        insertBtn.click(function () {
            window.top.postMessage({event: 'eexcess.insertMarkup', data: data}, '*');
            $.fancybox.close();
        });
        preview.append(insertBtn);

        if (data.previewImage) {
            var preloadedImage = new Image();
            $(preloadedImage).attr({
                src: data.previewImage
            });

            $(preloadedImage).load(function (response, status, xhr) {
                preview.append(preloadedImage);
                showFancyBox(preview);
            });
        } else {
            showFancyBox(preview);
        }
    };

    var showPreviewHandler = function (msg) {
        if (msg.data.event) {
            if (msg.data.event.startsWith('eexcess.showPreview')) {
                var data = msg.data.data;

                if (data.type == 'eexcess-text') {
                    var detailsRequest = {
                        origin: {
                            "module": "wikiRecommender"
                        },
                        queryID: data.queryID,
                        documentBadge: [data.documentBadge]
                    };

                    APIconnector.getDetails(detailsRequest, function(result) {
                        if (result.status != 'error' && result.data.documentBadge[0].detail) {
                            if (result.data.documentBadge[0].detail.eexcessProxy.dccreator && result.data.documentBadge[0].detail.eexcessProxy.dccreator.length > 0)
                                data.creator = result.data.documentBadge[0].detail.eexcessProxy.dccreator;

                            if (result.data.documentBadge[0].detail.eexcessProxy.dctermsdate && result.data.documentBadge[0].detail.eexcessProxy.dctermsdate.length != '')
                                data.date = result.data.documentBadge[0].detail.eexcessProxy.dctermsdate;

                            if (result.data.documentBadge[0].provider && result.data.documentBadge[0].provider.length > 0)
                                data.documentBadge.provider = result.data.documentBadge[0].provider;

                            if (result.data.documentBadge[0].detail.eexcessProxy.dctitle && result.data.documentBadge[0].detail.eexcessProxy.dctitle.length > 0)
                                data.title = result.data.documentBadge[0].detail.eexcessProxy.dctitle;

                            if (result.data.documentBadge[0].detail.eexcessProxy.dcdescription && result.data.documentBadge[0].detail.eexcessProxy.dcdescription.length > 0)
                                data.description = result.data.documentBadge[0].detail.eexcessProxy.dcdescription;
                        }

                        if (result.status != 'error' && result.data.documentBadge[0].uri && result.data.documentBadge[0].uri.length > 0)
                            data.documentBadge.uri = result.data.documentBadge[0].uri;

                        showPreviewPopup(data);
                    });
                } else if (data.type == 'eexcess-image') {
                    showPreviewPopup(data)
                }
            }
        }
    };

    var run = function() {
        var textbox = $('#wpTextbox1');

        chrome.storage.local.get('autoQuery', function(result) {
            if (typeof result.autoQuery === 'undefined' || result.autoQuery) {
                textbox.bind('keyup', searchResultsForParagraphOnEnter);
            }
        });

        textbox.bind('mouseup', queryFromSelection);
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

    // init content scripts
    if (localStorage.getItem('extensionState') != 'hidden') {
        run();
    }

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request && request.method === 'visibilityChange') {
            if (localStorage.getItem('extensionState') != 'hidden') { // start sidebar
                run();
            } else { // hide/deactivate sidebar
                kill();
            }
        }
    });

    chrome.storage.onChanged.addListener(function(changes, areaName) {
        if (areaName === 'local' && changes.autoQuery) {
            var textbox = $('#wpTextbox1');
            
            if (changes.autoQuery.newValue) {
                textbox.bind('keyup', searchResultsForParagraphOnEnter);
            } else {
                textbox.unbind('keyup', searchResultsForParagraphOnEnter);
            }
        }
    });
});
