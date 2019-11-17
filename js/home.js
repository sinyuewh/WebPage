// var res = null;
// var useInfo = JSON.parse(JSON.parse(window.sessionStorage.getItem('useObj')).userInfo);
$(function () {

	getData();
	// window.setInterval("getData()", 1000 * 120);
});

function getData() {
	getMainBasedata();
	getMainGroupdata();
	getMainFaultTopdata();
	// setAlarmInfo();
}

function getMainBasedata() {
	$.ajax({
		type: "POST",
		url: ES.welcome.mainBasedata,
		data: {},
		ok: function (resp) {
			var json = resp.data; //得到api的列表数据
			setBaseInfo(json);
		}
	})
}

function getMainGroupdata() {
	$.ajax({
		type: "POST",
		url: ES.welcome.mainGroupdata,
		data: {},
		ok: function (resp) {
			var json = resp.data; //得到api的列表数据
			initEcharts(json);
		}
	})
}

function getMainFaultTopdata() {
	$.ajax({
		type: "POST",
		url: ES.welcome.mainFaultTopdata,
		data: {},
		ok: function (resp) {
			var json = resp.data; //得到api的列表数据
			setProjectTop(json);
			setLiftTop(json);
		}
	})
}

function setBaseInfo(result) {
	$("#projectCount").html(result.projectCount);
	$("#liftCount").html(result.liftCount);
	$("#peopleCount").html(result.peopleCount);
	$("#inspectionPlanCount").html(result.inspectionPlanCount);
	$("#wbPlanCount").html(result.wbPlanCount);
	$("#zjPlanCount").html(result.zjPlanCount);
}

function initEcharts(result) {
	var line_1 = echarts.init(document.getElementById('cell_1'));
	var line_2 = echarts.init(document.getElementById('cell_2'));
	var line_3 = echarts.init(document.getElementById('cell_3'));
	var nameArr1 = [];Object.keys(result[0]);
	var nameArr2 = [];Object.keys(result[1]);
	var nameArr3 = [];Object.keys(result[2]);
	var echartsData1 = [];
	var echartsData2 = [];
	var echartsData3 = [];
	result[0].forEach(function (item) {
		let key = Object.keys(item)[0];
		var obj = {};
		obj.value = item[key];
		obj.name = key;
		nameArr1.push(key);
		echartsData1.push(obj);
	});
	console.log(echartsData1);
	console.log(nameArr1);
	result[1].forEach(function (item) {
		let key = Object.keys(item)[0];
		var obj = {};
		obj.value = item[key];
		obj.name = key;
		nameArr2.push(key);
		echartsData2.push(obj);
	});
	result[2].forEach(function (item) {
		let key = Object.keys(item)[0];
		var obj = {};
		obj.value = item[key];
		obj.name = key;
		nameArr3.push(key);
		echartsData3.push(obj);
	});
	var option1 = {
		color: ['#5e83d7', '#f8625d', '#f9ce49', '#64bcfc', '#717070','#69b585','#069488',	'#228B22','#FF8C00','	#808000','	#8B0000'],
		title: {
			text: '项目区域类别占比',
			left: 'center'
		},
		tooltip: {
			trigger: 'item',
			formatter: "{b} : {c} ({d}%)"
		},
		legend: {
			orient: 'vertical',
			top: '18%',
			textStyle: {
				fontSize: 12
			},
			right: 10,
			padding: 1,
			itemGap: 6,
			data: nameArr1,
			formatter: function (name) {
				var oData = echartsData1;
				var value = '';
				oData.forEach(function(item){
					if(name == item.name){
						value = item.value;
					}
				})
				return name + " " + value;
			}
		},
		series: [{
			type: 'pie',
			radius: ['30%', '45%'],
			center: ['40%', '50%'],
			selectedMode: 'single',
			label: {
				/* normal: {
					// show: false,
					position: 'center'
				}, */
				/* emphasis: {
					show: false,
					textStyle: {
						fontSize: '18',
						fontWeight: 'bold'
					}
				} */
			},
			labelLine: {
				length:8,
				length2:8
			},
			data: echartsData1,
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.5)'
				}
			}
		}]
	};
	var option2 = {
		color:  ['#5e83d7', '#f8625d', '#f9ce49', '#64bcfc', '#717070','#69b585','#069488',	'#228B22','#FF8C00','	#808000','	#8B0000'],
		title: {
			text: '电梯品牌类别占比',
			left: 'center'
		},
		tooltip: {
			trigger: 'item',
			formatter: "{b} : {c} ({d}%)"
		},
		legend: {
			orient: 'vertical',
			top: '18%',
			textStyle: {
				fontSize: 12
			},
			right: 10,
			padding: 1,
			itemGap: 6,
			data: nameArr2,
			formatter: function (name) {
				var oData = echartsData2;
				var value = '';
				oData.forEach(function(item){
					if(name == item.name){
						value = item.value;
					}
				})
				return name + " " + value;
			}
		},
		series: [{
			type: 'pie',
			radius: ['30%', '45%'],
			center: ['35%', '50%'],
			selectedMode: 'single',
			label: {
				normal: {
					show: false,
					// position: 'center'
				},
				emphasis: {
					show: false,
					textStyle: {
						fontSize: '12',
					}
				},
				formatter: function (params) {
					if (params.name.length > 6) {
						params.name = params.name.substr(0, 6) + "...";
					}
					return params.name
				}
			},
			labelLine: {
				length:8,
				length2:8
			},
			data: echartsData2,
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.5)'
				}
			}
		}]
	};
	var option3 = {
		color: ['#5e83d7', '#f8625d', '#f9ce49', '#64bcfc', '#717070','#69b585','#069488'],
		title: {
			text: '电梯类型占比',
			left: 'center'
		},
		tooltip: {
			trigger: 'item',
			formatter: "{b} : {c} ({d}%)"
		},
		legend: {
			orient: 'vertical',
			right: '3%',
			top: '28%',
			data: nameArr3,
			formatter: function (name) {
				var oData = echartsData3;
				var value = '';
				oData.forEach(function(item){
					if(name == item.name){
						value = item.value;
					}
				})
				return name + " " + value;
			}
		},
		series: [{
			type: 'pie',
			radius: ['30%', '45%'],
			center: ['35%', '50%'],
			selectedMode: 'single',
			label: {
				normal: {
					show: false,
					position: 'center'
				},
				emphasis: {
					show: false,
					textStyle: {
						fontSize: '18',
						fontWeight: 'bold'
					}
				}
			},
			labelLine: {
				normal: {
					show: false
				}
			},
			data: echartsData3,
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.5)'
				}
			}
		}]
	};
	line_1.setOption(option1, true);
	line_2.setOption(option2, true);
	line_3.setOption(option3, true);
}

