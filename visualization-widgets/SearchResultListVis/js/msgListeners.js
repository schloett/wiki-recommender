var lastProcessedQueryID;

window.onmessage = function (msg) {
    if (msg.data.event) {

        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            $(showLoadingBar());
        }

        if (msg.data.event && msg.data.event === 'eexcess.newResultsElse') {
            // new results are available in msg.data.data
            if (lastProcessedQueryID && lastProcessedQueryID === msg.data.data.queryID) {
                // data already processed, do nothing
            } else {
                //$(addWikiGrid(msg.data.data.data));
                $(addIsotopeGrid(msg.data.data));
                $(logResultItemClicks(msg));

                //make sure elements exist
                var checkExist = setInterval(function () {
                    if ($('.eexcess-isotope-grid-item').length) {
                        clearInterval(checkExist);
                        $(addFilterCounter);
                        $(truncateTitles);
                    }
                }, 10);

                lastProcessedQueryID = msg.data.data.queryID;
            }
        }

        if (msg.data.event && msg.data.event === 'eexcess.newResultsWiki') {
            $(addWikiGrid(msg.data.data.data));
        }

        else if (msg.data.event === 'eexcess.error') {
            $(showError(msg.data.data));
        }

    }


}

