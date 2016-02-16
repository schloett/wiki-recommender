var lastProcessedQueryID;

window.onmessage = function (msg) {
    if (msg.data.event) {
        if (msg.data.event === 'eexcess.queryTriggered') {
            // new search has been triggered somewhere, show loading bar or similar
            $(showLoadingBar());

            // set query to search bar
            var query = msg.data.data.query;

            if (query)
                $("#wiki-recommender-active-search").val(query);
        }

        // listens for the arrival of two result sets, EEXCESS and Wiki
        if (msg.data.event && msg.data.event === 'eexcess.newResults') {
            // new results are available in msg.data.data
            if (lastProcessedQueryID && lastProcessedQueryID === msg.data.data.queryID) {
                // data already processed, do nothing
            } else {

                console.log(msg);
                var msgWiki = msg.data.dataWiki.data;
                var msgEEXCESS = msg.data.dataEEXCESS;
                //$(addWikiGrid(msg.data.data.data));
                $(addIsotopeGrid(msgWiki, msgEEXCESS));

                $(logResultItemClicks(msg));

                //make sure elements exist
                var checkExist = setInterval(function () {
                    if ($('.eexcess-isotope-grid-item').length) {
                        clearInterval(checkExist);
                        $(addFilterCounter);
                        $(manageInterface);
                    }
                }, 10);

                lastProcessedQueryID = msg.data.dataEEXCESS.queryID;
            }
        }

        else if (msg.data.event === 'eexcess.error') {
            $(showError(msg.data.data));
        }

    }
}