chrome.browserAction.onClicked.addListener(function(tab) {

	// メッセージ
    var message = {};

    message.command = 'get_title';
    message.title = localStorage['title'];

    // 現在表示しているタブにメッセージを送る
    chrome.tabs.sendMessage(tab.id, message, function() {});
});

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        localStorage['title'] = msg.title;

        port.postMessage({status: "success"});
    });
});