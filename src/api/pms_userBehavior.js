import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/UserBehavior/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/UserBehavior/addUserBehavior', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/UserBehavior/updateUserBehavior', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/UserBehavior/deleteUserBehavior/' + id, method: 'DELETE' })
}

