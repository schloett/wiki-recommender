/**
 * Created by lisa on 11/12/15.
 */
var currentFilter;
var language;

window.addEventListener('message', function(msg) {
    if (msg.data.event == 'eexcess.detectLang.response') {
        language = msg.data.language;
    }

    window.removeEventListener('message', this);
});

window.top.postMessage({event: 'eexcess.detectLang.request'}, '*');


//----- Assemble the searchResultGrid -----//
function addWikiGrid(msg) {
    $('.eexcess_error').hide();
    $('.eexcess_error_timeout').hide();
    $('#eexcess-loading').hide();


    ////if (msg.data.data.result.length == 0) {
    ////    $('.eexcess_empty_result').show();
    ////}
    //else {
    var $items = $(addWikiGridResultItems(msg));
    $('.eexcess_empty_result').hide();

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
            columnWidth: 50
        }
        //SORTING DISABLED,
        //getSortData: {
        //    itemTitle: '.itemTitle',
        //    date: '[itemDate]'
        //}
    });

    //check if all items are loaded to avoid overlap, then add items to container TODO images too large
    //$items.imagesLoaded(function () {
    $('.eexcess-isotope-grid').isotope('insert', $items);
    $(addFilterCounter);
    $(truncateTitles);
    $(bindDescriptionHover);
    $(bindLinkHover);
    //$(".eexcess-lightbox-image").fancybox({
    //    close: [27], // escape key
    //    //type: "image",
    //    helpers: {
    //        overlay: {
    //            css: {
    //                'background': 'rgba(89, 89, 89, 0.6)'
    //            }
    //        }
    //    }
    //});
    //$(".eexcess-lightbox-inline").fancybox({
    //    close: [27], // escape key
    //    type: "inline",
    //    helpers: {
    //        overlay: {
    //            css: {
    //                'background': 'rgba(89, 89, 89, 0.6)'
    //            }
    //        }
    //    }
    //});


    //});


    //------Filtering------//
    // bind filter button click
    $('#eexcess-isotope-filters').on('click', 'button', function () {
        var filterValue = $(this).attr('data-filter');
        // use filterFn if matches value
        $('.eexcess-isotope-grid').isotope({filter: filterValue});
    });

    //------Sorting DISABLED------//
    // bind sort button click
    //$('#eexcess-isotope-sorts').on('click', 'button', function () {
    //    var sortValue = $(this).attr('data-sort-value');
    //    $('.eexcess-isotope-grid').isotope({sortBy: sortValue});
    //});


}
function addWikiGridResultItems(msg) {

    var items = '';

    $.each(msg.query.pages, function (idx, val) {

        var itemTitle = val.title.split(/[:.]+/)[1];

        var itemDescription = val.description;

        var pageID = val.pageid;
        console.log(val.imageinfo[0].url);
        var itemImageUrl = val.imageinfo.url;

        var itemLink = '<a title="open" class="eexcess-result-link fa fa-external-link " target="_blank" href="https://' + language + '.wikipedia.org/wiki/' + val.title.replace(/ /g,"_") + '" />';
        var insertink = '<a title="insert" class="eexcess-result-link eexcess-cite-link fa fa-link" href="javascript:void(0)" data-title="' + val.title +  '" ></a>';

        item = '<div class = "eexcess-isotope-grid-item eexcess-wiki-recommender-image eexcess-other-with-preview "'
            + ' data-category="eexcess-wiki-recommender-image">' +
            '<div class="eexcess-title-other-with-preview-area eexcess-wiki-recommender-image itemTitle">' +
            '<div class="eexcess-title-other-with-preview-content itemTitle" ><div class="eexcess-title-content">' +
            itemTitle + '</div></div></div><img src="' + val.imageinfo[0].url + '" />' + itemLink + insertink + '</div>';

        items += item;
    });

    return items;
}


//-----Interface, shorten Titles, assemble Buttons, Filters, LoadingBar, Errors etc.-----//
function truncateTitles() {
    $('.eexcess-title-other-with-preview-content').dotdotdot();
    $('.eexcess-title-with-description-text').dotdotdot();
    $('.eexcess-description-text').dotdotdot();
    $('.eexcess-title-text-with-preview').dotdotdot();
    $('.eexcess-title-content').dotdotdot();
}


//----- -----//
//hover(function() {
//    $( this ).fadeOut( 100 );
//    $( this ).fadeIn( 500 );
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
    //$('#eexcess-isotope-sorts').each(function (i, buttonGroup) {
    //    var $buttonGroup = $(buttonGroup);
    //    currentSort = $buttonGroup.find('.is-checked');
    //});


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
    //SORTING DISABLED
    //$('#eexcess-isotope-sorts').each(function (i, buttonGroup) {
    //    var $buttonGroup = $(buttonGroup);
    //    $buttonGroup.on('click', 'button', function () {
    //        $buttonGroup.find('.is-checked').removeClass('is-checked');
    //        $(this).addClass('is-checked');
    //    });
    //});


});