function setProjectTop(result) {
	if (result[0].length > 0) {
		var htmlText = "<div class='title'>项目近期故障率TOP5</div>";
		result[0].forEach(function (item, index) {
			if (index < 5) {
				htmlText = htmlText + "<div class='company clearfix'>" +
					"<div class='symbol fl'><span class='i-rank'>" + (index + 1) + "</span></div>" +
					"<div class='name fl'>" + item.orgName + "</div>" +
					"<ul class='progress fl'>" +
					"<li class='base'></li>" +
					"<li class='power" + index + "' style='width:" + item.faultRate * 100 + "%;'></li>" +
					"<li class='count'>电梯(个)：" + item.liftCount + "&nbsp;故障数：" + item.fault + "</li>" +
					"</ul>" +
					"<div class='amount fl'>" + (item.faultRate * 100).toFixed(2) + "%</div>" +
					"</div>";
			}
		})
	}
	$("#company").html(htmlText);
	// topCompFive(result[0]);
}

function setLiftTop(result) {
	if (result[1].length > 0) {
		var totalCount = 0;
		result[1].forEach(function(item){
			totalCount = totalCount + Number(item.faultCount);
		})

		var htmlText = "<div class='title'>电梯近期故障率TOP5</div>";
		result[1].forEach(function (item, index) {
			if (index < 5) {
			htmlText = htmlText + "<div class='terminal clearfix'>" +
					"<div class='symbol fl'><span class='i-rank'>" + (index + 1) + "</span></div>" +
					"<div class='name fl'>" + item.orgName + "</div>" +
					"<ul class='progress fl'>" +
					"<li class='base'></li>" +
					"<li class='power" + index + "' style='width:" + (item.faultCount/totalCount*100) + "%;'></li>" +
					"<li class='count'>电梯编号：" + item.internalNum + "&nbsp;&nbsp;故障数" + item.faultCount + "</li>" +
					"</ul>" +
					"<div class='amount fl'>" + (item.faultCount/totalCount*100).toFixed(2) + "%</div>" +
					"</div>";
				}
		})
		
		$("#model").html(htmlText);
		// topModelFive(result[1],totalCount);
	}
}



// top5动画
function topCompFive(array) {
	array.forEach(function (item, index) {
		var p = '{"width":"' + item.faultRate * 100 + '%"}';
		$('#company .power').eq(index).animate(JSON.parse(p), 500);
	})
}

function topModelFive(array,total) {
	array.forEach(function (item, index) {
		var p = '{"width":"' + (item.faultCount/total*100) + '%"}';
		$('#company .power').eq(index).animate(JSON.parse(p), 500);
	})
}

function toDecimal(x) {
	var f = parseFloat(x);
	if (isNaN(f)) {
		return;
	}
	f = Math.round(x * 100) / 100;
	return f;
}

/* $('.fab li').click(function () {
	var index = $(this).index();
	$(this).addClass('selected');
	$('.fab li').not(this).removeClass('selected');
	$('.pages .page').hide();
	$('.pages .page').eq(index).show()
});

$('.second').one('click', function () {
}); */

function getAlarmInfo(){
	$.ajax({
		type: "POST",
		url: ES.welcome.mainAlarmdata,
		data: {},
		ok: function (resp) {
			var json = resp.data; //得到api的列表数据

			if(json != null && json.faultInfo != '' && json.faultInfo != null){

				$(".statistics .fab li").addClass("alarm")
				$("#Hui-msg .badge-danger").css("display","block").html(json.faultCount);
				layer.alert('警告提示:'+json.faultInfo, {
					skin: 'layui-layer-molv' //样式类名
					,closeBtn: 1,
					offset: 'rb',
					shade: 0
				  }, function(){
					$(".statistics .fab li").removeClass("alarm")
					layer.close(layer.alert());
				  });
			}else{
				$("#Hui-msg .badge-danger").css("display","none");
			}

		}
	})
}

//3分钟扫描一次
function setAlarmInfo(){
	var _this = this;
	setInterval(function(){
		getAlarmInfo();
	},1000*60*3)
}
