import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Invoice/list/' + page + '/' + limit, method: 'POST', data: param || {} })
}
export function add(obj) {
  return service({ url: '/Invoice/save', method: 'POST', data: obj })
}
export function del(id) {
  return service({ url: '/Invoice/delete/' + id, method: 'POST' })
}
export function issue(obj) {
  return service({ url: '/Invoice/issue', method: 'POST', data: obj })
}
export function uploadFile(fd) {
  return service({ url: '/Invoice/upload', method: 'POST', data: fd, headers: { 'Content-Type': 'multipart/form-data' } })
}
