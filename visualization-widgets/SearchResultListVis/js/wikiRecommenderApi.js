/**
 * Created by lisa on 11/12/15.
 */

    // Prevent form submission

//$("form").submit(function (event) {

function getCommonsImages(input){
    console.log("pressed");
    //var input = $("#wiki-recommender-active-search").val();

    //using mediawikiJS to query wikimedia
    //var mwjs = new MediaWikiJS('https://en.wikipedia.org', {action: 'query', srsearch: input}, function (data) {
    //    'use strict';
    //    var pages = data.query.pages;
    //
    //    console.log('You searched for: ' + pages[Object.keys(pages)[0]].title);
    //    console.log(pages);
    //    console.log(data);
    //});https://en.wikipedia.org/w/api.php?action=query&list=allimages&ailimit=5&aifrom=
    // https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=%22chartres+cathedral%22&gsrlimit=20&gsroffset=20&prop=imageinfo&iiprop=url

    var url = "https://commons.wikimedia.org/w/api.php?";
    $.ajax({
        url: url,
        //jsonp: "false", -> removed to fix security policy issue (jsonp not allowed in chrome-extension)
        //dataType: 'jsonp',
        data: {
            action: "query",
            generator: "search",
            gsrnamespace: "6",
            gsrsearch: input,
            gsrlimit: "20",
            gsroffset: "20",
            prop: "imageinfo",
            iiprop: "url",
            format: "json",
            thumbwidth: "130"

        },
        xhrFields: {withCredentials: true},
        success: function (response) {
            console.log(response);
            $(addWikiGrid(response));
        }
    })
};