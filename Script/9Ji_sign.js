/*
九机网自动签到
~~~~~~~~~~~~~~~~
QX 1.0.5 :
[task_local]
0 9 * * * https://raw.githubusercontent.com/CGuoL/QuanXConfig/master/Script/9Ji_sign.js
[rewrite_local]
# Get  cookie. QX 1.0.5(188+):
https:\/\/m\.9ji\.com\/ url script-request-header 9ji_sign.js
~~~~~~~~~~~~~~~~
QX or Surge MITM = m.9ji.com
~~~~~~~~~~~~~~~~
*/
function helperGetCookieByName(cookie, name) {
  var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  var arr = cookie.match(reg);
  if (arr && arr.length >= 3) return arr[2];
  else return null;
}
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
    method: "POST",
    headers: {
      Cookie: $nobyda.read("Golen_CookieJJ"),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 14 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;CtClient;7.6.0;iOS;14;iPhone 100`,
      Authorization: helperGetCookieByName(
        $nobyda.read("Golen_CookieJJ"),
        "Authorization"
      ),
    },
  };
  $task.fetch(_9ji).then(
    (response) => {
      try {
        var body = JSON.parse(response.body);
        if (body["code"] == 0) {
          $nobyda.notify(`九机网 - 签到成功🎉`, "", "");
        } else if (body["code"] == 5000) {
          $nobyda.notify(`九机网 - 今日已签到🎉`, "", "");
        } else if (body["code"] == 1000) {
          $nobyda.notify(`九机网 - 登录失效，需要重新获取Cookie`, "", "");
        } else {
          config._9ji.data.notify = `[${config._9ji.name}] 未知的Code代码:${body["code"]}`;
          $nobyda.notify(`九机网 - 未知的Code代码，详见日志`, "", "");
          console.log(`九机网 - 未知的Code代码:${body["code"]}`);
        }
        console.log("九机网-签到脚本Api提示: \n" + body["msg"]);
      } catch (e) {
        $nobyda.notify(`九机网 - 脚本数据解析异常⚠️`, "", "");
        console.log("九机网-签到脚本数据解析异常⚠️ : \n" + JSON.stringify(e));
      }
      finalNotify("_9ji");
    },
    (reason) => {
      $nobyda.notify("九机网 - 签到接口请求失败", "", reason.error);
    }
  );
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
