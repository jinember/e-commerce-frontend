import service from "@/network/request.js"

/* 1.获取规格参数(根据类别ID)。*/
export function listByCategory( categoryId, attrType ){
	let PRX_FIX = "/GoodsAttr/listByCategory";
	return service({
		url: `${PRX_FIX}/${categoryId}/${attrType}`,
		method:"GET",
	});

}

/* 2.分页+搜索查询属性列表(规格参数/销售属性共用)。*/
export function listAttr( page, limit, param ){
	return service({
		url:`/GoodsAttr/list/${page}/${limit}`,
		method:"GET",
		params:param
	});
}

/* 3.新增属性。*/
export function addAttr( attr ){
	return service({
		url:`/GoodsAttr/add`,
		method:"POST",
		data:attr
	});
}

/* 4.更新属性。*/
export function updateAttr( attr ){
	return service({
		url:`/GoodsAttr/update`,
		method:"PUT",
		data:attr
	});
}

/* 5.删除属性。*/
export function deleteAttr( id ){
	return service({
		url:`/GoodsAttr/delete/${id}`,
		method:"DELETE"
	});
}
