import service from '@/network/request.js'

/* 1.订单分页列表。【带搜索】 */
export function getOrderList(page, limit, param){
	return service({
		url:`/Order/list/${page}/${limit}`,
		method:"POST",
		data:param
	});
}

/* 2.更新订单状态(发货/完成/取消)。 */
export function updateOrderStatus( order ){
	return service({
		url:`/Order/updateStatus`,
		method:"POST",
		data:order
	});
}

/* 3.订单详情 */
export function getOrderDetail(id){
	return service({ url:`/Order/${id}`, method:"GET" });
}

/* 4.订单关联支付记录 */
export function getOrderPayment(orderId){
	return service({ url:`/Order/payment/${orderId}`, method:"GET" });
}

/* 5.订单关联物流 */
export function getOrderLogistics(orderId){
	return service({ url:`/Order/logistics/${orderId}`, method:"GET" });
}

/* 6.保存订单备注 */
export function saveRemark(order){
	return service({ url:`/Order/saveRemark`, method:"POST", data:order });
}

/* 7.批量改状态 */
export function batchStatus(ids, status){
	return service({ url:`/Order/batchStatus`, method:"POST", data:{ ids, status } });
}

/* 8.订单操作日志 */
export function getOrderOpLog(orderId){
	return service({ url:`/Order/opLog/${orderId}`, method:"GET" });
}
