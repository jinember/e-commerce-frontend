import service from '@/network/request.js'

/* 1.获取属性分组列表(分页+按类别)。*/
export function listAttrGroup( page, limit, categoryId ){
	return service({
		url:`/AttrGroup/list/${page}/${limit}/${categoryId}`,
		method:"GET"
	});
}

/* 2.添加属性分组。*/
export function addAttrGroup( group ){
	return service({
		url:`/AttrGroup/add`,
		method:"POST",
		data:group
	});
}

/* 3.更新属性分组。*/
export function updateAttrGroup( group ){
	return service({
		url:`/AttrGroup/update`,
		method:"PUT",
		data:group
	});
}

/* 4.删除属性分组。*/
export function deleteAttrGroup( id ){
	return service({
		url:`/AttrGroup/delete/${id}`,
		method:"DELETE"
	});
}

/* 5.获取某个类别下的属性分组下拉选项(对话框"所属分组"用)。*/
export function optionsByCategory( categoryId ){
	return service({
		url:`/AttrGroup/optionsByCategory/${categoryId}`,
		method:"GET"
	});
}
