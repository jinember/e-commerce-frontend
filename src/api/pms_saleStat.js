import service from '@/network/request.js'

/* 1.销售汇总(总销售额/订单数/销量 + 各状态订单数)。 */
export function getSaleSummary(){
	return service({
		url:`/SaleStat/summary`,
		method:"GET"
	});
}

/* 2.商品销售额排行。 */
export function getTopGoods(){
	return service({
		url:`/SaleStat/topGoods`,
		method:"GET"
	});
}
