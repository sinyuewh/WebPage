var Login = (function () {
	var storage = window.localStorage,
		  $iCheck=$(".i-checkbox");
	var iconHover = function () {
		var $user = $("#txt_account"), $pass = $("#txt_pwd"),
			  $userIcon=$('.user-icon'),$passIcon=$('.pass-icon');
		$user.focus(function () {
			$userIcon.addClass('ex-user-posi-focus');
		});
		$user.blur(function () {
			$userIcon.removeClass('ex-user-posi-focus');
		});
		$pass.focus(function () {
			$passIcon.addClass('ex-icon-posi-focus');
		});
		$pass.blur(function () {
			$passIcon.removeClass('ex-icon-posi-focus');
		});
	};
	var enterLogin = function () {
		// 添加回车登录事件
		document.onkeydown = function (e) {
			switch ((window.event) ? event.keyCode : e.which) {
				case 13:
					$("#btnSubmit").click();
					break;
				default:
					break;
			}
		};
	};
	var loginSub = function () {
		//登陆
		var $error = $("#la_error");
		$("#btnSubmit").click(function () {
			var _account = $("#txt_account").val(), _pwd = $("#txt_pwd").val(),
				 oPwd64 = $.base64.btoa(_pwd);
			if (_account == "" || _pwd == "") {
				$error.attr("style", "color:red");
				$error.html("账号,密码都不能为空！");
			} else {
				$error.attr("style", "color:white");
				$error.html("正在登录,请稍后...");
				/*处理地址为后台处理方法，*/
				$.post(ES.LoginApi.login, {
					loginName: _account,
					password: oPwd64
				}, function (resp) {
					if (resp.code === '0') {
						var userObj = JSON.stringify(resp.detail);
						storage.setItem('useType', userObj);
						try {
							if ($iCheck.attr("data-sign")) {
								if (_account && _pwd) {
									var loginArr = [{
										"loginName": _account,
										"pd": oPwd64
									}];
									storage.setItem('account', encodeURI(JSON.stringify(loginArr)));
									storage.setItem('loginName', _account);
								}
							}
							if ($iCheck.attr("data-sign") == 'false') {
								storage.removeItem('loginName');
								storage.removeItem('account');
							}
						} catch (e) {
						}

						//获取用户菜单设置缓存
						$.post(ES.LoginApi.loginMenu, {}, function (res) {
							if (res.code === '0') {
								var obj = JSON.stringify(res.detail);
								window.sessionStorage.setItem('listMenu', obj);
								window.sessionStorage.setItem('token',1);
								window.location.href = "../../index.html";
							} else {
								alert('权限获取失败');
								storage.removeItem('listMenu');
							}
						});
						$error.attr("style", "color:white");
						$error.html("正在登录,请稍后...");
					} else if (resp.code === '1') {
						$error.attr("style", "color:red");
						$error.html('未知错误，请联系管理员！');
					} else {
						$error.attr("style", "color:red");
						$error.html('登陆失败，请验证重试！');
					}
				});
			}
		});
	};
	var checkBox = function () {
		$iCheck.click(function () {
			if ($(this).attr('data-sign') == 'true') {
				$(this).attr('data-sign', false).removeClass('i-checkbox-on');
			} else {
				$(this).attr('data-sign', true).addClass('i-checkbox-on');
			}
		});
	};
	var initPage = function () {
		var $User = $("#txt_account");
		var user = JSON.parse(decodeURI(storage.getItem('account')));
		if (user && user.length > 0) {
			$User.val(user[0].loginName);
			$("#txt_pwd").val($.base64.atob(user[0].pd));
		}
		if ($User.val() != '') {
			$iCheck.attr('data-sign', true).addClass('i-checkbox-on');
		} else {
			$iCheck.attr('data-sign', false).removeClass('i-checkbox-on');
		}
	};
	var pager = {
		init: function () {
			iconHover();
			enterLogin();
			loginSub();
			checkBox();
			initPage();
		}
	};
	return pager;
})();
$(function () {
	if(window.top !== window.self){
		window.top.location = window.location;
	}
	if(window.sessionStorage.getItem('token')){
		window.sessionStorage.removeItem('token');
	}
	Login.init();
	$(document).ajaxError(function () {
		alert('未知错误，请联系管理员')
	});
});