import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/StockLog/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/StockLog/addStockLog', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/StockLog/updateStockLog', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/StockLog/deleteStockLog/' + id, method: 'DELETE' })
}

