import service from '@/network/request.js'

/* 1.品牌图片上传.【写入数据到后台】 */
export function uploadImage( FD ){
	return service({
		url:`/PublishGoods/upload`,
		method:"POST",
		data:FD
	});
}

/* 2.保存基本信息.【写入数据到后台】 */
export function savePublishBase( baseInfo ){
	return service({
		url:`/PublishGoods/saveGoodsBaseInfo`,
		method:"POST",
		data:baseInfo
	});
}

/* 3.保存规格参数.【写入数据到后台】 */
export function saveGoodsAttrValues( form ){
	return service({
		url:`/PublishGoods/saveGoodsAttrValues`,
		method:"POST",
		data:form
	});
}

/* 4.读取基本信息缓存【回显用】。 */
export function getPublishBase( pubKey ){
	return service({
		url:`/PublishGoods/getGoodsBaseInfo/${pubKey}`,
		method:"GET"
	});
}

/* 5.读取规格参数缓存【回显用】。 */
export function getGoodsAttrValues( pubKey ){
	return service({
		url:`/PublishGoods/getGoodsAttrValues/${pubKey}`,
		method:"GET"
	});
}

/* 6.保存销售属性.【写入数据到后台】 */
export function saveGoodsSaleValues( form ){
	return service({
		url:`/PublishGoods/saveGoodsSaleAttrValues`,
		method:"POST",
		data:form
	});
}

/* 7.读取销售属性缓存【回显用】。 */
export function getGoodsSaleAttrValues( pubKey ){
	return service({
		url:`/PublishGoods/getGoodsSaleAttrValues/${pubKey}`,
		method:"GET"
	});
}

/* 8.保存SKU信息.【写入数据到后台】 */
export function saveSkuInfo( form ){
	return service({
		url:`/PublishGoods/saveSkuInfo`,
		method:"POST",
		data:form
	});
}

/* 9.读取SKU信息缓存【回显用】。 */
export function getSkuInfo( pubKey ){
	return service({
		url:`/PublishGoods/getSkuInfo/${pubKey}`,
		method:"GET"
	});
}

/* 10.发布商品：写入数据库+清理Redis缓存。 */
export function publishGoods( pubKey ){
	return service({
		url:`/PublishGoods/publishGoods/${pubKey}`,
		method:"POST"
	});
}
