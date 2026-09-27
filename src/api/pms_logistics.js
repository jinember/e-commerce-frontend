import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Logistics/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Logistics/addLogistics', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Logistics/updateLogistics', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Logistics/deleteLogistics/' + id, method: 'DELETE' })
}

