/* -----------H-ui前端框架-------------
 * H-ui.admin.js v3.1
 * http://www.h-ui.net/
 * Created & Modified by guojunhui
 * Date modified 2017.02.03
 * Copyright 2013-2017 北京颖杰联创科技有限公司 All rights reserved.
 * Licensed under MIT license.
 * http://opensource.org/licenses/MIT
 */
var num = 0,
	oUl = $("#min_title_list"),
	hide_nav = $("#Hui-tabNav");

/*获取顶部选项卡总长度*/
function tabNavallwidth() {
	var taballwidth = 0,
		$tabNav = hide_nav.find(".acrossTab"),
		$tabNavWp = hide_nav.find(".Hui-tabNav-wp"),
		$tabNavitem = hide_nav.find(".acrossTab li"),
		$tabNavmore = hide_nav.find(".Hui-tabNav-more");
	if (!$tabNav[0]) {
		return
	}
	$tabNavitem.each(function (index, element) {
		taballwidth += Number(parseFloat($(this).width() + 60))
	});
	$tabNav.width(taballwidth + 25);
	var w = $tabNavWp.width();
	if (taballwidth + 25 > w) {
		$tabNavmore.show()
	} else {
		$tabNavmore.hide();
		$tabNav.css({
			left: 0
		});
	}
}

/*左侧菜单响应式*/
function Huiasidedisplay() {
	if ($(window).width() >= 768) {
		$(".Hui-aside").show();
	}
}
/*获取皮肤cookie*/
function getskincookie() {
	var v = $.cookie("Huiskin");
	var hrefStr = $("#skin").attr("href");
	if (v == null || v == "") {
		v = "default";
	}
	if (hrefStr != undefined) {
		var hrefRes = hrefStr.substring(0, hrefStr.lastIndexOf('skin/')) + 'skin/' + v + '/skin.css';
		$("#skin").attr("href", hrefRes);
	}
}
/*菜单导航*/
function Hui_admin_tab(obj) {
	var bStop = false,
		bStopIndex = 0,
		href = $(obj).attr('data-href'),
		title = $(obj).attr("data-title"),
		topWindow = $(window.parent.document),
		show_navLi = topWindow.find("#min_title_list li"),
		iframe_box = topWindow.find("#iframe_box");
	//console.log(topWindow);
	if (!href || href == "") {
		alert("data-href不存在，v2.5版本之前用_href属性，升级后请改为data-href属性");
		return false;
	}
	if (!title) {
		alert("v2.5版本之后使用data-title属性");
		return false;
	}
	if (title == "") {
		alert("data-title属性不能为空");
		return false;
	}
	show_navLi.each(function () {
		if ($(this).find('span').attr("data-href") == href) {
			bStop = true;
			bStopIndex = show_navLi.index($(this));
			return false;
		}
	});
	if (!bStop) {
		creatIframe(href, title);
		min_titleList();
	} else {
		show_navLi.removeClass("active").eq(bStopIndex).addClass("active");
		iframe_box.find(".show_iframe").hide().eq(bStopIndex).show().find("iframe").attr("src", href);
	}
}

/*最新tab标题栏列表*/
function min_titleList() {
	var topWindow = $(window.parent.document),
		show_nav = topWindow.find("#min_title_list"),
		aLi = show_nav.find("li");
}

/*创建iframe*/
function creatIframe(href, titleName) {
	var topWindow = $(window.parent.document),
		show_nav = topWindow.find('#min_title_list'),
		iframe_box = topWindow.find('#iframe_box'),
		iframeBox = iframe_box.find('.show_iframe'),
		$tabNav = topWindow.find(".acrossTab"),
		$tabNavWp = topWindow.find(".Hui-tabNav-wp"),
		$tabNavmore = topWindow.find(".Hui-tabNav-more");
	var taballwidth = 0;

	show_nav.find('li').removeClass("active");
	show_nav.append('<li class="active"><span data-href="' + href + '">' + titleName + '</span><i></i><em></em></li>');
	if ('function' == typeof $('#min_title_list li').contextMenu) {
		$("#min_title_list li").contextMenu('Huiadminmenu', {
			bindings: {
				'closethis': function (t) {
					var $t = $(t);
					if ($t.find("i")) {
						$t.find("i").trigger("click");
					}
				},
				'closeall': function (t) {
					$("#min_title_list li i").trigger("click");
				},
			}
		});
	} else {

	}
	var $tabNavitem = topWindow.find(".acrossTab li");
	if (!$tabNav[0]) {
		return
	}
	$tabNavitem.each(function (index, element) {
		taballwidth += Number(parseFloat($(this).width() + 60))
	});
	$tabNav.width(taballwidth + 25);
	var w = $tabNavWp.width();
	if (taballwidth + 25 > w) {
		$tabNavmore.show()
	} else {
		$tabNavmore.hide();
		$tabNav.css({
			left: 0
		})
	}
	iframeBox.hide();
	iframe_box.append('<div class="show_iframe"><div class="loading"></div><iframe frameborder="0" src=' + href + '></iframe></div>');
	var showBox = iframe_box.find('.show_iframe:visible');
	showBox.find('iframe').load(function () {
		showBox.find('.loading').hide();
	});
}



