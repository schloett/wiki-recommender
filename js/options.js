require(['./common'], function(common) {
    require(['jquery', 'c4/APIconnector'], function($, api) {
        var $numResults = $('#numResults');
        var $autoQuery = $('#autoQuery');
        // store current values and inform background script about update
        var update = function() {
            var selectedSources = [];
            var queryWikiCommons = false;
            $.each($('#partnerList input:checked'), function() {
                var data = $(this).data('props');

                if (data.systemId === WIKI_COMMONS.systemId) {
                    queryWikiCommons = true;
                } else {
                    selectedSources.push(data);
                }
            });
            chrome.storage.sync.set({numResults: $numResults.val(), selectedSources: selectedSources, queryWikiCommons: queryWikiCommons}, function() {
                chrome.runtime.sendMessage({method: 'optionsUpdate'});
            });
        };
        // get numResults from storage, set to '80' if not present
        chrome.storage.sync.get('numResults', function(result) {
            if (result.numResults) {
                $numResults.val(result.numResults);
            } else {
                $numResults.val(80);
            }
        });
        // numResults must be int in range 1-100
        $numResults.change(function() {
            $numResults.val(parseInt($numResults.val()));
            if ($numResults.val() < 1) {
                $numResults.val(1);
            }
            if ($numResults.val() > 100) {
                $numResults.val(100);
            }
            update();
        });

        chrome.storage.local.get(['autoQuery'], function(result) {
            if (typeof result.autoQuery === 'undefined' || result.autoQuery) {
                $autoQuery.prop('checked', 'checked');
            }
        });
        
        chrome.storage.onChanged.addListener(function(changes, areaName) {
            if (areaName === 'local' && changes.autoQuery) {
                $autoQuery.prop('checked', changes.autoQuery.newValue);
            }
        });

        $autoQuery.change(function() {
            chrome.storage.local.set({autoQuery: $autoQuery.prop('checked')});
        });

        // partner list
        var $sources = $('#sources');
        const WIKI_COMMONS = {
            systemId: 'Wikimedia Commons',
            favIconURI: 'https://commons.wikimedia.org/static/favicon/commons.ico'
        };
        api.getRegisteredPartners(function(res) {
            $('#loader').hide();
            if (res.status === 'success') {
                var $partnerList = $('<ul id="partnerList">');

                // add wiki commons
                res.data.partner.push(WIKI_COMMONS);

                $.each(res.data.partner, function() {
                    var data = {
                        systemId: this.systemId,
                        favIconURI: this.favIconURI
                    };
                    var li = $('<li></li>');
                    var input = $('<input type="checkbox" name="' + formatId(this.systemId) + '" value="' + this.systemId + '" /><img src="' + this.favIconURI + '" class="partnerIcon" />').data('props', data).change(update);
                    li.append(input).append(' ' + this.systemId);
                    $partnerList.append(li);
                });
                $sources.append($partnerList);
                // get selection from storage
                chrome.storage.sync.get(['selectedSources', 'queryWikiCommons'], function(res) {
                    if (res.selectedSources) {
                        res.selectedSources.forEach(function(val) {
                            $('#partnerList input[name=' + formatId(val.systemId) + ']').prop('checked', true);
                        });
                    }
                    if (res.queryWikiCommons === true) {
                        $('#partnerList input[name=' + formatId(WIKI_COMMONS.systemId) + ']').prop('checked', true);
                    }
                });
            } else {
                $sources.append('Failed to retrieve available providers, showing only currently selected');
                chrome.storage.sync.get(['selectedSources', 'queryWikiCommons'], function(res) {
                    if (res.selectedSources && (res.selectedSources.length > 0 || res.queryWikiCommons)) {
                        var $partnerList = $('<ul id="partnerList">');

                        // add wiki commons
                        if (res.queryWikiCommons)
                            res.selectedSources.push(WIKI_COMMONS);

                        res.selectedSources.forEach(function(val) {
                            var li = $('<li></li>');
                            var input = $('<input type="checkbox" name="' + val.systemId + '" value="' + val.systemId + '" /><img src="' + val.favIconURI + '" class="partnerIcon" />').data('props', val).prop('checked', true).change(update);
                            li.append(input).append(' ' + val.systemId);
                            $partnerList.append(li);
                        });
                        $sources.append($partnerList);
                    }
                });
            }
        });
    });
});

function formatId(string) {
    return string.replace(/\s+/g, '-').toLowerCase();
}