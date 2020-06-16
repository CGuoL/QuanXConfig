const global = {
    log: 1, //日志模式:0不显示 1全部显示 2精简显示,推荐值:1
}

//#region smartjs,用于兼容Surge和QuantumultX
/*
本作品用于QuantumultX和Surge之间js执行方法的转换
您只需书写其中任一软件的js,然后在您的js最【前面】追加上此段js即可
无需担心影响执行问题,具体原理是将QX和Surge的方法转换为互相可调用的方法
尚未测试是否支持import的方式进行使用,因此暂未export
如有问题或您有更好的改进方案,请前往 https://github.com/sazs34/TaskConfig/issues 提交内容,或直接进行pull request
您也可直接在tg中联系@wechatu
*/
// #region 固定头部
let isQuantumultX = $task != undefined; //判断当前运行环境是否是qx
let isSurge = $httpClient != undefined; //判断当前运行环境是否是surge
// http请求
var $task = isQuantumultX ? $task : {};
var $httpClient = isSurge ? $httpClient : {};
// cookie读写
var $prefs = isQuantumultX ? $prefs : {};
var $persistentStore = isSurge ? $persistentStore : {};
// 消息通知
var $notify = isQuantumultX ? $notify : {};
var $notification = isSurge ? $notification : {};
// #endregion 固定头部

// #region 网络请求专用转换
if (isQuantumultX) {
    var errorInfo = {
        error: ''
    };
    $httpClient = {
        get: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        },
        post: (url, cb) => {
            var urlObj;
            if (typeof (url) == 'string') {
                urlObj = {
                    url: url
                }
            } else {
                urlObj = url;
            }
            url.method = 'POST';
            $task.fetch(urlObj).then(response => {
                cb(undefined, response, response.body)
            }, reason => {
                errorInfo.error = reason.error;
                cb(errorInfo, response, '')
            })
        }
    }
}
if (isSurge) {
    $task = {
        fetch: url => {
            //为了兼容qx中fetch的写法,所以永不reject
            return new Promise((resolve, reject) => {
                if (url.method == 'POST') {
                    $httpClient.post(url, (error, response, data) => {
                        if (response) {
                            response.body = data;
                            resolve(response, {
                                error: error
                            });
                        } else {
                            resolve(null, {
                                error: error
                            })
                        }
                    })
                } else {
                    $httpClient.get(url, (error, response, data) => {
                        if (response) {
                            response.body = data;
                            resolve(response, {
                                error: error
                            });
                        } else {
                            resolve(null, {
                                error: error
                            })
                        }
                    })
                }
            })

        }
    }
}
// #endregion 网络请求专用转换

// #region cookie操作
if (isQuantumultX) {
    $persistentStore = {
        read: key => {
            return $prefs.valueForKey(key);
        },
        write: (val, key) => {
            return $prefs.setValueForKey(val, key);
        }
    }
}
if (isSurge) {
    $prefs = {
        valueForKey: key => {
            return $persistentStore.read(key);
        },
        setValueForKey: (val, key) => {
            return $persistentStore.write(val, key);
        }
    }
}
// #endregion

// #region 消息通知
//#endregion

//#endregion

let master = () => {
    if (typeof $request != "undefined") {
        getCookie();
    } else {
        execute();
    }
}

