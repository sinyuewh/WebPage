/*
   说明：接口地址配置js
   http://127.0.0.1:9090/platform/login
*/
var ES = ES || {};
(function () {
	if (window.location.port === '9090') {
		ES.svrUrl = 'http://119.23.71.104:9090';
	} else {
		ES.svrUrl = 'http://119.23.71.104:9090';
	}
})();

//ES.websocket='ws://127.0.0.1:9090/platform/websocket';
// ES.liftRunWebsocket='ws://119.23.71.104:9090/platform/liftRunDatawebsocket';
 
// ES.svrUrl = 'http://localhost:9090/zhiyou';
// ES.websocket='ws://localhost:9090/platform/websocket';
 
 //附件服务器url地址，一般为ES.svrUrl
 //ES.fileUrl="https://39.104.186.34/zhiyou";
 
//ES.temp = 'http://route.showapi.com/313-2';
//ES.svrUrl= 'http://180.101.253.139:30008/vehicleinternet/';


ES.svrUrl = 'http://localhost:9090/whrzy';
//ES.websocket='wss://39.104.186.34/zhiyou/platform/websocket';
//ES.liftRunWebsocket='wss://39.104.186.34/zhiyou/platform/liftRunDatawebsocket';

//ES.websocket='wss://www.dytd.cn/zhiyou/platform/websocket';
//ES.liftRunWebsocket='wss://www.dytd.cn/zhiyou/platform/liftRunDatawebsocket';

ES.params = {
	showapi_appid: 40397, showapi_sign: '219cb59d05734b2fbba935aef88cdb99',
	typeId: 1
};

ES.LoginApi = {
	login: ES.svrUrl + '/web/login',                                                                              
	signout: ES.svrUrl + '/web/signout',             
	userinfo: ES.svrUrl + '/web/userinfo',                          
	modifyPass: ES.svrUrl + '/web/modifyPassword',                      
};


//信息管理
ES.info = {
	/*  信息管理操作接口 */
	infoCreate:             ES.svrUrl + '/web/info/create',         //新增信息
	infoUpdate:             ES.svrUrl + '/web/info/update',         //更新信息
	infoDelete:             ES.svrUrl + '/web/info/delete',         //删除信息
	infoDetail:             ES.svrUrl + '/web/info/detail',         //信息明细
	infoExport:             ES.svrUrl + '/web/info/export',         //导出信息的数据
	infoImport:             ES.svrUrl + '/web/info/import',         //导入信息的数据
	infoList:               ES.svrUrl + '/web/info/list',           //信息列表
	infoFieldList:          ES.svrUrl + '/web/info/fieldList',      //字段信息列表
	infoDetailToWord:       ES.svrUrl + '/web/info/exportToWord',   //导入单条数据到Word
};


//日志管理
ES.log = {
	/*  信息管理操作接口 */
	logDelete: ES.svrUrl + '/web/operateLog/delete',         //删除信息
	logDetail: ES.svrUrl + '/web/operateLog/detail',         //信息明细
	logExport: ES.svrUrl + '/web/operateLog/export',         //导出信息的数据
	logList:   ES.svrUrl + '/web/operateLog/list',           //信息列表
};

//文档管理
ES.document = {
	/*  信息管理操作接口 */
	fileKindCreate:     ES.svrUrl + '/web/document/fileKind/create',         //新增文档类别
	fileKindUpdate:     ES.svrUrl + '/web/document/fileKind/update',         //更新文档类别
	fileKindDelete:     ES.svrUrl + '/web/document/fileKind/delete',         //删除文档类别
	fileKindDetail:     ES.svrUrl + '/web/document/fileKind/detail',         //文档类别明细
	fileKindList:       ES.svrUrl + '/web/document/fileKind/list',           //文档类别列表
	fileKindAllList:    ES.svrUrl + '/web/document/fileKind/getAll',          //所有的文档类别列表
	
	filesCreate:     ES.svrUrl + '/web/document/fileData/create',         //新增文档类别
	filesUpdate:     ES.svrUrl + '/web/document/fileData/update',         //更新文档类别
	filesDelete:     ES.svrUrl + '/web/document/fileData/delete',         //删除文档类别
	filesDetail:     ES.svrUrl + '/web/document/fileData/detail',         //文档类别明细
	filesList:       ES.svrUrl + '/web/document/fileData/list',           //文档类别列表
};


// 统计分许
ES.statistical = {
	//故障统计
	faultTrapped: ES.svrUrl + '/platform/statistical/fault/faultTrapped',   //困人数据分析
	faultTrend: ES.svrUrl + '/platform/statistical/fault/faultTrend',       //故障趋势分析
	faultGroup: ES.svrUrl + '/platform/statistical/fault//faultGroup',  //故障分类统计

	//工作量统计
	personWorkLoad: ES.svrUrl + '/platform/statistical/workload/personWorkLoad',  //维保员工作统计
	projectWorkLoad: ES.svrUrl + '/platform/statistical/workload/projectWorkLoad',  //项目工作统计
	
	wbDataAnalysis: ES.svrUrl + '/platform/statistical/liftwb/wbDataAnalysis',  //维保统计分析

	inspectDataAnalysis: ES.svrUrl + '/platform/statistical/liftInspection/inspectDataAnalysis',  //年检统计分析

};


