var goSkipper = function (tabId) {
    // メッセージ
    var message = {};

    message.command = 'get_title';
    message.title = localStorage['title'];

    // 現在表示しているタブにメッセージを送る
    chrome.tabs.sendMessage(tabId, message, function() {
        localStorage['title'] = '';
    });
}

var autoSkipper = function (tabId) {
    // メッセージ
    var message = {};

    message.command = 'auto';
    message.title = localStorage['title'];

    // 現在表示しているタブにメッセージを送る
    chrome.tabs.sendMessage(tabId, message, function() {
        localStorage['title'] = '';
    });
}

chrome.browserAction.onClicked.addListener(function(tab) {
	goSkipper(tab.id);
});

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        localStorage['title'] = msg.title;

        port.postMessage({status: "success"});
    });
});


chrome.tabs.onCreated.addListener(function (tab) {
    
    if (!localStorage['title']) {
        return false;
    }
    
    var spTabId = tab.id;
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (spTabId == tabId && tab.status === 'complete') {
            if (!localStorage['title']) {
                return false;
            }
            autoSkipper(tab.id);
        }
    });
});

