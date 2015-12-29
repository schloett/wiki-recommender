require(['c4/cmsMarkup'], function (cms) {
    var markup = cms.detectMarkup();

    var insertMarkupHandler = function (msg) {
        if (msg.data.event && msg.data.event.startsWith('eexcess.insertMarkup')) {
            var markupText;

            switch (msg.data.event) {
                case 'eexcess.insertMarkup.text':
                    markupText = cms.createMarkup(msg.data.data.documentInformation, markup);
                    break;
                case 'eexcess.insertMarkup.image':
                    break; // TODO
            }

            if (markupText) {
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

    window.addEventListener('message', insertMarkupHandler)
});