// 系统管理接口
ES.system = {

	/*  角色操作接口 */
	roleList: ES.svrUrl + '/platform/system/role/list',               //列表数据
	roleCreate: ES.svrUrl + '/platform/system/role/create',           //增加角色
	roleDetail: ES.svrUrl + '/platform/system/role/detail',           //角色详细
	roleDelete: ES.svrUrl + '/platform/system/role/delete',           //角色详细
	roleUpdate: ES.svrUrl + '/platform/system/role/update',           //更新角色

	platUserList: ES.svrUrl + '/platform/system/platusers/list',                  //平台用户列表
	getRoleNameList: ES.svrUrl + '/platform/system/platusers/getRoles',           //平台用户角色
	platUserDetail: ES.svrUrl + '/platform/system/platusers/detail',              //平台用户详细
	platUserCreate: ES.svrUrl + '/platform/system/platusers/create',              //平台用户新增
	platUserUpate: ES.svrUrl + '/platform/system/platusers/update',               //平台用户更新
	platUserResetPass: ES.svrUrl + '/platform/system/platusers/resetPassword',    //平台用户重置密码

	ownerUserList: ES.svrUrl + '/platform/system/ownersusers/list',                //业主用户列表
	ownerUserDetail: ES.svrUrl + '/platform/system/ownersusers/detail',            //业主用户详细
	ownerUserCreate: ES.svrUrl + '/platform/system/ownersusers/create',            //业主用户新增
	ownerUserUpate: ES.svrUrl + '/platform/system/ownersusers/update',             //业主用户更新
	ownerUserResetPass: ES.svrUrl + '/platform/system/ownersusers/resetPassword',  //业主用户重置密码
	
	
	noticeList: ES.svrUrl + '/platform/system/notice/list',                      //平台通知公告列表
	noticeDetail: ES.svrUrl + '/platform/system/notice/detail',                 //平台通知公告详细
	noticeCreate: ES.svrUrl + '/platform/system/notice/create',                  //平台通知公告新增
	noticeUpdate: ES.svrUrl + '/platform/system/notice/update',                  //平台通知公告更新
	noticeDelete:  ES.svrUrl + '/platform/system/notice/delete',                  //平台通知公告删除
};


//通用的api接口
ES.commApi = {
	checkUniqueness: ES.svrUrl + '/platform/commApi/checkUniqueness',       //检查数据是否唯一
	getLocation: ES.svrUrl + '/platform/commApi/getLocation',               //得到地址的经纬度
};

//首页 页面数据接口
ES.welcome = {
	//故障统计
	mainBasedata: ES.svrUrl + '/platform/monitor/main/basedata',  //基础数据统计
	mainFaultTopdata: ES.svrUrl + '/platform/monitor/main/faultTopdata',  //得到故障的top5排名
	mainGroupdata: ES.svrUrl + '/platform/monitor/main/groupdata',  //分类数据统计
	mainAlarmdata: ES.svrUrl + '/platform/monitor/main/alarmdata',  //分类数据统计
};

//大屏接口
ES.bigscreen = {
	//故障统计
	bigscreenBasedata: ES.svrUrl + '/platform/monitor/bigscreen/basedata',  //基础数据统计
	bigscreenLiftAlarmForNearly: ES.svrUrl + '/platform/monitor/bigscreen/liftAlarmForNearly',  //近6个月电梯困人趋势图
	bigscreenLiftFaultForNearly: ES.svrUrl + '/platform/monitor/bigscreen/liftFaultForNearly',  //近6个月电梯故障趋势图
	bigscreenProjectAlarmTop: ES.svrUrl + '/platform/monitor/bigscreen/projectAlarmTop',  //近期项目的困人数排行
	bigscreenProjectFaultTop: ES.svrUrl + '/platform/monitor/bigscreen/projectFaultTop',  //近期项目的故障数排行
	bigscreenProjectLiftTop: ES.svrUrl + '/platform/monitor/bigscreen/projectLiftTop',  //项目的电梯数排行
	bigscreenProjectMap: ES.svrUrl + '/platform/monitor/bigscreen/projectMap',  //项目的状态地图

	bigscreenGetSumInfo: ES.svrUrl + '/platform/monitor/bigscreen/getSumInfo',  //得到项目和电梯总数的接口
	bigscreenGetFaultSumInfo: ES.svrUrl + '/platform/monitor/bigscreen/getFaultSumInfo',  //得到故障的数据接口（10分钟刷新一次）
	bigscreenProjectStatus: ES.svrUrl + '/platform/monitor/bigscreen/projectStatus',  //项目的地图数据
	bigscreenLiftStatus: ES.svrUrl + '/platform/monitor/bigscreen/liftStatus',  //项目的电梯列表数据
	bigscreenFaultList: ES.svrUrl + '/platform/monitor/bigscreen/faultList',  //项目的电梯列表数据


};

ES.hk = {
	appkey: '21378626',
	secret: 'UmFHiet6FqfgcxZ2mcoj',
	ip: '61.153.186.173',
	port: '81'
};








