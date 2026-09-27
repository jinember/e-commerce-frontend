import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Coupon/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Coupon/addCoupon', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Coupon/updateCoupon', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Coupon/deleteCoupon/' + id, method: 'DELETE' })
}

