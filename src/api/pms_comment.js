import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Comment/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Comment/addComment', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Comment/updateComment', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Comment/deleteComment/' + id, method: 'DELETE' })
}

