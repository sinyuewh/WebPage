/**
 * Created by ren on 2018/8/1.
 */
var ES = ES || {};
ES.svrUrl = '/exsun-bubiao-web-backend/';
var baseUrl = ES.svrUrl;
ES.loginUrl = {
	userLogin: ES.svrUrl + 'user/login',
	userMenu: ES.svrUrl + 'menu/query/role',
	userCode: ES.svrUrl + 'user/code'
};
ES.homeUrl = {
	data: ES.svrUrl + 'home/data'
};
ES.plat = {
	companyManage: ES.svrUrl+'company/page',
	companyManageEdit: ES.svrUrl+'company/query-'
};