import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/SignIn/list/' + page + '/' + limit, method: 'POST', data: param || {} })
}
export function add(obj) {
  return service({ url: '/SignIn/save', method: 'POST', data: obj })
}
export function del(id) {
  return service({ url: '/SignIn/delete/' + id, method: 'POST' })
}

export function getRule() {
  return service({ url: '/SignIn/rule', method: 'GET' })
}
export function saveRule(rule) {
  return service({ url: '/SignIn/saveRule', method: 'POST', data: rule })
}
