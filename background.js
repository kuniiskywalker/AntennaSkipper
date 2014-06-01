var goSkipper = function (tabId) {
    // メッセージ
    var message = {};

    message.command = 'get_title';
    message.title = localStorage['title'];

    // 現在表示しているタブにメッセージを送る
    chrome.tabs.sendMessage(tabId, message, function() {});
}

var autoSkipper = function (tabId) {
    // メッセージ
    var message = {};

    message.command = 'auto';
    message.title = localStorage['title'];

    // 現在表示しているタブにメッセージを送る
    chrome.tabs.sendMessage(tabId, message, function() {});
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

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    autoSkipper(tabId);
});

chrome.tabs.onCreated.addListener(function (activeInfo) {
    autoSkipper(activeInfo.id);
});

