
// 前後のスペース削除
var trim = function(str) {

    return str.replace(/^[\s　]+|[\s　]+$/g, "");
}

var existsUrl = function (link) {

    if (!link) {
        return false;
    }

    if (link.replace(/(https?)\:\/\/(.*)$/, "$2") == location.host + location.pathname) {
        return true;
    }
    if (link.replace(/(https?)\:\/\/(.*)\/$/, "$2") == location.host + location.pathname) {
        return true;
    }

    // if (link.split('://')[1] == location.host) {

    //     return true;
    // }
    // if (link.split('://')[1].replace(/(.+)\//, "$1") == location.host) {
    //     return true;
    // }

    return false;
}

// 余分な文字列を削除
var removeExtraStr = function (str) {
    if (str.match(/(.*)｜(.*)/)) {
        str = str.replace(/(.*)｜(.*)/, "$1");
        return removeExtraStr(str);
    }
    if (str.match(/(.*)\.\.\.$/)) {
        str = str.replace(/(.*)\.\.\.$/, "$1");
        return removeExtraStr(str);
    }
    if (str.match(/(.*)…$/)) {
        str = str.replace(/(.*)…$/, "$1");
        return removeExtraStr(str);
    }
    if (str.match(/(.*)・・・$/)) {
        str = str.replace(/(.*)・・・$/, "$1");
        return removeExtraStr(str);
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

var skipper = function (title) {

    var anchors = document.getElementsByTagName('a');
    var len = anchors.length;
    for (var i = 0; i < len; i++) {

        // if (anchors[i].href == 'http://inazumanews2.com/archives/33925368.html') {
            console.log(anchors[i].href);
        // }
        

        if (!anchors[i].href) {
            continue
        }
        if (existsUrl(anchors[i].href)) {
            continue;
        } 

        var anchor_title = [];

        
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
                return true;
            } else if (title.match(new RegExp('^' + anchor_title[t]))) {
                location.href = anchors[i].href;
                return true;
            }
        }
    }
    return false;
}


var matchSkipAutoList = function () {

    var urlAry = [
    "http://giko-news.com", 
    "http://newpuru.doorblog.jp", 
    "http://2ch-c.net", 
    "http://get2ch.net", 
    "http://newmofu.doorblog.jp", 
    "http://matomeantena.com", 
    "http://besttrendnews.net", 
    "http://2blo.net", 
    "http://kita-kore.com", 
    "http://wk-tk.net", 
    "http://rotco.jp", 
    "http://www.antennash.com", 
    "http://uhouho2ch.com", 
    "http://2channeler.com", 
    "http://a.anipo.jp", 
    "http://blog-news.doorblog.jp", 
    "http://owata.chann.net", 
    "http://nullpoantenna.com", 
    "http://damage0.blomaga.jp", 
    "http://2chfinder.com", 
    "http://uhouho2ch.com"
        ];

    var len = urlAry.length;
    for (var i = 0; i < len; i++) {
        if (location.origin == urlAry[i]) {
            return true;
        }
    }
    return false;
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

    var command = msg.command;

    switch (command) {

        case('get_title'):

            var title = msg.title;
            if (!skipper(title)) {

                title = document.getElementsByTagName('title')[0].text;
                title = escape(removeExtraStr(title));

                skipper(title)
            }
            
            break;

        case('auto'):

            if (!matchSkipAutoList()) {
                return false;
            }

            var title = msg.title;
            if (!skipper(title)) {

                title = document.getElementsByTagName('title')[0].text;
                title = escape(removeExtraStr(title));

                skipper(title)
            }
            
            break;
    }
});

