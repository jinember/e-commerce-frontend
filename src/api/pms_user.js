import service from '@/network/request.js'

export function getUser(id){
	return service({
		url:`/User/getUser/${id}`,
		method:"GET"
	});
}

/*
		这是SpringBoot后台的方法格式:
		@PostMapping (
		value="/1ist/{page}/{1imit} "
		R list(
		@PathVariable ("page") Integer page,
		@PathVariable("limit")Integer limit,
		@RequestBody Map map );
*/

export function getUserList(page,limit,param){
	return service({
		url:`/User/list/${page}/${limit}`,
		method:"POST",
		data:param
	});
}

export function addUser(user){
	return service({
		url:`/User/addUser`,
		method:"POST",
		data:user
	});
}

export function updateUser(user){
	return service({
		url:`/User/updateUser`,
		method:"PUT",
		data:user
	});
}

export function deleteUser(id){
	return service({
		url:`/User/delete/${id}`,
		method:"DELETE"
	});
}