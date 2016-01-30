require(['c4/cmsMarkup', 'c4/iframes', 'c4/paragraphDetection'], function (cms, iframes, paragraphDetection) {
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

    window.addEventListener('message', insertMarkupHandler);

    var detectLanguageHandler = function(msg) {
        if (msg.data.event == 'eexcess.detectLang.request') {
            iframes.sendMsgAll({event: 'eexcess.detectLang.response', language: cms.detectLang(markup)});
        }
    };

    window.addEventListener('message', detectLanguageHandler);

    // search on enter
    var searchResultsForParagraphOnEnter = function (e) {
        if (e.keyCode == 13) { // enter
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
                    window.postMessage({event: 'eexcess.queryTriggered', data: {contextKeywords: res.query.contextKeywords}}, '*');
                }
            });
        }
    };



    var initAugmentationComponents = function() {
        var augmentationComponents = {
            img: null,
            selection: null
        };

        augmentationComponents.img = $('<div id="search-ex-aug" title="Search with the (automatically recognised) Named Entities in this selection"></div>') // TODO replace text
            .css('position', 'absolute')
            .css('width', '30px')
            .css('height', '30px')
            .css('cursor', 'pointer')
            .css('title', '"button2"')
            .css('background-image', 'url("' + chrome.extension.getURL('media/img/search.png') + '")')
            .css('background-size', 'contain').hide();
        augmentationComponents.img.click(function(e) {
            window.postMessage({event: 'eexcess.queryTriggered', data: {contextKeywords: {text: activateAugmentationComponents.selection}}}, '*');
        });
        $('body').append(augmentationComponents.img);

        var activateAugmentationComponents = function (e) {
            if (window.getSelection().toString() !== '') {
                augmentationComponents.selection = window.getSelection();
                augmentationComponents.selection = augmentationComponents.selection.toString();

                var topPos = e.pageY + 10;
                augmentationComponents.img.css('top', topPos).css('left', e.pageX).fadeIn('fast');
            } else {
                augmentationComponents.img.fadeOut('fast');
            }
        };

        $('#wpTextbox1').bind('mouseup', activateAugmentationComponents);
    };

    var run = function() {
        $('#wpTextbox1').keyup(searchResultsForParagraphOnEnter);
        initAugmentationComponents();
    };
    var kill = function () {
        $('#wpTextbox1').unbind("keyup", searchResultsForParagraphOnEnter);
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