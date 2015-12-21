require(['c4/cmsMarkup'], function(cms) {
    var markup = cms.detectMarkup();
    window.addEventListener('message', insertMarkupHandler);

    var insertMarkupHandler = function(msg) {
        if (msg.data.event && msg.data.event.startsWith('eexcess.insertMarkup')) {
            switch (msg.data.event) {
                case 'eexcess.insertMarkup.text':
                    //api.sendLog(api.insertMarkup.text, msg.data.data);
                    var insertAtCaret = function(textarea, text) {
                        var startPos = textarea.selectionStart;
                        var endPos = textarea.selectionEnd;
                        var scrollTop = textarea.scrollTop;
                        textarea.value = textarea.value.substring(0, startPos) + text + textarea.value.substring(endPos, textarea.value.length);
                        textarea.focus();
                        textarea.selectionStart = startPos + text.length;
                        textarea.selectionEnd = startPos + text.length;
                        textarea.scrollTop = scrollTop;
                    };

                    insertAtCaret($('textarea#wpTextbox1')[0],'title:' + msg.data.data.title + ',uri:' + msg.data.data.uri);
                    break;
                case 'eexcess.insertMarkup.image':
                    //api.sendLog(api.insertMarkup.image, msg.data.data);
                    break;
            }
        }
    };
});