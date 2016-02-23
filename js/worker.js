/**
 * Created by yuxinyu on 12/25.
 */
$(function () {
    var dom = {
        user_info: $('.user-info'),
        login_form: $('.login-form'),
        btn_login: $('.btn_login'),
        select: $('#selectHouse'),
        btn_house: $('.btn_house'),
        file: $('#fileInput'),
        photo_list: $('.photo-list'),
        progress: $('#progress'),
        issue: $('#issue'),
        error: $('#error'),
        alter: $('#alter'),
        arrange: $('#arrange'),
        maskImgs: $('.maskImgs'),
        step_form: $('.step-form'),
        btn_photo: $('.photo-take'),
        btn_pro_cfm: $('#btn-pro-cfm'),
        btn_pro_step: $('#btn-pro-step'),
        btn_issue: $('#btn_issue'),
        btn_error: $('#btn_error'),
        btn_pop_sub: $('.btn-pop-sub'),
        btn_pop_act: $('.btn-pop-act'),
        pop_error: $('#pop_error')
    };

    var params = {
        HouseId: 0,
        WeChat: {},
        img: null
    };

    var modal = {
        msg: $('.modal_msg'),
        form: $('.modal_form')
    };

    var process = {
        init: function () {
            event.bind();
            FastClick.attach(document.body);
            Dc.params.openid = '111';
            Dc.config.success = process.success;
            //if(Dc.cookie('wechat')){  //从cookie提取用户信息
            //    params.WeChat = eval('(' + Dc.cookie('wechat') + ')');
            //    if (params.WeChat.openid) {
            //        Dc.params.openid = WeChat.openid;
            //    }
            //}else{  //无cookie 进行用户授权
            //    DcWeixinOauth(function(query, data){
            //        params.WeChat = eval('(' + data.ResultObj.WeChat + ')');
            //    });
            //}
            //DcWeixinInit(); //初始化微信JS

            // 页面初始化
            Dc.submit(1007, function (query, data) {
                if (data.ResultObj.UserStaus != 0) {  // UserStaus -- 用户状态 （0：正常，1：未注册，2：正在审核）
                    Dc.goPage('#login');
                    dom.login_form.find('input').eq(0).focus();
                    if (data.ResultObj.UserStaus == 2) {
                        dom.login_form.html('<p class="fs-lg">您的注册信息正在进行审核</p>');
                    }
                } else {
                    var options = '';
                    $.each(data.ResultObj.Houselist, function (i, val) {
                        options += '<option value="' + val.HouseId + '">' + val.HouseRegion + '</option>';
                    });
                    dom.select.html(options);
                    Dc.goPage('#house');
                }
            });
        },

        success: function (query, data) {
            if (data.Code != 1) {
                Dc.setModal({modal: modal.msg, show: true, content: data.Error});
                return false;
            }
        },

        initPage: function (query, data) {
            // 头部信息 Header
            dom.user_info.html('<span class="fs-lg">' + data.ResultObj.WeiXinName + '</span><br>' + data.ResultObj.HouseRegion);
            params.HouseId = data.ResultObj.HouseId;

            // 现场照片 Swiper
            var html_swiper = '';
            if (data.ResultObj.CurrentPics && data.ResultObj.CurrentPics.length > 0) {
                $.each(data.ResultObj.CurrentPics, function (i, val) {
                    if (i > 2) return false;
                    html_swiper += '<li><a href="' + val.Picurl + '"><img src="' + val.Picurl + '" alt="' + val.PicDesc + '"></a></li>';
                });
                dom.photo_list.html(html_swiper);
            } else {
                dom.photo_list.hide();
            }

            // 装修进度 Progress
            if (data.ResultObj.CurrentStepName) {
                dom.progress.find('li').html('当前进度：' + data.ResultObj.CurrentStepName);
                dom.btn_pro_cfm.attr('data-status', data.ResultObj.IsStepConfirm);
                if (data.ResultObj.IsStepConfirm == 0) {
                    dom.btn_pro_cfm.html('跳过当前进度');
                }
            }

            // 装修问题 Issue
            if (data.ResultObj.QuestionList && data.ResultObj.QuestionList.length > 0) {
                var issue_html = '';
                $.each(data.ResultObj.QuestionList, function (index, val) {
                    issue_html += '<li><span class="elc w-70">' + (val.QType == 0 ? '业主：' : '工人：') + val.Question + '</span><a href="javascript:;" class="li-detail" data-answer="' + (val.Answer ? val.Answer : '') + '" data-qtype="' + val.QType + '">' + (val.Answer ? '查看详情' : '待回复') + ' >></a></li>';
                });
                dom.issue.find('ul').html(issue_html);
            } else {
                dom.issue.find('ul').html('<li><span class="elc">暂无装修问题</span></li>');
            }

            // 异常信息 Error
            if (data.ResultObj.Errors && data.ResultObj.Errors.length > 0) {
                var error_html = '';
                $.each(data.ResultObj.Errors, function (index, val) {
                    error_html += '<li><span class="li-time">' + val.Edate.split(' ', 1)[0] + '</span>' + val.Econtent + '</li>';
                });
                dom.error.find('ul').html(error_html);
            } else {
                dom.error.find('ul').html('<li><span class="elc" style="color:#333">暂无装修异常</span></li>');
            }

            // 需求变更 Alter
            if (data.ResultObj.Changes && data.ResultObj.Changes.length > 0) {
                var alter_html = '';
                $.each(data.ResultObj.Changes, function (index, val) {
                    alter_html += '<li><span class="elc w-70">' + val.Change + '</span><a href="javascript:;" data-cid="' + val.CId + '" class="btn btn-xs' + (val.CConfirm == 1 ? '" data-status="2">已完成' : (val.WConfirm == 1 ? ' red" data-status="1">待验收' : ' red" data-status="0">待处理')) + '</a></li>';
                });
                dom.alter.find('ul').html(alter_html);
            } else {
                dom.alter.find('ul').html('<li><span class="elc">暂无需求变更</span></li>');
            }

            // 工作安排
            if (data.ResultObj.WorkArrange && data.ResultObj.WorkArrange.length > 0) {
                var arrange_html = '';
                var days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
                $.each(data.ResultObj.WorkArrange, function (index, val) {
                    arrange_html += '<li style="' + (val.IsToday ? 'color:#dd8800' : '') + '"><span class="li-time">' + days[val.Days - 1] + '</span>' + val.ArrangeContent + '</li>';
                });
                dom.arrange.find('ul').html(arrange_html);
            } else {
                dom.arrange.find('ul').html('<li><span class="elc">暂无工作安排</span></li>');
            }

            Dc.goPage('#main');
        }
    };

    var event = {
        bind: function () {
            $('.collapse').find('.nav').click(function () {
                $('#collapseNavbar').collapse('hide');
            });

            $('section').click(function () {
                $('#collapseNavbar').collapse('hide');
            });

            dom.btn_login.click(function () {
                var form = dom.login_form, error = form.find('.form-error'), tel = form.find('input').eq(0).val(), name = form.find('input').eq(1).val();
                error.hide();
                if (!Dc.vTel(tel)) {
                    error.eq(0).html('请输入正确的手机号码').show();
                    return false;
                }
                if (!name) {
                    error.eq(1).html('请输入您的姓名').show();
                    return false;
                }
                Dc.submit({
                    actionid: 103,
                    WeixinName: params.WeChats,
                    userTel: tel,
                    userName: name,
                    userType: 0
                }, function (query, data) {
                    if (data.UserStaus == 0) {

                    } else {
                        dom.login_form.html('<p class="fs-lg">您的注册信息正在进行审核</p>');
                    }
                })
            });

            //查看效果图1002
            $('#btn_maskImgs').click(function () {
                Dc.submit({actionid: 1002}, function (query, data) {
                    if (data.ResultObj) {
                        var mask_html = '';
                        $.each(data.ResultObj.ModelPics, function (index, val) {
                            mask_html += '<div class="swiper-slide"><a href="' + val.Picurl + '"><img src="' + val.Picurl + '"></a><div class="slider-desc"><p>' + val.PicDesc + '</p></div></div>';
                        });
                        dom.maskImgs.find('.swiper-wrapper').html(mask_html);
                        // 初始化Swiper
                        var sliderSwiper = new Swiper('.slider-container', {
                            roundLengths: true,
                            prevButton: '.swiper-button-prev',
                            nextButton: '.swiper-button-next'
                        });
                        dom.maskImgs.show();
                        $('.slider-container').css('height', $(window).height() + 'px');
                        sliderSwiper.update();
                    } else {
                        modal.msg.show('装修效果图暂未上传');
                    }
                });
            });

            // 验收进度1010
            dom.btn_pro_cfm.click(function () {
                if ($(this).attr('data-status')) {
                    Dc.submit({
                        actionid: 1010,
                        ChangeType: $(this).attr('data-status') == 0 ? '1' : '0'
                    }, function (query, data) {
                        if (data.ResultObj && data.ResultObj.CurrentStepName) {
                            dom.progress.find('li').html('当前进度：' + data.ResultObj.CurrentStepName);
                        }
                    });
                }
            });

            // 装修问题（详情）
            dom.issue.click(function (e) {
                var _this = $(e.target);
                if (_this.attr('data-qtype') != null) {
                    var qtype = _this.attr('data-qtype');
                    var ques = _this.parent().find('span').html();
                    var answ = _this.attr('data-answer');
                    if (!answ) {
                        modal.msg.show(ques, '（待回复）');
                    } else {
                        modal.msg.show(ques + '<br>答复：' + answ, '（已回复）');
                    }
                } else {
                    return false;
                }
            });

            // 添加装修问题1011
            dom.btn_issue.click(function () {
                dom.btn_pop_sub.attr('data-type', '1011');
                modal.form.show('请填写您在装修时遇到的问题', '', '提交');
            });

            // 添加变更1004
            dom.btn_error.click(function () {
                dom.btn_pop_sub.attr('data-type', '1012');
                modal.form.show('请填写您要提交给客户的异常信息', '', '提交');
            });

            dom.btn_pop_sub.click(function () {
                var text = modal.form.find('textarea').val();
                if (!$.trim(text)) {
                    dom.pop_error.show();
                    dom.pop_error.css('opacity', '1');
                    return false;
                }
                if ($(this).attr('data-type') && $(this).attr('data-type') === '1011') {
                    Dc.submit({actionid: 1011, Question: text}, function (query, data) {
                        Dc.submit(1008, function (query, data) {
                            process.initPage(query, data);
                            dom.btn_pop_sub.attr('data-type', '');
                        });
                    });
                } else if ($(this).attr('data-type') && $(this).attr('data-type') === '1012') {
                    Dc.submit({actionid: 1012, Error: text}, function (query, data) {
                        Dc.submit(1008, function (query, data) {
                            process.initPage(query, data);
                            dom.btn_pop_sub.attr('data-type', '');
                        });
                    });
                } else if ($(this).attr('data-type') && $(this).attr('data-type') === '1009') {
                    console.log(params.img._value);
                    $.ajax({
                        url: 'http://zx.com:90/PageRequest.ashx',
                        data: {
                            actionid: 1009,
                            openid: Dc.params.openid,
                            HouseId: Dc.params.HouseId,
                            PicDate: encodeURIComponent(params.img._value),
                            PicDesc: text
                        },
                        type: 'POST',
                        dataType: 'string',
                        timeOut: 5000,
                        success: function (data) {
                            if (data.Code == 1) {
                                modal.msg.show('上传成功！');
                                Dc.submit(1008, function (query, data) {
                                    process.initPage(query, data);
                                    dom.btn_pop_sub.attr('data-type', '');
                                });
                            } else {
                                modal.msg.show(data.Error);
                            }
                        },
                        error: function (xhr, type) {
                        }
                    });
                }
            });

            //变更验收1013
            dom.alter.click(function (e) {
                var _this = $(e.target);
                if (_this.attr('data-cid') != null) {
                    var cid = _this.attr('data-cid');
                    var status = _this.attr('data-status');
                    var info = _this.parent().find('span').html();
                    if (status == 0) {
                        modal.msg.show(info, '（待工人确认）', '确认该需求');
                        dom.btn_pop_act.attr('data-type', '1013');
                        dom.btn_pop_act.attr('data-cid', _this.attr('data-cid'));
                    } else if (status == 1) {
                        modal.msg.show(info, '（待业主验收）');
                    } else {
                        modal.msg.show(info, '（已完成）');
                    }
                }
            });

            dom.btn_pop_act.click(function () {
                if ($(this).attr('data-type') && $(this).attr('data-type') === '1013') {
                    Dc.submit({actionid: 1013, CId: $(this).attr('data-cid'), CType: 1}, function (query, data) {
                        modal.msg.show('确认成功！');
                        Dc.submit(1008, function (query, data) {
                            process.initPage(query, data);
                            dom.btn_pop_act.attr('data-type', '');
                            dom.btn_pop_act.attr('data-cid', '');
                        });
                    });
                }
            });

            // 查看装修工序
            dom.btn_pro_step.click(function () {
                var title = [], arrHtml = [], html = '';
                Dc.submit(1014, function (query, data) {
                    $.each(data.ResultObj.DecorationStep, function (i, val) {
                        var flag = false;
                        for (var p in title) {
                            if (title[p] == val.StepPart) {
                                arrHtml[p] += '<li>' + val.StepName + (val.StepNeed ? '（需要材料：' + val.StepNeed + '）' : '') + '</li>';
                                flag = true;
                                break;
                            }
                        }
                        if (flag == false) {
                            title.push(val.StepPart);
                            arrHtml.push('<li>' + val.StepName + (val.StepNeed ? '（需要材料：' + val.StepNeed + '）' : '') + '</li>')
                        }
                    });
                    for (var p in title) {
                        html += '<section><div class="sf-title"><span class="w-70">' + title[p] + '</span><a href="javascript:;"' +
                            ' class="li-detail" data-flag="0">展开 >></a></div><ul>' + arrHtml[p] + '</ul></section>';
                    }
                    dom.step_form.html(html);
                    Dc.goPage('#step');
                })
            });

            dom.step_form.click(function (e) {
                var _this = $(e.target);
                if (_this.hasClass('li-detail')) {
                    if (_this.attr('data-flag') == 0) {
                        _this.html('收起 >>');
                        _this.parent().parent().find('ul').css('display', 'block');
                        _this.attr('data-flag', '1');
                    } else {
                        _this.html('展开 >>');
                        _this.parent().parent().find('ul').css('display', 'none');
                        _this.attr('data-flag', '0');
                    }
                } else {
                    return false
                }
            });

            dom.btn_house.click(function () {
                var houseId = dom.select.val();
                Dc.submit({actionid: 1008, HouseId: houseId, openid: '111'}, function (query, data) {
                    process.initPage(query, data);
                    Dc.params.HouseId = query.HouseId;
                });
            });

            dom.file.change(function () {
                params.img = lrz(this.files[0], {width: 300}).then(function (rst) {
                    var img = new Image();
                    img.src = rst.base64;
                    img.onload = function () {
                        modal.form.show('', '请填写图片说明', '确认上传');
                        modal.form.find('.content').append(img);
                        dom.btn_pop_sub.attr('data-type', '1009');
                    };
                    return rst.base64;
                });
            });
            dom.btn_photo.click(function () {
                dom.file.trigger('click');
                return false;
            });
        }
    };

    process.init();
});