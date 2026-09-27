import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Cart/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Cart/addCart', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Cart/updateCart', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Cart/deleteCart/' + id, method: 'DELETE' })
}

