
    // Prevent form submission
$("form").submit(function (event) {
    $("div").remove(".eexcess-isotope-grid-item");
    event.preventDefault();
    var input = $("#wiki-recommender-active-search").val();


    //$(getCommonsImages(input));

    chrome.runtime.sendMessage({
        method: 'triggerQueryCommons', data: {
            origin: {module: "wikiRecommender"},
            contextKeywords: [
                {text: input}
            ]
        }
    }, function (response) {
        //console.log(response)
        addWikiGrid(response.data);

        //window.top.postMessage({event: 'eexcess.newResults', data: response}, '*');
    });
});