/*关闭iframe*/
function removeIframe() {
	var topWindow = $(window.parent.document),
		iframe = topWindow.find('#iframe_box .show_iframe'),
		tab = topWindow.find(".acrossTab li"),
		showTab = topWindow.find(".acrossTab li.active"),
		showBox = topWindow.find('.show_iframe:visible'),
		i = showTab.index();
	tab.eq(i - 1).addClass("active");
	tab.eq(i).remove();
	iframe.eq(i - 1).show();
	iframe.eq(i).remove();
}

/*关闭所有iframe*/
function removeIframeAll() {
	var topWindow = $(window.parent.document),
		iframe = topWindow.find('#iframe_box .show_iframe'),
		tab = topWindow.find(".acrossTab li");
	for (var i = 0; i < tab.length; i++) {
		if (tab.eq(i).find("i").length > 0) {
			tab.eq(i).remove();
			iframe.eq(i).remove();
		}
	}
}

/*弹出层*/
/*
	参数解释：
	title	标题
	url		请求的url
	id		需要操作的数据id
	w		弹出层宽度（缺省调默认值）
	h		弹出层高度（缺省调默认值）
*/
function layer_show(title, url, w, h) {
	if (title == null || title == '') {
		title = false;
	};
	if (url == null || url == '') {
		url = "404.html";
	};
	if (w == null || w == '') {
		w = 800;
	};
	if (h == null || h == '') {
		h = ($(window).height() - 50);
	};
	layer.open({
		type: 2,
		area: [w + 'px', h + 'px'],
		fix: false, //不固定
		maxmin: true,
		shade: 0.4,
		title: title,
		content: url
	});
}
/*关闭弹出框口*/
function layer_close() {
	var index = parent.layer.getFrameIndex(window.name);
	parent.layer.close(index);
}

/*时间*/
function getHTMLDate(obj) {
	var d = new Date();
	var weekday = new Array(7);
	var _mm = "";
	var _dd = "";
	var _ww = "";
	weekday[0] = "星期日";
	weekday[1] = "星期一";
	weekday[2] = "星期二";
	weekday[3] = "星期三";
	weekday[4] = "星期四";
	weekday[5] = "星期五";
	weekday[6] = "星期六";
	_yy = d.getFullYear();
	_mm = d.getMonth() + 1;
	_dd = d.getDate();
	_ww = weekday[d.getDay()];
	obj.html(_yy + "年" + _mm + "月" + _dd + "日 " + _ww);
};

$(function () {    
	getHTMLDate($("#top_time"));
	getskincookie();
	//layer.config({extend: 'extend/layer.ext.js'});
	Huiasidedisplay();
	var resizeID;
	$(window).resize(function () {
		clearTimeout(resizeID);
		resizeID = setTimeout(function () {
			Huiasidedisplay();
		}, 500);
	});

	$(".nav-toggle").click(function () {
		$(".Hui-aside").slideToggle();
	});
	$(".Hui-aside").on("click", ".menu_dropdown dd li a", function () {
		if ($(window).width() < 768) {
			$(".Hui-aside").slideToggle();
		}
	});
	/*左侧菜单*/
	$(".Hui-aside").Huifold({
		titCell: '.menu_dropdown dl dt',
		mainCell: '.menu_dropdown dl dd',
	});

	/*选项卡导航*/
	$(".Hui-aside").on("click", ".menu_dropdown a", function () {
		Hui_admin_tab(this);
	});

	$(document).on("click", "#min_title_list li", function () {
		var bStopIndex = $(this).index();
		var iframe_box = $("#iframe_box");
		$("#min_title_list li").removeClass("active").eq(bStopIndex).addClass("active");
		iframe_box.find(".show_iframe").hide().eq(bStopIndex).show();
	});
	$(document).on("click", "#min_title_list li i", function () {
		var aCloseIndex = $(this).parents("li").index();
		$(this).parent().remove();
		$('#iframe_box').find('.show_iframe').eq(aCloseIndex).remove();
		num == 0 ? num = 0 : num--;
		tabNavallwidth();
	});
	$(document).on("dblclick", "#min_title_list li", function () {
		var aCloseIndex = $(this).index();
		var iframe_box = $("#iframe_box");
		if (aCloseIndex > 0) {
			$(this).remove();
			$('#iframe_box').find('.show_iframe').eq(aCloseIndex).remove();
			num == 0 ? num = 0 : num--;
			$("#min_title_list li").removeClass("active").eq(aCloseIndex - 1).addClass("active");
			iframe_box.find(".show_iframe").hide().eq(aCloseIndex - 1).show();
			tabNavallwidth();
		} else {
			return false;
		}
	});
	tabNavallwidth();

	$('#js-tabNav-next').click(function () {
		num == oUl.find('li').length - 1 ? num = oUl.find('li').length - 1 : num++;
		toNavPos();
	});
	$('#js-tabNav-prev').click(function () {
		num == 0 ? num = 0 : num--;
		toNavPos();
	});

	function toNavPos() {
		oUl.stop().animate({
			'left': -num * 100
		}, 100);
	}

	/*换肤*/
	$("#Hui-skin .dropDown-menu a").click(function () {
		var v = $(this).attr("data-val");
		$.cookie("Huiskin", v);
		var hrefStr = $("#skin").attr("href");
		var hrefRes = hrefStr.substring(0, hrefStr.lastIndexOf('skin/')) + 'skin/' + v + '/skin.css';
		$(window.frames.document).contents().find("#skin").attr("href", hrefRes);
	});
});

