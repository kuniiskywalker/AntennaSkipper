
// 前後のスペース削除
var trim = function(str) {

    return str.replace(/^[\s　]+|[\s　]+$/g, "");
}

var excludeHost = function (url) {

    if (!url.match('://')) {
        return '';
    }
    url = url.split('://')[1];
    
    if (!url.match('/')) {
        return '';
    }

    var paths = url.split('/');

    var len = paths.length;
    
    var str = '';
    for (var i = 1; i < len; i++) {
        str += '/' + paths[i];
    }

    return str;
};

var existsUrl = function (link) {

    // if (link.replace(/(https?)\:\/\/(.*)$/, "$2") == location.host + location.pathname) {
    //     return true;
    // }
    // if (link.replace(/(https?)\:\/\/(.*)\/$/, "$2") == location.host + location.pathname) {
    //     return true;
    // }
    if (link == location.href) {
        return true;
    }

    if (link == document.referrer) {
        return true;
    }

    if (excludeHost(link) == '/') {
        return true;
    }

    if (link.match(/^http/) === true && escape(link.split('://')[1]).match(new RegExp('^' + escape(location.host)))) {
        return true;
    }

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
};

var matchString = function (str, match) {

    if (str.match(new RegExp('^' + match))) {
        return true;
    } else if (match.match(new RegExp('^' + str))) {
        return true;
    }

    return false;
};

var isChild = function (tag, text) {

    for (var i = 0; i < tag.length; i++) {
      var childs = tag[i].childNodes;
      if (childs.length == 1) {

          if (matchString(childs[0], text)) {
              return true;
          }
      } else {
         isChild(childs, text);
      }
    }
};

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

    // console.log('title: ' + unescape(title));

    var anchors = document.getElementsByTagName('a');
    var len = anchors.length;
    for (var i = 0; i < len; i++) {

        if (!anchors[i].href) {
            continue
        }
        if (existsUrl(anchors[i].href)) {
            continue;
        } 
        if (matchSkipAutoList(anchors[i].href)) {
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
            if (matchString(anchor_title[t], title)) {
                goReality(anchors[i]);
                return true;
            } else if (isChild(anchors[i], title)) {
                goReality(anchors[i]);
                return true;
            }
        }
    }
    return false;
};

var goReality = function (btn) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    btn.dispatchEvent( evt );
    // location.href = link;
    return true;
};

var matchSkipAutoList = function (link) {

    var urlAry = [
    "http://moudamepo.com", 
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
        if (link == urlAry[i]) {
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

            if (!matchSkipAutoList(location.origin)) {
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

