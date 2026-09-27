import service from '@/network/request.js'

/* 1.SKU 分页列表。【带搜索】 */
export function getSkuList(page, limit, param){
	return service({
		url:`/Sku/list/${page}/${limit}`,
		method:"POST",
		data:param
	});
}

/* 2.批量删除SKU。 */
export function deleteSkuByIds( ids ){
	return service({
		url:`/Sku/deleteByIds`,
		method:"POST",
		data:ids
	});
}

/* 3.改单个价格 */
export function updateSkuPrice( skuId, price ){
	return service({
		url:`/Sku/updatePrice`,
		method:"PUT",
		data:{ skuId, price }
	});
}

/* 3.1 编辑SKU（名称、价格） */
export function updateSku( data ){
	return service({
		url:`/Sku/update`,
		method:"PUT",
		data
	});
}

/* 3.2 上传SKU图片 */
export function uploadSkuImg( FD ){
	return service({
		url:`/Sku/uploadImg`,
		method:"POST",
		data:FD
	});
}

/* 4.批量改价格 */
export function batchUpdateSkuPrice( ids, price ){
	return service({
		url:`/Sku/batchUpdatePrice`,
		method:"POST",
		data:{ ids, price }
	});
}

/* 5.批量删除 */
export function batchDeleteSku( ids ){
	return service({
		url:`/Sku/batchDelete`,
		method:"POST",
		data:ids
	});
}
