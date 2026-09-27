import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Payment/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Payment/addPayment', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Payment/updatePayment', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Payment/deletePayment/' + id, method: 'DELETE' })
}

