import service from '@/network/request.js'

/* 1.商品(SPU)分页列表。【带搜索】 */
export function getSpuList(page, limit, param){
	return service({
		url:`/Spu/list/${page}/${limit}`,
		method:"POST",
		data:param
	});
}

/* 2.设置商品上架/下架状态。 */
export function setSpuStatus( spu ){
	return service({
		url:`/Spu/setStatus`,
		method:"POST",
		data:spu
	});
}

/* 3.编辑商品 */
export function updateGoods( goods ){
	return service({
		url:`/Spu/update`,
		method:"PUT",
		data:goods
	});
}
