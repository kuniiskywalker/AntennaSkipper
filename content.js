
// 前後のスペース削除
var trim = function(str) {

    return str.replace(/^[\s　]+|[\s　]+$/g, "");
}

// 余分な文字列を削除
var removeExtraStr = function (str) {
    if (str.match(/(.*)｜(.*)/)) {
        str = str.replace(/(.*)｜(.*)/, "$1");       
    }
    if (str.match(/(.*)...$/)) {
        str = str.replace(/(.*)...$/, "$1");       
    }
    if (str.match(/(.*)…$/)) {
        str = str.replace(/(.*)…$/, "$1");       
    }
    if (str.match(/(.*)・・・$/)) {
        str = str.replace(/(.*)・・・$/, "$1");       
    }

    return trim(str);
};

// aタグがクリックされた時の処理
var clickFunction = function (e) {

    var title = escape(removeExtraStr(this.text));

    var port = chrome.extension.connect({name: "AtoR"});
    port.postMessage({title: title});
}

// イベント登録処理
var atags = document.getElementsByTagName("a"),
    atagsLen = atags.length,
    frames = document.getElementsByTagName('iframe'),
    frameLen = frames.length;

for (var i = 0; i < atagsLen; i++) {
    atags[i].addEventListener("click", clickFunction, false);
}

var reg = new RegExp('^' + location.origin);
for (var i = 0; i < frameLen; i++) {

    if (!frames[i].src.match(reg)) {
        continue;
    }
    var doc = frames[i].contentWindow.document;
    var atags = doc.getElementsByTagName("a"),
    atagsLen = atags.length;

    for (var t = 0; t < atagsLen; t++) {

        atags[t].addEventListener("click", clickFunction, false);
    }
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

    var command = msg.command;

    switch (command) {

        case('get_title'):

            var title = msg.title;

            if (!title) {
                title = document.getElementsByTagName('title')[0].text;
                title = escape(removeExtraStr(title));
            }

            var anchors = document.getElementsByTagName('a');
            var len = anchors.length;
            for (var i = 0; i < len; i++) {

                var anchor_title = [];

                if (!anchors[i].href) {
                    continue
                }
                
                if (trim(anchors[i].title)) {
                    var tmp = escape(trim(anchors[i].title));
                    anchor_title.push(tmp);
                }

                if (trim(anchors[i].text)) {
                    var tmp = escape(trim(anchors[i].text));
                    anchor_title.push(tmp);
                } 

                var num = anchor_title.length;
                for (var t = 0; t < num; t++) {

                    if (anchor_title[t].match(new RegExp('^' + title))) {
                        location.href = anchors[i].href;
                        return false;
                    } else if (title.match(new RegExp('^' + anchor_title[t]))) {
                        location.href = anchors[i].href;
                        return false;
                    }
                }
            }
            break;
    }
});

