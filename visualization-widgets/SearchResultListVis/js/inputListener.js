// Listens for active search input
$("form").submit(function (event) {
    $("div").remove(".eexcess-isotope-grid-item");
    event.preventDefault();
    var input = $("#wiki-recommender-active-search").val();
    window.top.postMessage({event: 'eexcess.queryTriggered', data: input}, '*');
});

// opens the settings dialog
$('.settings-btn').click(function () {
    window.top.postMessage({event: 'eexcess.openOptions'}, '*');
});

// licence filter functionality
/*function whitelistFilter() {
    chrome.storage.sync.get('licenceWhitelist', function (result) {
        var whitelist = result.licenceWhitelist ? JSON.parse(result.licenceWhitelist) : undefined;

        if (whitelist) {
            return whitelist[licence];
        } else {
            return true;
        }
    });
}*/

var licenceFilterBtn = $('.licence-filter-btn');

chrome.storage.sync.get('isotopeFilters', function (result) {
    var isotopeFilters = result.isotopeFilters ? JSON.parse(result.isotopeFilters) : undefined;
    var filterGroup = licenceFilterBtn.parent().attr('data-filter-group');

    if (isotopeFilters && isotopeFilters[filterGroup]) {
        licenceFilterBtn.addClass('is-checked');
    }
});

licenceFilterBtn.click(function () {
    $this = $(this);

    chrome.storage.sync.get('isotopeFilters', function (result) {
        var isotopeFilters = result.isotopeFilters ? JSON.parse(result.isotopeFilters) : {};
        var filterGroup = licenceFilterBtn.parent().attr('data-filter-group');

        if (isotopeFilters && isotopeFilters[filterGroup]) {
            licenceFilterBtn.removeClass('is-checked');
            isotopeFilters[filterGroup] = undefined;
        } else {
            licenceFilterBtn.addClass('is-checked');
            isotopeFilters[filterGroup] = $this.attr('data-filter');
        }

        chrome.storage.sync.set({isotopeFilters: JSON.stringify(isotopeFilters)});
    });
});
