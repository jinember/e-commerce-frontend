import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/PointLog/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/PointLog/addPointLog', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/PointLog/updatePointLog', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/PointLog/deletePointLog/' + id, method: 'DELETE' })
}

