var currentFilter;
var language;

window.addEventListener('message', function (msg) {
    if (msg.data.event == 'eexcess.detectLang.response') {
        language = msg.data.language;
    }

    window.removeEventListener('message', this);
});

window.top.postMessage({event: 'eexcess.detectLang.request'}, '*');


//----- Assemble the searchResultGrid -----//

function addIsotopeGrid(msgWiki, msgEEXCESS) {
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $('#eexcess-loading').hide();


    //if (msgEEXCESS.data.result.length == 0) {
    //    $('.eexcess_empty_result').show();
    //}
    //else {
    var itemsEEXCESS = $(addGridEEXCESSResultItems(msgEEXCESS));
    var itemsWiki = $(addGridWikiResultItems(msgWiki));

    //var $itemsArray =$.map(itemsEEXCESS, function (v, i) {
    //    return [v, itemsWiki[i]];
    //}).toString();
    //
    //$items = $itemsArray + "";
    //console.log( itemsEEXCESS)
    //console.log(typeof itemsWiki)
    //
    //console.log($items)

    $('.eexcess_empty_result').hide();

var $items = itemsEEXCESS.add(itemsWiki)
    // init add image citation links
    $items.find('.eexcess-cite-link').click(function () {
        var title = $(this).attr('data-title');

        var eventData = {
            documentInformation: {
                mediaType: "image",
                title: title
            }
        };
        window.top.postMessage({event: 'eexcess.insertMarkup.image', data: eventData}, '*');
    });


    //init isotope
    $('.eexcess-isotope-grid').isotope({
        itemSelector: '.eexcess-isotope-grid-item',
        layoutMode: 'masonry',
        masonry: {
            columnWidth: 60
        }
        //getSortData: {
        //    itemTitle: '.itemTitle',
        //    date: '[itemDate]'
        //}
    });

    //check if all items are loaded to avoid overlap, then add items to container TODO has to be deactivated because
    // of wikis image sizes
    //$items.imagesLoaded(function () {
        $('.eexcess-isotope-grid').isotope('insert', $items);

    $(manageInterface);
    //});


    //------Filtering------//
    // bind filter button click
    $('#eexcess-isotope-filters').on('click', 'button', function () {
        var filterValue = $(this).attr('data-filter');
        // use filterFn if matches value
        $('.eexcess-isotope-grid').isotope({filter: filterValue});
    });

    //------Sorting------//
    // bind sort button click
    $('#eexcess-isotope-sorts').on('click', 'button', function () {
        var sortValue = $(this).attr('data-sort-value');
        $('.eexcess-isotope-grid').isotope({sortBy: sortValue});
    });


    //}

    function addGridEEXCESSResultItems(msg) {

        var items = '';


        $.each(msg.data.result, function (idx, val) {

                var mediaType = val.mediaType;
                var itemTitle = val.title;
                var itemDate = ' itemDate = "' + val.date + '" ';
                var previewImage = val.previewImage;

                var itemDescription = val.description;
                var generatingQuery = ' generatingQuery = "' + val.generatingQuery + '"';

                var itemID = val.documentBadge.id;


                //cleaning up ids as fancybox is using them for referencing, which doesn't handle spaces and slashes very well
                var cleanID = itemID.replace(/\//g, '').replace(/ /g, '');
                var itemHrefAttr = ' href="#' + cleanID + '" ';
                var itemCleanIdAttr = ' id = "' + cleanID + '" ';


                //links result page
                var itemLink = '<a title="open" class="eexcess-result-link fa fa-external-link " target="_blank" href="' + val.documentBadge.uri + '" />';
                var itemLinkLightbox = '<a class="fa fa-external-link eexcess-result-link-lightbox" target="_blank"' +
                    ' href="' + val.documentBadge.uri + '"/>';

                //citation
                var citeLink = '<a title="insert reference" class="eexcess-result-link eexcess-cite-link fa fa-link"' +
                    itemHrefAttr + '></a><div style="display:none" class="eexcess-document-information">' + JSON.stringify(val) + '</div>';


                //assemble documentBadge for logging
                var documentBadge = 'itemId = "' + val.documentBadge.id + '" itemURI = "' + val.documentBadge.uri + '" provider =' +
                    ' "' + val.documentBadge.provider + '"';


                // add "isotoped" items
                if (mediaType == "IMAGE" || mediaType == "image") {
                    if (previewImage == undefined) {

                        //previewImage = "http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=image";
                        item = '<div class ="eexcess-isotope-grid-item eexcess-image eexcess-other-without-preview"'
                            + documentBadge + itemDate + generatingQuery + ' data-category="eexcess-image">' +
                            ' <div class="eexcess-title eexcess-image itemTitle"><div class="eexcess-title-content">' +
                            itemTitle + '</div></div>' + itemLink + citeLink + '</div>';
                    } else {

                        item = '<div class ="eexcess-isotope-grid-item eexcess-image eexcess-other-with-preview"'
                            + documentBadge + itemDate + generatingQuery + ' data-category="eexcess-image">'
                            + ' <div class="eexcess-title-other-with-preview-area eexcess-image itemTitle"> ' +
                            '<div class="eexcess-title-other-with-preview-content itemTitle" ><div class="eexcess-title-content">' +
                            itemTitle + '</div></div></div><img src="' + previewImage + '" />' + itemLink + citeLink + '</div>';
                    }
                    items += item;
                }
                else if (mediaType == "TEXT" || mediaType == "text") {

                    //text results without description
                    if (itemDescription == undefined) {

                        //text results without description and without preview
                        if (previewImage == undefined) {
                            //previewImage = 'http://eexcess-dev.joanneum.at/eexcess-federated-recommender-web-service-1.0-SNAPSHOT/recommender/getPreviewImage?type=text';

                            item = '<div class = "eexcess-isotope-grid-item eexcess-text eexcess-text-without-preview"'
                                + documentBadge + itemDate + generatingQuery + ' data-category="eexcess-text">' +
                                ' <div class="eexcess-title eexcess-text itemTitle"><div class="eexcess-title-content">' +
                                itemTitle + '</div></div>' + itemLink + citeLink + '</div>';

                        }
                        //text results without description and with preview
                        else {
                            item = '<div class = "eexcess-isotope-grid-item eexcess-text eexcess-other-with-preview "'
                                + documentBadge + itemDate + generatingQuery + ' data-category="eexcess-text">' +
                                '<div class="eexcess-title-other-with-preview-area eexcess-text itemTitle">' +
                                '<div class="eexcess-title-other-with-preview-content itemTitle" ><div class="eexcess-title-content">' +
                                itemTitle + '</div></div></div><img src="' + previewImage + '" />' + itemLink + citeLink + '</div>';

                        }
                    }


                    //text results with description
                    else {
                        //text results with description and without preview
                        if (previewImage == undefined) {

                            item = '<div class = "eexcess-isotope-grid-item eexcess-text eexcess-text-without-preview eexcess-text-without-preview-with-description eexcess-with-preview-hover"'
                                + documentBadge + itemDate + generatingQuery + ' data-category="eexcess-text">' +
                                ' <div class="eexcess-title-with-description-text eexcess-text itemTitle">' +
                                itemTitle + '</div>' + ' <div class=" eexcess-description-text eexcess-text-with-preview-hover ">' + itemDescription + '</div>' +
                                itemLink + citeLink + '</div>';

                        }
                        //text results with description and with preview
                        else {
                            //console.log("i have both!")
                            item = '<div class = "eexcess-isotope-grid-item eexcess-text eexcess-text-with-preview eexcess-with-preview-hover"'
                                + documentBadge + itemDate + generatingQuery + ' data-category="eexcess-text">' +
                                ' <div class="eexcess-title-with-description-text eexcess-text itemTitle"><b></b>' +
                                itemTitle + "<b></div>" + ' <div class="eexcess-description-text">' + itemDescription + "</div>" +
                                '<img src="' + previewImage + '" />' + itemLink + citeLink + '</div>';
                        }
                    }
                    items+=item;
                }
            }
        );
        return items;
    }
}


function addGridWikiResultItems(msg) {

    var items = '';

    $.each(msg.query.pages, function (idx, val) {

        var itemTitle = val.title.split(/[:.]+/)[1];

        var itemDescription = val.description;

        var pageID = val.pageid;
        //console.log(val.imageinfo[0].url);
        var itemImageUrl = val.imageinfo.url;

        //result link
        var itemLink = '<a title="open" class="eexcess-result-link fa fa-external-link " target="_blank" href="https://' + language + '.wikipedia.org/wiki/' + val.title.replace(/ /g, "_") + '" />';

        //image insertion link
        var insertLink = '<a title="insert" class="eexcess-result-link eexcess-cite-link fa fa-link"' +
            ' href="javascript:void(0)" data-title="' + val.title + '" ></a>';

        item = '<div class = "eexcess-isotope-grid-item eexcess-image eexcess-other-with-preview "'
            + ' data-category="eexcess-image">' +
            '<div class="eexcess-title-other-with-preview-area eexcess-image itemTitle">' +
            '<div class="eexcess-title-other-with-preview-content itemTitle" ><div class="eexcess-title-content">' +
            itemTitle + '</div></div></div><img src="' + val.imageinfo[0].url + '" />' + itemLink + insertLink + '</div>';


        items+=item;
    });

    return items;
}

// adding cite links
function addCitationInserting() {
    $(".eexcess-cite-link").click(function () {
        var eventData = {
            documentInformation: JSON.parse($(this).parent().find(".eexcess-document-information").text())
        };

        window.top.postMessage({event: 'eexcess.insertMarkup.text', data: eventData}, '*');
    });
}

//-----Interface, shorten Titles, assemble Buttons, Filters, LoadingBar, Errors etc.-----//
function manageInterface() {

    $(addFilterCounter);
    $(bindDescriptionHover);
    $(bindLinkHover);
    $(addCitationInserting);

    $('.eexcess-title-other-with-preview-content').dotdotdot();
    $('.eexcess-title-with-description-text').dotdotdot();
    $('.eexcess-description-text').dotdotdot();
    $('.eexcess-title-text-with-preview').dotdotdot();
    $('.eexcess-title-content').dotdotdot();


}


//----- -----//
function bindDescriptionHover() {
    $(".eexcess-with-preview-hover").hover(function () {
        $(this).find('.eexcess-text-with-preview-hover').css({'opacity': '1'}, 100)
    }, function () {
        $(this).find('.eexcess-text-with-preview-hover').css({'opacity': '0.3'}, 100)
    })
}

function bindLinkHover() {
    $(".eexcess-isotope-grid-item").hover(function () {
        $(this).find('.eexcess-result-link').css({'opacity': '1'}, 100)
    }, function () {
        $(this).find('.eexcess-result-link').css({'opacity': '0'}, 100)
    })
}

function showLoadingBar() {
    $('.eexcess_empty_result').hide();
    $('#eexcess-isotope-filtering-and-sorting').hide();
    $('#eexcess-isotope-filters').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        currentFilter = $buttonGroup.find('.is-checked').attr("class");
    });

    $("#eexcess-isotope-filters").empty();
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $("div").remove(".eexcess-isotope-grid-item");
    $('#eexcess-loading').show();
}

