//-----LOGGING-----//
var queryID = 0;
var origin = "";

function initLogging(msg) {
    if (msg != undefined) {
        origin = {
            module: 'Wiki Search Result List Visualization'
        };
        queryID = msg.data.dataEEXCESS.data.queryID;
        logResultItemClicks();
    }
}

function logResultItemClicks() {
    var origin = {
        module: 'Wiki Search Result List Visualization'
    };
    $('.eexcess-isotope-grid').on('click', '.eexcess-isotope-grid-item', function () {
        var documentBadge = {
            id: $(this).attr('itemid'),
            uri: $(this).attr('itemuri'),
            provider: $(this).attr('provider')
        };
        LOGGING.itemOpened(origin, documentBadge, queryID);
    });
}


function logInsertedReferences(eventData) {
    var documentBadge = eventData.documentInformation.documentBadge;
    LOGGING.itemInsertedAsReference(origin, documentBadge, queryID);
}

