import axios from 'axios'
import {Message} from 'element-ui'

//1.创建axios（网络通信组件）实例对象
const service = axios.create({
	baseURL:'http://localhost:8090/mall-sys',
	timeout:0
});

//2.添加请求拦截器
service.interceptors.request.use(
	req=>{
		/*	登录之后 token 统一保存在 sessionStorage.adminToken（与路由守卫保持一致）。
			旧实现这里读的是 sessionStorage.token，两边不一致会导致
			「页面能进、接口 401」的问题，现在统一到一处。
		*/
		let token = window.sessionStorage.getItem('adminToken')
		         || window.sessionStorage.getItem('token');   // 兼容旧会话，兜底
		if (token){
			req.headers['token'] = token;
		}
		/* 带上当前登录账号，后端操作日志据此记录操作人 */
		let account = window.sessionStorage.getItem('account') || window.sessionStorage.getItem('adminUser') || '';
		if (account){
			req.headers['operator'] = account;
		}
		return req;
	},
	error=>{
		return Promise.reject(error);
	}
);

//3.添加响应拦截器
service.interceptors.response.use(
	resp=>{
		//1.把响应对象中的数据实体，返回给上层调用者
		return resp.data;
	},
	error=>{
		//1.当有错误发生时，将会进去此区域
		let resp = error.response;
		//2.当网络不通，服务器连不上，resp == undefined
		if(!resp){
			Message.error({message:'服务器无法连接（请确认网络正常）'});
			return Promise.reject(error);
		}
		//3.服务器有连接有响应（但有错误）
		let status = resp.status;//获取它的状态码
		let data = resp.data;
		if(status == 404){
			Message.error({message:'找不到相关的资源'});
		}
		else if(status == 403){
			Message.error({message:'你没有权限访问该资源'});
		}
		else if(status == 401){
			Message.error({message:'你没有登录该系统'});
			/* 登录态已失效：清掉本地会话，稍候自动跳转登录页（避免反复弹 401） */
			window.sessionStorage.removeItem('adminToken');
			window.sessionStorage.removeItem('adminUser');
			window.sessionStorage.removeItem('roleId');
			window.sessionStorage.removeItem('menuPerms');
			window.sessionStorage.removeItem('account');
			window.sessionStorage.removeItem('pubKey');
			Object.keys(window.sessionStorage)
				.filter(k => k.startsWith('skuDiscount-'))
				.forEach(k => window.sessionStorage.removeItem(k));
			/* 留 1.2 秒让提示显示出来，再跳登录页 */
			if (window.location.hash !== '#/login') {
				setTimeout(() => { window.location.hash = '#/login'; }, 1200);
			}
		}
		else{
			Message.error({message:`发生内部错误，原因：${(data && data.cause) || '未知错误'}`});
		}
		return Promise.reject(error);
	}
);

//4.导出实例对象
export default service;