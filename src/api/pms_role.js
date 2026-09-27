import service from '@/network/request.js'

export function roleOptions(){
	return service({
		url:`/Role/roleOptions`,
		method:"GET"
	});
}