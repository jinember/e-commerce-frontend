import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Message/list/' + page + '/' + limit, method: 'POST', data: param || {} })
}
export function add(obj) {
  return service({ url: '/Message/save', method: 'POST', data: obj })
}
export function del(id) {
  return service({ url: '/Message/delete/' + id, method: 'POST' })
}
