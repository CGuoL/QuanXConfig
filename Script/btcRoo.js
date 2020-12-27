/*
比特袋鼠自动签到
~~~~~~~~~~~~~~~~
QX 1.0.5 :
[task_local]
0 9 * * * https://raw.githubusercontent.com/CGuoL/QuanXConfig/master/Script/btcRoo.js
[rewrite_local]
# Get  cookie. QX 1.0.5(188+):
https?:\/\/btcroo\.zb\.0xhash\.cn\/ url script-request-header https://raw.githubusercontent.com/CGuoL/QuanXConfig/master/Script/btcRoo.js
~~~~~~~~~~~~~~~~
QX or Surge MITM = btcroo.zb.0xhash.cn
~~~~~~~~~~~~~~~~
*/
const $nobyda = nobyda();

if ($nobyda.isRequest) {
  GetCookie();
} else {
  checkin();
}

function checkin() {
  const apiInfo = {
    url: "https://btcroo.zb.0xhash.cn/api/apps/chash/sign/get-sign-info",
    method: "GET",
    headers: {
      Token: $nobyda.read("Golen_CookieBtcRoo"),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1`,
      Accept: "application/json, text/plain, */*",
      "App-Key": "chash",
      "Client-Key": "phone_web",
      "X-Requested-With": "XMLHttpRequest",
      "Accept-Language": "zh-cn",
      "Accept-Encoding": "gzip, deflate, br",
      Platform: "phone_web",
      Origin: "https://www.btcroo.com",
      Referer: "https://www.btcroo.com/",
      "Version-Name": "1.0.0",
      Connection: "keep-alive",
    },
  };
  $task.fetch(apiInfo).then(
    (response) => {
      try {
        var body = JSON.parse(response.body);
        if (body["code"] == 0) {
          if (body["data"]["show_sign_tip"]) {
            $nobyda.notify(
              `比特袋鼠 - 签到成功🎉`,
              "",
              `已签到${body["data"]["sign_days"]}天。`
            );
          } else {
            $nobyda.notify(`比特袋鼠 - 今日已签过`, "", "");
          }
        } else if (body["code"] == 1000) {
          $nobyda.notify(
            `比特袋鼠 - 登录信息失效，需要重新登录获取Token`,
            "",
            ""
          );
        } else {
          console.log(`比特袋鼠 - 未知的Code代码:${body["code"]}`);
          $nobyda.notify(`比特袋鼠 - 未知的Code代码，详见日志`, "", "");
          $nobyda.end();
        }
        console.log(`比特袋鼠-签到脚本Api提示: \n${response.body}`);
        $nobyda.end();
      } catch (e) {
        console.log("比特袋鼠-签到脚本数据解析异常⚠️ : \n" + JSON.stringify(e));
        $nobyda.notify(`比特袋鼠 - 脚本数据解析异常⚠️`, "", "");
        $nobyda.end();
      }
    },
    (reason) => {
      $nobyda.notify("比特袋鼠 - 签到接口请求失败", "", reason.error);
      $nobyda.end();
    }
  );
}

function GetCookie() {
  var CookieName = "比特袋鼠";
  var CookieKey = "Golen_CookieBtcRoo";
  if ($request.headers) {
    var header = $request.headers.Token ? $request.headers.Token : "";
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
        "写入" + CookieName + "Token失败‼️",
        "",
        "Request中Token关键值缺失"
      );
    }
  } else {
    $nobyda.notify(
      "写入" + CookieName + "Token失败‼️",
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