/* chc 2018-10-28 */
// 获取页面传的id
function getParseUrl() {
	var url = location.search; //获取url中"?"符后的字串   
	var theRequest = new Object();
	if (url.indexOf("?") != -1) {
		var str = url.substr(1);
		strs = str.split("&");
		for (var i = 0; i < strs.length; i++) {
			theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
		}
	}
	return theRequest;
}

//jquery form序列化转换为json对象
(function ($) {
	$.fn.serializeJson = function () {
		var serializeObj = {};
		var array = this.serializeArray();
		var str = this.serialize();
		$(array).each(function () {
			if (serializeObj[this.name]) {
				if ($.isArray(serializeObj[this.name])) {
					serializeObj[this.name].push(this.value);
				} else {
					serializeObj[this.name] = [serializeObj[this.name], this.value];
				}
			} else {
				serializeObj[this.name] = this.value;
			}
		});
		return serializeObj;
	};
})(jQuery);


/* 重写$.ajax方法 */
(function($){
    //首先备份下jquery的ajax方法
	var _ajax=$.ajax;
	var token = $.cookie('token');
    //重写jquery的ajax方法
    $.ajax=function(opt){
        //备份opt中error和success方法
        var fn = {
			token:token,
            error:function(XMLHttpRequest, textStatus, errorThrown){ layer.msg(textStatus, {
				icon: 2,
				time: 1000
			})},
            success:function(data, textStatus){
                if (data.code == 0) {
                    this.ok(data);
                    return true;
                }
                else if (data.code == -1) {
                    this.notLogin(data);
                }
                else {
                    this.notice(data);
                    return false;
                }},
            notLogin:function(data){
				layer.msg("未登录", {
					icon: 2,
					time: 1000
				})
				//  top.location.href = "../../../login.html";
				},
            notice:function(data){
				
                if(typeof(data)!="undefined") {
					layer.msg("请求错误", {
						icon: 2,
						time: 1000
					})
				}
				layer.alert(data.msg);
            },
            ok:function(data){
                if(typeof ( opt.ok) == "function"){
                    opt.ok(data);
                }
                else{
					layer.msg("请先配置成功返回的处理方法！", {
						icon: 2,
						time: 1000
					})
                }
            }
        }
        if(opt.error){
            fn.error=opt.error;
        }
        if(opt.success){
            fn.success=opt.success;
        }
        //扩展增强处理
        var _opt = $.extend(opt,{
			headers:{
				token:fn.token
			},
            error:function(XMLHttpRequest, textStatus, errorThrown){
                //错误方法增强处理
                fn.error(XMLHttpRequest, textStatus, errorThrown);
            },
            success:function(data, textStatus){
                //成功回调方法增强处理
                fn.success(data, textStatus);
            },
            beforeSend:function(XHR){
                //提交前回调方法
                // $('body').prepend("<div id='ajaxInfo' style=''>正在加载,请稍后...</div>");

            },
            complete:function(XHR, TS){
                //请求完成后回调函数 (请求成功或失败之后均调用)。
            }
        });
        return _ajax(_opt);
    };
})(jQuery);

/* 获取弹框所有表单元素 */
// 参数i代表弹框内的弹框表单的哪个tab
function getFormValue(){
	var isLegal = true;
	var data = {};
	$(".page-container #form1 .formControls").find("input,textarea,select").each(function () {
			//  if (($(this).val() != "")&&($(this).prop("disabled")!=true)) {
			if ($(this).prop("disabled")!=true) {
				if($(this).attr("data-type")=="number"){
					var reg=/^([1-9]\d*|0)(\.\d*[1-9])?$/;
					if(!reg.test($(this).val())){
						layer.msg("此项为数字，请输入数字！", {
							icon: 2,
							time: 1000
						})
						$(this).focus();
						isLegal = false;
						return false;
					}
					else{
						data[$(this).attr("id")] = $(this).val();
					}
				}
				else {
					data[$(this).attr("id")] = $(this).val();
				}
			}
	});
	var  returnData={};
        returnData.isLegal=isLegal;
        returnData.data=data;
        return returnData;
}
