browserAction = (function() {
    /**
     * See https://developer.chrome.com/extensions/browserAction#event-onClicked for documentation
     * @param {Function} callback
     * @returns {undefined}
     */
    var _clickedListener = function(callback) {
        chrome.browserAction.onClicked.addListener(callback);
    };

    /**
     * See https://developer.chrome.com/extensions/browserAction#method-getBadgeText for documentation
     * @param {Object} details
     * @param {Function} callback
     * @returns {undefined}
     */
    var _getBadgeText = function(details, callback) {
        chrome.browserAction.getBadgeText(details, callback);
    };

    /**
     * See https://developer.chrome.com/extensions/browserAction#method-setBadgeText for documentation
     * @param {Object} details
     * @returns {undefined}
     */
    var _setBadgeText = function(details) {
        chrome.browserAction.setBadgeText(details);
    };

    return  {
        clickedListener: _clickedListener,
        getBadgeText: _getBadgeText,
        setBadgeText: _setBadgeText
    };
});

// general widget parameters
var params = {
    visible: false,
    tab: 'results'
};