function addFilterCounter() {

//TODO generalize
//    var buttonGroup = $("#eexcess-isotope-filters");
//    buttonGroup.empty();
//
//    //if no filter was selected, show all will be selected
//    if (currentFilter == undefined) {
//        buttonGroup.append(' <button class="eexcess-isotope-button show-all is-checked" data-filter="*">show all' +
//            ' </button>');
//    } else {
//        buttonGroup.append(' <button class="eexcess-isotope-button show-all " data-filter="*">show all </button>');
//    }
//
//
//    var numberOfImages = $('.eexcess-isotope-grid-item.eexcess-image').size();
//    var numberOfTexts = $('.eexcess-isotope-grid-item.eexcess-text').size();
//    var numberOfVideos = $('.eexcess-isotope-grid-item.eexcess-video').size();
//    var numberOfAudios = $('.eexcess-isotope-grid-item.eexcess-audio').size();
//    var numberOf3D = $('.eexcess-isotope-grid-item.eexcess-3d').size();
//    var numberOfUnknown = $('.eexcess-isotope-grid-item.eexcess-unknown').size();
//
//    if (numberOfImages > 0) {
//        var imageFilterButton = '<button class="eexcess-isotope-button eexcess-image"' +
//            ' data-filter=".eexcess-image">images (' + numberOfImages + ')</button>';
//        buttonGroup.append(imageFilterButton);
//        if (currentFilter != undefined && currentFilter.indexOf("eexcess-image") > -1) {
//            $('.eexcess-isotope-button.eexcess-image').addClass('is-checked');
//        }
//    }
//
//    if (numberOfTexts > 0) {
//        var textFilterButton = '<button class="eexcess-isotope-button eexcess-text"' +
//            ' data-filter=".eexcess-text">text (' + numberOfTexts + ')</button>';
//        buttonGroup.append(textFilterButton);
//        if (currentFilter != undefined && currentFilter.indexOf("eexcess-text") > -1) {
//            $('.eexcess-isotope-button.eexcess-text').addClass('is-checked');
//        }
//    }
//
//    if (numberOfVideos > 0) {
//        var videoFilterButton = ' <button class="eexcess-isotope-button eexcess-video"' +
//            ' data-filter=".eexcess-video">video (' + numberOfVideos + ')</button>';
//        buttonGroup.append(videoFilterButton);
//        if (currentFilter != undefined && currentFilter.indexOf("eexcess-video") > -1) {
//            $('.eexcess-isotope-button.eexcess-video').addClass('is-checked');
//        }
//    }
//
//    if (numberOfAudios > 0) {
//        var audioFilterButton = ' <button class="eexcess-isotope-button eexcess-audio"' +
//            ' data-filter=".eexcess-audio">audio (  ' + numberOfAudios + ')</button>';
//        buttonGroup.append(audioFilterButton);
//        if (currentFilter != undefined && currentFilter.indexOf("eexcess-audio") > -1) {
//            $('.eexcess-isotope-button.eexcess-audio').addClass('is-checked');
//        }
//    }
//
//    if (numberOf3D > 0) {
//        var threedFilterButton = ' <button class="eexcess-isotope-button eexcess-3d" data-filter=".eexcess-3d">3d' +
//            ' (' + numberOf3D + ')</button>';
//        buttonGroup.append(threedFilterButton);
//        if (currentFilter != undefined && currentFilter.indexOf("eexcess-3d") > -1) {
//            $('.eexcess-isotope-button.eexcess-audio').addClass('is-checked');
//        }
//    }
//
//    if (numberOfUnknown > 0) {
//        var unknownFilterButton = '<button class="eexcess-isotope-button eexcess-unknown"' +
//            ' data-filter=".eexcess-unknown"> unknown (' + numberOfUnknown + ')</button>';
//        buttonGroup.append(unknownFilterButton);
//        if (currentFilter != undefined && currentFilter.indexOf("eexcess-unknown") > -1) {
//            $('.eexcess-isotope-button.eexcess-unknown').addClass('is-checked');
//        }
//    }
//
//    // if previous selected filter doesn't have any new results select "show-all"
//    if (currentFilter != undefined) {
//        if ((numberOfImages == 0 && currentFilter.indexOf("eexcess-image") > -1)
//            || (numberOfTexts == 0 && currentFilter.indexOf("eexcess-text") > -1)
//            || (numberOfAudios == 0 && currentFilter.indexOf("eexcess-audio") > -1)
//            || (numberOfVideos == 0 && currentFilter.indexOf("eexcess-video") > -1)
//            || (numberOf3D == 0 && currentFilter.indexOf("eexcess-3d") > -1)
//            || (numberOfUnknown == 0 && currentFilter.indexOf("eexcess-unknown") > -1)) {
//            $(".show-all").addClass("is-checked");
//            $('.eexcess-isotope-grid').isotope({filter: '*'});
//        }
//    }
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
        //console.log("queryID: " + msg.data.data.queryID);
        //console.log("Type of documentBadge: " + typeof documentBadge);
        LOGGING.itemOpened(origin, documentBadge, msg.data.data.queryID);
    });
}