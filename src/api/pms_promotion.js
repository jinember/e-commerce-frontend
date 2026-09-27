import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Promotion/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Promotion/addPromotion', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Promotion/updatePromotion', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Promotion/deletePromotion/' + id, method: 'DELETE' })
}