let getCookie = () => {
    //#region 基础配置
    const config = {
        _9ji: {
            cookie: "Golen_CookieJJ",
            name: '九机网Cookie',
            Host: 'm.9ji.com'
        }
    }
    //#endregion

    //#region 查重方法,用于检测Cookie值是否发生变化以便于更新Cookie

    let updateCookie = (config, newVal) => {
        if (!newVal || !config) return;
        var historyCookie = $prefs.valueForKey(config.cookie);
        if (historyCookie) {
            if (historyCookie != newVal) {
                if ($prefs.setValueForKey(newVal, config.cookie)) {
                    $notify(`更新 ${config.name} 成功🎉`, "", "无需禁用脚本，仅Cookie改变时才会重新获取");
                } else {
                    $notify(`更新 ${config.name} 失败!!!`, "", "");
                }
            } 
        } else {
            if ($prefs.setValueForKey(newVal, config.cookie)) {
                $notify(`首次写入 ${config.name} 成功🎉`, "", "无需禁用脚本，仅Cookie改变时才会重新获取");
            } else {
                $notify(`首次写入 ${config.name} 失败!!!`, "", "");
            }
        }
    }

    //#endregion

    //#region 正式开始写入cookie
    let request = $request;
    var isValidRequest = request && request.headers && request.headers.Cookie
    if (isValidRequest) {
        let headers = request.headers;
        // console.log(`【Cookie触发】${headers.Host}-${headers.Cookie}`)

        //#region 9机网
        if (headers.Host == config._9ji.Host) {
            var headerCookie = headers.Cookie;
            updateCookie(config._9ji, headerCookie);
        }
        //#endregion
    }
    //#endregion

}

let execute = () => {
    //#region 签到配置,请勿修改
    let config = {
        _9ji: {
            cookie: 'Golen_CookieJJ',
            name: '九机网',
            provider: {
                url: `https://m.9ji.com/web/api/vipClub/sign/v1`,
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Cookie: "",
                    "Authorization": "",
                    "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;CtClient;7.6.0;iOS;13.3;iPhone XR`,
                }
            },
            data: {
                notify: ''
            }
        }
    }
    //#endregion

    //#region 签到开始

    //#region 九机网
    let sign_9ji = () => {
        let cookieVal = $prefs.valueForKey(config._9ji.cookie);
        if (!cookieVal) {
            config._9ji.data.notify = `[${config._9ji.name}] 未获取到Cookie⚠️`;
            record(config._9ji.data.notify);
            finalNotify("_9ji");
            return;
        }
        config._9ji.provider.headers.Cookie = cookieVal;
        config._9ji.provider.headers["Authorization"] = helper.getCookieByName(cookieVal, "Authorization");
        $task.fetch(config._9ji.provider).then(response => {
            try {
                var body = JSON.parse(response.body);
                if (body["code"] == 0) {
                    config._9ji.data.notify = `[${config._9ji.name}] 签到成功🎉 ${body["data"]}`;
                }
                else if (body["code"] == 5000) {
                    config._9ji.data.notify = `[${config._9ji.name}] 今日已签到🎉`;
                }
                else if (body["code"] == 1000) {
                    config._9ji.data.notify = `[${config._9ji.name}] 登录失效，需要重新获取Cookie`;
                }
                else {
                    config._9ji.data.notify = `[${config._9ji.name}] 未知的Code代码:${body["code"]}`;
                }
                record(config._9ji.data.notify + `;Api提示:${body["msg"]} `);
            } catch (e) {
                config._9ji.data.notify = `[${config._9ji.name}] 脚本数据解析异常⚠️`;
                record(`${config._9ji.data.notify}-${JSON.stringify(e)}`)
            }
            finalNotify("_9ji");
        }, reason => {
            config._9ji.data.notify = `[${config._9ji.name}] 签到失败！网络请求异常⚠️`;
            finalNotify("_9ji");
            record(`${config._9ji.data.notify} : ${reason.error}`);
        });
    }
    //#endregion

    //#endregion

    //#region 签到统一管控
    let startSign = () => {
        sign_9ji();
    }

    let finalNotify = item => {
        let sign_detail = `${config[item].data.notify}`;
        $notify(`${config[item].name} 自动签到`, "详细签到信息可见日志", sign_detail);
    }

    let record = content => {
        if (global.log == 1) {
            console.log(`
${content}`);
        } else if (global.log == 2) {
            console.log(`
${content.splice(0, 60)}`);
        }
    }
    //#endregion

    startSign();
}

let helper = {
    getCookieByName: (cookie, name) => {
        var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        var arr = cookie.match(reg);
        if (arr && arr.length >= 3)
            return arr[2];
        else
            return null;
    }
}

master();