function showError(errorData) {
    $('#eexcess-loading').hide();
    $('.eexcess_empty_result').hide();
    if (errorData === 'timeout') {
        $('.eexcess_error_timeout').show();
    }
    else {
        $('.eexcess_error').show();
    }
}


$(document).ready(function () {
//-----Filter-Buttons-----//
// change is-checked class on buttons
    $('#eexcess-isotope-filters').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function () {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
        });
    });
    $('#eexcess-isotope-sorts').each(function (i, buttonGroup) {
        var $buttonGroup = $(buttonGroup);
        $buttonGroup.on('click', 'button', function () {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $(this).addClass('is-checked');
        });
    });


});

function addFilterCounter() {

//TODO generalize
    var buttonGroup = $("#eexcess-isotope-filters");
    buttonGroup.empty();

    //if no filter was selected, show all will be selected
    if (currentFilter == undefined) {
        buttonGroup.append(' <button class="eexcess-isotope-button show-all is-checked" data-filter="*">all' +
            ' </button>');
    } else {
        buttonGroup.append(' <button class="eexcess-isotope-button show-all " data-filter="*">all </button>');
    }


    var numberOfImages = $('.eexcess-isotope-grid-item.eexcess-image').size();
    var numberOfTexts = $('.eexcess-isotope-grid-item.eexcess-text').size();

    if (numberOfImages > 0) {
        var imageFilterButton = '<button class="eexcess-isotope-button eexcess-image"' +
            ' data-filter=".eexcess-image">img (' + numberOfImages + ')</button>';
        buttonGroup.append(imageFilterButton);
        if (currentFilter != undefined && currentFilter.indexOf("eexcess-image") > -1) {
            $('.eexcess-isotope-button.eexcess-image').addClass('is-checked');
        }
    }

    if (numberOfTexts > 0) {
        var textFilterButton = '<button class="eexcess-isotope-button eexcess-text"' +
            ' data-filter=".eexcess-text">txt (' + numberOfTexts + ')</button>';
        buttonGroup.append(textFilterButton);
        if (currentFilter != undefined && currentFilter.indexOf("eexcess-text") > -1) {
            $('.eexcess-isotope-button.eexcess-text').addClass('is-checked');
        }
    }

    // if previous selected filter doesn't have any new results select "show-all"
    if (currentFilter != undefined) {
        if ((numberOfImages == 0 && currentFilter.indexOf("eexcess-image") > -1)
            || (numberOfTexts == 0 && currentFilter.indexOf("eexcess-text") > -1)) {
            $(".show-all").addClass("is-checked");
            $('.eexcess-isotope-grid').isotope({filter: '*'});
        }
    }
    $('#eexcess-isotope-filtering-and-sorting').show();

}


//-----LOGGING-----//
function logResultItemClicks(msg) {

    var origin = {
        module: 'Search Result List Visualization'
    };
    $('.eexcess-isotope-grid').on('click', '.eexcess-isotope-grid-item', function () {
        var item = $('.eexcess-isotope-grid-item');


        var documentBadge =
        {
            id: item.attr('itemid'),
            uri: item.attr('itemuri'),
            provider: item.attr('provider')
        };
        LOGGING.itemOpened(origin, documentBadge, msg.data.queryID);
    });
}

