var Dc = (function () {
    var timeOut = 5000,
        server = 'http://zx.com:90/PageRequest.ashx',
        config = {
            //通用成功回调函数
            success: undefined,
            //通用错误回调函数
            error: undefined,
            //服务器地址
            server: server,
            //微信调试
            weixinDebug: false,
            //微信公众号Appid
            weixinAppId: 'wx8e2a049e7e6b2bcb'
        },
        params = {
            //配置信息
            openid: '',
            HouseId: ''
        },
        dcDom = {
            mask: [$('<div style="z-index: 99; position:fixed; width:100%; top:0; bottom:0; background:#000; opacity:.75; filter:alpha(opacity=75);-webkit-transform: scale(10)">"></div>'), $('<div style="z-index: 99; position:fixed; width:100%; top:0; bottom:0; background:#fff; opacity:0.8; filter:alpha(opacity=0.8);-webkit-transform: scale(10)">;"></div>')],
            loading: $('<img src="img/loading.gif" style="position: fixed;left: 50%;padding:10px;top: 52%;margin-left: -25px; color: #4c4c4c;z-index: 9999;text-align:center;width:50px;height:50px;" />')
        },
        result = {};

    // loading
    function loading(show) {
        dcDom.mask[1].css({
            //'height': $('body').height()
            'height': $(document).height() > document.body.scrollHeight ? $(document).height() : document.body.scrollHeight
        });
        show ? dcDom.loading.appendTo('body') : dcDom.loading.remove();
        show ? dcDom.mask[1].appendTo('body') : dcDom.mask[1].remove();
        if (!show) {
            params.ajaxStatus = show;
            return true;
        }
        if (params.ajaxStatus)
            return false;
        params.ajaxStatus = true;
        return true;
    }

    // 公共方法
    var dc = {
        config: config,
        params: params,
        os: {
            phone: false
        },
        result: function (param) {
            return eval('result.' + param);
        },
        submit: function (param, mask, callback) {
            var query = {
                openid: params.openid,
                HouseId: params.HouseId
            };
            // 参数赋值
            if (typeof (param) == 'object')
                for (var p in param) {
                    param[p] = typeof (param[p]) == 'string' ? param[p].replace(/[~'!<>@#$%^&*()-+_=:]/g, '') : param[p];
                    try { eval('query.' + p + '= param[p]'); } catch (err) {
                        console.log('Please try eval(\'query.\' + p) = param[p];');
                    }
                }
            else if (typeof (param) == 'number' || typeof (param) == 'string') query.actionid = param.toString().replace(/[~'!<>@#$%^&*()-+_=:]/g, '');
            query.actionid = parseInt(query.actionid);

            if (typeof (mask) == 'function')
                callback = mask;

            if (mask != false)
                loading(true);

            $.ajax({
                url: dc.config.server,
                data: query,
                type: 'GET',
                dataType: 'jsonp',
                timeOut: timeOut,
                success: function (data) {
                    loading(false);
                    if(data.ResultObj){
                        for (var p in data.ResultObj) {
                            dc.result(p, data.ResultObj[p]);
                        }
                    }
                    if (data.ResultObj && data.ResultObj.HouseId) params.HouseId = data.ResultObj.HouseId;
                    if (data.openid) params.openid = data.openid;
                    if (config.success) config.success(query, data);
                    if (callback && data.Code==1) callback(query, data);
                },
                error: function (xhr, type) {
                    loading(false);
                    if (config.error) config.error(xhr, type);
                }
            });
        },
        getUrlParam: function (param, url) {
            var reg = new RegExp("(^|&)" + param + "=([^&]*)(&|$)", "i"); //构造一个含有目标参数的正则表达式对象
            var r = url ? url.substr(1).match(reg) : window.location.search.substr(1).match(reg);  //匹配目标参数
            if (r != null) return unescape(r[2]); return ''; //返回参数值
        },
        goPage: function (page) {
            $("body,html").scrollTop(0);
            scroll(0, 0);
            $('*[data-current="true"]').attr('data-current', 'false').hide();
            return $(page).attr('data-current', 'true').show();
        },
        // 表单验证
        vForm: function (dom, callback) {
            var modal = $(dom).closest('.modal'), check = modal.attr('data-check'), error = modal.find('.form-error'),
                num1 = modal.find('input').eq(0).val(), num2 = modal.find('input').eq(1).val(), code = modal.find('input').eq(2).val();
            error.hide();
            if (check == 'qq') {
                if (!dc.vQQ(num1)) {
                    error.eq(0).html('请输入正确的QQ号码').show();
                    return false;
                }
            } else if (!dc.vTel(num1)) {
                error.eq(0).html('请输入正确的手机号码').show();
                return false;
            }
            if (num1 != num2) {
                error.eq(1).html('确认号码不一致').show();
                return false;
            }
            if (!dc.vCode(code)) {
                error.eq(2).html('请输入正确的验证码').show();
                return false;
            }
            if (callback) callback.call(dom, num1, code);
        },
        // 窗口
        setModal: function (options) {
            if (typeof (options.modal) == 'string') options.modal = $(options.modal);
            dcDom.mask[0].css({
                'height': $(document).height() > document.body.scrollHeight ? $(document).height() : document.body.scrollHeight
                //'height': $(document).height()
            });
            if (options.show) {
                if (!options.hold){
                    dcDom.mask[0].appendTo('body');}
                options.modal.css({ 'visibility': 'visible', 'display': 'block' });
            } else {
                if (!options.hold){
                    dcDom.mask[0].remove();
                }
                if(options.modal.find('.form-error')){
                    options.modal.find('.form-error').css({display:'none',opacity:'0'});
                }
                options.modal.css({ 'visibility': 'hidden', 'display': 'none' });
            }
            if (options.content){
                options.modal.find('.content').html(options.content).css('display','block');
            }
            if (options.title){
                options.modal.find('.title').html(options.title).css('display','block');
            }else{
                options.modal.find('.title').css('display','none')
            }
            if (options.delay > 0) {setTimeout(function () {
                dc.setModal({ show: false, modal: options.modal, hold: options.hold }) }, options.delay);
            }
            if (options.btn) {
                options.modal.find('.btn').html(options.btn);
            } else {
                options.modal.find('.btn').html('确定');
            }

            return dc;
        },
        vTel: function (tel) {
            return (!(!tel || !/^[1][3-8]\d{9}$/.test(tel)));
        },
        vQQ: function (qq) {
            return (!(!qq || !/^\d{1,20}$/.test(qq)));
        },
        vCode: function (code) {
            return (!(!code || !/^[A-Za-z0-9]{4}$/.test(code)));
        },
        cookie: function (name, value, expiredays) {
            if (!name)
                return false;
            if (value == 0 || value) {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + expiredays);
                document.cookie = name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
            } else {
                var c_start, c_end;
                if (document.cookie.length > 0) {
                    c_start = document.cookie.indexOf(name + "=");
                    if (c_start != -1) {
                        c_start = c_start + name.length + 1;
                        c_end = document.cookie.indexOf(";", c_start);
                        if (c_end == -1) c_end = document.cookie.length;
                        return unescape(document.cookie.substring(c_start, c_end));
                    }
                }
                return '';
            }
        },
        //更新微信分享文案
        updateWxShareContent: function (title, desc, link, imgUrl, success, cancel) {
            wx.onMenuShareTimeline({
                trigger: function (res) {
                },
                title: desc, // 分享标题
                link: link, // 分享链接
                imgUrl: imgUrl, // 分享图标
                success: function () {
                    // 用户确认分享后执行的回调函数
                    if (success)
                        success();
                },
                cancel: function () {
                    // 用户取消分享后执行的回调函数
                    if (cancel)
                        cancel();
                }
            });
            wx.onMenuShareAppMessage({
                title: title,
                desc: desc,
                link: link,
                imgUrl: imgUrl,
                trigger: function (res) {
                },
                success: function (res) {
                    if (success)
                        success();
                },
                cancel: function (res) {
                    if (cancel)
                        cancel();
                },
                fail: function (res) {
                }
            });
            wx.showOptionMenu();
        }
    };
    return dc;
})();

window.Dc = Dc;
 (function (dc) {
    var event = {
        bind: function () {
            $(document).click(function (e) {
                var _this = $(e.target), action = _this.attr('data-action'), actionid = parseInt(_this.attr('data-actionid'));
                if (actionid) dc.submit(actionid, dc.config.success, dc.config.error, _this);
                if (_this.attr('data-modal')) dc.setModal({
                    show: false, modal: _this.attr('data-modal')
                });
                if (action) {
                    switch (action) {
                        case 'modal':
                            _this.closest('.modal').hide();
                            dc.setModal({
                                show: true, modal: _this.attr('data-next')
                            });
                            break;
                        case 'gopage':
                            _this.closest('.modal').hide();
                            setTimeout(function () {
                                dc.goPage($(_this.attr('data-next')));
                            }, parseInt(_this.attr('data-delay')));

                            break;
                        case 'close':
                            dc.setModal({
                                show: false, modal: _this.closest('.modal')
                            });
                            return false;
                        case 'download':
                            dc.download(_this.attr('data-dentifier'), _this.attr('href'));
                            break;
                        default:
                            break;
                    }
                    return false;
                }
            });
        }
    }
    event.bind();
})(Dc);

// 系统检测
; (function (dc) {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('micromessenger') > -1) {
        dc.os.weixin = true;
        dc.os.phone = true;
    }
    if (ua.indexOf('weibo') > -1) {
        dc.os.weibo = true;
        dc.os.phone = true;
    }
    if (ua.indexOf('android') > -1 || ua.indexOf('linux') > -1) {
        dc.params.mt = dc.params.mt || 4;
        dc.os.android = true;
        dc.os.phone = true;
    }
    if (ua.indexOf('iphone') > -1) {
        dc.params.mt = dc.params.mt || 1;
        dc.os.ios = true;
        dc.os.phone = true;
    }
})(Dc);

// 重载
; (function (dc) {
    $.fn.show = function (base) {
        return function () {
            var s = this, isset = arguments.length > 0, t = isset ? arguments[0] : null;
            // 这里调用基类方法，当然基类方法在何时调用或者是否要调用取决于您的业务逻辑，在这里我们是要调用的，因为要保持它原有的功能。
            if (isset && typeof (base) == "function") { base.call(s, t); } else {
                t = base.call(s);
            }
            var title = arguments.length > 1 ? arguments[1] : null;
            var btn = arguments.length > 2 ? arguments[2] : null;
            if ($(s).hasClass('modal')) Dc.setModal({
                modal: s, show: true, delay: (typeof (t) == 'number') ? t : 0, content: (typeof (t) == 'string') ? t : null, title: title, btn: btn
            });
        }
    }($.fn.show);

    $.fn.hide = function (base) {
        return function () {
            var s = this, isset = arguments.length > 0, t = isset ? arguments[0] : null;
            // 这里调用基类方法，当然基类方法在何时调用或者是否要调用取决于您的业务逻辑，在这里我们是要调用的，因为要保持它原有的功能。
            if (isset && typeof (base) == "function") { base.call(s, t); } else {
                t = base.call(s);
            }
            if ($(s).hasClass('modal')) Dc.setModal({
                modal: s, show: false
            });
        }
    }($.fn.hide);
})(Dc);

//微信初始化
function DcWeixinInit(callback) {
    if (wx) {
        Dc.submit({ actionid: 101, Url: encodeURIComponent(location.href).replace(/%/g, '/bfh')}, false, function (query, data2) {
            wx.config({
                debug: Dc.config.weixinDebug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: Dc.config.weixinAppId, // 必填，公众号的唯一标识
                timestamp: data2.ResultObj.timestamp, // 必填，生成签名的时间戳
                nonceStr: data2.ResultObj.nonceStr, // 必填，生成签名的随机串
                signature: data2.ResultObj.signature,// 必填，签名，见附录1
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
            if (callback)
                callback(query, data2);
        });
    }
    else {
        alert('jweixin-1.0.0.js Not Found');
    }
}
//微信授权
function DcWeixinOauth(callback) {
    var code = Dc.getUrlParam('Code');
    if (code) {
        Dc.submit({ actionid: 102, code: code }, function (query, data) {
            if(data.ResultObj.DoCode == 1){
                Dc.cookie('wechat', data.ResultObj.WeChat, 30);
                var WeChat = eval('(' + data.ResultObj.WeChat + ')');
                if (WeChat.openid) {
                    Dc.params.openid = WeChat.openid;
                }
                if (callback)
                    callback(query, data);
            }else{
                alert('服务端拉取用户信息失败，请重试');
            }
        });
    } else {
        window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8e2a049e7e6b2bcb&redirect_uri=http%3A%2F%2Fhd.zm.91.com%2Ffrontend%2FDragonBoat%2Fwap%2Findex.html&response_type=code&scope=snsapi_userinfo#wechat_redirect';
    }
}