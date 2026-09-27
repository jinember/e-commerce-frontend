import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Ticket/list/' + page + '/' + limit, method: 'POST', data: param || {} })
}
export function add(obj) {
  return service({ url: '/Ticket/save', method: 'POST', data: obj })
}
export function del(id) {
  return service({ url: '/Ticket/delete/' + id, method: 'POST' })
}
