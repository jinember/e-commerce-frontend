import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/BrowseHistory/list/' + page + '/' + limit, method: 'POST', data: param || {} })
}
export function add(obj) {
  return service({ url: '/BrowseHistory/save', method: 'POST', data: obj })
}
export function del(id) {
  return service({ url: '/BrowseHistory/delete/' + id, method: 'POST' })
}
