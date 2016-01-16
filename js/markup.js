require(['c4/cmsMarkup', 'c4/iframes', 'c4/paragraphDetection', 'c4/searchBar/searchBar'], function (cms, iframes, paragraphDetection, searchBar) {
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
    $('#wpTextbox1')[0].onkeyup = function(e) {
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
                    searchBar.setQuery(res.query.contextKeywords, 0);
                }
            });
        }
    }
});