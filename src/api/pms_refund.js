import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Refund/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Refund/addRefund', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Refund/updateRefund', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Refund/deleteRefund/' + id, method: 'DELETE' })
}

