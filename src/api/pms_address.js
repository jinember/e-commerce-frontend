import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Address/list/' + page + '/' + limit, method: 'POST', data: param || {} })
}
export function add(obj) {
  return service({ url: '/Address/save', method: 'POST', data: obj })
}
export function del(id) {
  return service({ url: '/Address/delete/' + id, method: 'POST' })
}
