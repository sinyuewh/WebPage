var longinBoor = false;
/**
 * 登陆 具体验证
 * 
 * @param url
 * @param loginname
 * @param password
 * @param frmId
 * @param messageId
 * @return
 */
function userLogin() {
	var logPas = document.getElementById("password").value;
	var md5logPas = hex_md5(logPas);
	$("#passwordin").attr("value", md5logPas);
	validate();
	if (longinBoor) {
		hideDiv();
		$.ajax({
			type : "POST",
			dataType : "json",
			data : $('#lform').serialize(),
			url : ES.loginUrl.userLogin,
			error : function(XMLHttpRequest, textStatus, errorThrown) {
				alert("系统出错，请稍后再试！");
			},
			success : function(json) {
				if (json.code == 0){
					window.sessionStorage.setItem('useObj',JSON.stringify(json));
					window.location = "./index.html";
				}
				else {
					document.getElementById("error").innerHTML = json.msg;
					showDiv();
					getImg();
				}
			}
		});
	}
}
function validate() {
	longinBoor = true;
	var logName = document.getElementById("username").value;
	var logPas = document.getElementById("password").value;
	var logCode = document.getElementById("code").value;
	if (logName == "") {
		document.getElementById("error").innerHTML = "用户名不能为空!";
		document.getElementById("username").focus();
		longinBoor = false;
		showDiv();
		return;
	}
	if (logPas == "") {
		document.getElementById("error").innerHTML = "密码不能为空!";
		document.getElementById("password").focus();
		longinBoor = false;
		showDiv();
		return;
	}
	if (logCode == "") {
		document.getElementById("error").innerHTML = "验证码不能为空!";
		document.getElementById("code").focus();
		longinBoor = false;
		showDiv();
	}
}

//显示动画效果
function showDiv(){
	$('#error')
    .animate({
        'bottom':372
    },100)
    .animate({
        "left":"-=10px"
    },50)
    .animate({
        "left":"+=20px"
    },50)
    .animate({
        "left":"-=20px"
    },50)
    .animate({
        "left":"+=20px"
    },50)
    .animate({
        "left":"-=20px"
    },50)
    .animate({
        "left":"+=10px"
    },50)
}
//隐藏div
function hideDiv(){
	$('#error')
	.animate({
		'bottom':560
	},100);	
}

/**
 * 验证码生成
 * 
 * @return
 */
function getImg() {
	var img = document.getElementById("myImg");
	//img.src='';
	var now = new Date(),src=null;
	$.get(ES.loginUrl.userCode,function (res) {
		img.src = ES.loginUrl.userCode;
	});
}
/**
 * 回车时，默认是登陆
 */
function on_return() {
	if (window.event.keyCode == 13) {
		if (document.all('sub') != null) {
			document.all('sub').click();
		}
	}
}