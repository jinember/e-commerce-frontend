import service from '@/network/request.js'

export function list(page, limit, param) {
  return service({ url: '/Supplier/list/' + page + '/' + limit, method: 'POST', data: param })
}
export function add(obj) {
  return service({ url: '/Supplier/addSupplier', method: 'POST', data: obj })
}
export function update(obj) {
  return service({ url: '/Supplier/updateSupplier', method: 'PUT', data: obj })
}
export function remove(id) {
  return service({ url: '/Supplier/deleteSupplier/' + id, method: 'DELETE' })
}

/* 查全部供应商(供下拉) */
export function allSuppliers() {
  return service({ url: '/Supplier/all', method: 'GET' })
}
