/*
Bilibili Manga Daily Bonus
About the author:
If reproduced, indicate the source
Telegram channel: @NobyDa
Telegram bots: @NobyDa_bot
Description :
When Bilibili Manga app is opened, click "My", If notification gets cookie success, you can use the check in script. because script will automatically judgment whether the cookie is updated, so you dont need to disable it manually.
script will be performed every day at 9 am. You can modify the execution time.
~~~~~~~~~~~~~~~~
Surge 4.0 :
[Script]
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Bilibili-DailyBonus/Manga.js
# Get bilibili cookie.
http-request https:\/\/manga\.bilibili\.com\/.*\.User\/GetWallet max-size=0,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Bilibili-DailyBonus/Manga.js
~~~~~~~~~~~~~~~~
QX 1.0.5 :
[task_local]
0 9 * * * Manga.js
[rewrite_local]
# Get bilibili cookie. QX 1.0.5(188+):
https:\/\/m\.9ji\.com\/ url script-request-header Manga.js
~~~~~~~~~~~~~~~~
QX or Surge MITM = manga.bilibili.com
~~~~~~~~~~~~~~~~
*/

const $nobyda = nobyda();

if ($nobyda.isRequest) {
  GetCookie();
  $nobyda.end();
} else {
  checkin();
  $nobyda.end();
}

function checkin() {
  const _9ji = {
    url: "https://m.9ji.com/web/api/vipClub/sign/v1",
    headers: {
      Cookie: $nobyda.read("Golen_CookieJJ"),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 14 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;CtClient;7.6.0;iOS;14;iPhone 100`,
      Authorization: helper.getCookieByName(
        $nobyda.read("Golen_CookieJJ"),
        "Authorization"
      ),
    },
  };
  $nobyda.post(_9ji, function (error, response, data) {
    if (!error) {
      var body = JSON.parse(response.body);
      console.log("九机网 success response : \n" + body["data"]);
      if (body["code"] == 0) {
        $nobyda.notify(`九机网 - 签到成功🎉`, "", "");
      } else if (body["code"] == 5000) {
        $nobyda.notify(`九机网 - 今日已签到🎉`, "", "");
      } else if (body["code"] == 1000) {
        $nobyda.notify(`九机网 - 登录失效，需要重新获取Cookie`, "", "");
      }
    } else {
      $nobyda.notify("九机网 - 签到接口请求失败", "", error);
    }
  });
}

function GetCookie() {
  var CookieName = "九机网";
  var CookieKey = "Golen_CookieJJ";
  if ($request.headers) {
    var header = $request.headers.Cookie ? $request.headers.Cookie : "";
    if (header !== "") {
      var CookieValue = header;
      if ($nobyda.read(CookieKey)) {
        if ($nobyda.read(CookieKey) != CookieValue) {
          var cookie = $nobyda.write(CookieValue, CookieKey);
          if (!cookie) {
            $nobyda.notify("更新" + CookieName + "Cookie失败‼️", "", "");
          } else {
            $nobyda.notify("更新" + CookieName + "Cookie成功 🎉", "", "");
          }
        }
      } else {
        var cookie = $nobyda.write(CookieValue, CookieKey);
        if (!cookie) {
          $nobyda.notify("首次写入" + CookieName + "Cookie失败‼️", "", "");
        } else {
          $nobyda.notify("首次写入" + CookieName + "Cookie成功 🎉", "", "");
        }
      }
    } else {
      $nobyda.notify(
        "写入" + CookieName + "Cookie失败‼️",
        "",
        "Request中Cookie关键值缺失"
      );
    }
  } else {
    $nobyda.notify(
      "写入" + CookieName + "Cookie失败‼️",
      "",
      "配置错误, 无法读取请求头,"
    );
  }
}

function nobyda() {
  const isRequest = typeof $request != "undefined";
  const isSurge = typeof $httpClient != "undefined";
  const isQuanX = typeof $task != "undefined";
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message);
    if (isSurge) $notification.post(title, subtitle, message);
  };
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key);
    if (isSurge) return $persistentStore.write(value, key);
  };
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key);
    if (isSurge) return $persistentStore.read(key);
  };
  const post = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = { url: options };
      options["method"] = "POST";
      $task.fetch(options).then(
        (response) => {
          response["status"] = response.statusCode;
          callback(null, response, response.body);
        },
        (reason) => callback(reason.error, null, null)
      );
    }
    if (isSurge) $httpClient.post(options, callback);
  };
  const end = () => {
    if (isQuanX) isRequest ? $done({}) : "";
    if (isSurge) isRequest ? $done({}) : $done();
  };
  return { isRequest, isQuanX, isSurge, notify, write, read, post, end };
}
let helper = {
  getCookieByName: (cookie, name) => {
    var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    var arr = cookie.match(reg);
    if (arr && arr.length >= 3) return arr[2];
    else return null;
  },
};
