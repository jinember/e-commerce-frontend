import service from "@/network/request.js"

/* 1.C端商品列表(上架) */
export function shopList(){
	return service({
		url:"/shop/list",
		method:"GET"
	});
}

/* 2.商品详情(含SKU列表) */
export function shopDetail( spuId ){
	return service({
		url:`/shop/detail/${spuId}`,
		method:"GET"
	});
}

/* 3.提交订单 */
export function submitOrder( order ){
	return service({
		url:"/shop/submitOrder",
		method:"POST",
		data:order
	});
}

/* 4.我的订单 */
export function myOrders( userName ){
	return service({
		url:`/shop/orderList/${userName}`,
		method:"GET"
	});
}


/* 5.查会员等级 */
export function checkMember( param ){
	return service({
		url:"/shop/checkMember",
		method:"GET",
		params:param
	});
}

/* 6.注册会员 */
export function registerMember( member ){
	return service({
		url:"/shop/register",
		method:"POST",
		data:member
	});
}

/* 7.C端每日签到 */
export function shopSignIn( memberId ){
	return service({
		url:`/shop/signIn?memberId=${memberId}`,
		method:"POST"
	});
}

/* 8.C端个人信息：查询 */
export function myInfo( memberId ){
	return service({
		url:`/shop/myInfo`,
		method:"GET",
		params:{ memberId }
	});
}

/* 9.C端个人信息：修改 */
export function updateInfo( member ){
	return service({
		url:"/shop/updateInfo",
		method:"POST",
		data:member
	});
}

/* ===== 【营销联动】优惠券：领券中心 / 领券 / 我的券 =====
   都走 /shop/** 白名单，C 端会员不用登录后台也能调用 */

/* 10.领券中心：当前可领取的优惠券 */
export function couponList( memberId ){
	return service({
		url:"/shop/couponList",
		method:"GET",
		params:{ memberId }
	});
}

/* 11.领取优惠券 */
export function receiveCoupon( data ){
	return service({
		url:"/shop/receiveCoupon",
		method:"POST",
		data:data
	});
}

/* 12.我的优惠券（未使用） */
export function myCoupons( memberId ){
	return service({
		url:"/shop/myCoupons",
		method:"GET",
		params:{ memberId }
	});
}

/* ===== 【方案B】C端消息中心：我的消息 / 未读数 / 标记已读 / 全部已读 ===== */

/* 13.我的消息列表（倒序，附未读数） */
export function myMessages( memberId ){
	return service({
		url:"/shop/myMessages",
		method:"GET",
		params:{ memberId }
	});
}

/* 14.未读消息数（头部红点用） */
export function unreadCount( memberId ){
	return service({
		url:"/shop/unreadCount",
		method:"GET",
		params:{ memberId }
	});
}

/* 15.标记单条已读 */
export function readMessage( data ){
	return service({
		url:"/shop/readMessage",
		method:"POST",
		data:data
	});
}

/* 16.全部已读 */
export function readAllMessages( data ){
	return service({
		url:"/shop/readAllMessages",
		method:"POST",
		data:data
	});
}