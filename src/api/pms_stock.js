import service from '@/network/request.js'

/* 1.库存列表(分页+搜索) */
export function list(page, limit, param) {
  return service({
    url: `/Stock/list/${page}/${limit}`,
    method: 'POST',
    data: param
  })
}

/* 2.新增库存 */
export function addStock(stock) {
  return service({
    url: `/Stock/addStock`,
    method: 'POST',
    data: stock
  })
}

/* 3.更新库存 */
export function updateStock(stock) {
  return service({
    url: `/Stock/updateStock`,
    method: 'PUT',
    data: stock
  })
}

/* 4.删除库存 */
export function deleteStock(id) {
  return service({
    url: `/Stock/deleteStock/${id}`,
    method: 'DELETE'
  })
}

/* 5.查全部库存(供出入库下拉) */
export function allStocks() {
  return service({ url: '/Stock/all', method: 'GET' })
}

/* 6.批量更新库存(验收①) */
export function batchUpdate(list) {
  return service({
    url: '/Stock/batchUpdate',
    method: 'PUT',
    data: list
  })
}

/* 7.库存预警列表(验收④)：低于安全库存的SKU */
export function warningList() {
  return service({ url: '/Stock/warning', method: 'GET' })
}

/* 8.库存盘点(验收)：提交实盘数，自动算盘盈盘亏 */
export function stockCheck(id, actualStock) {
  return service({
    url: '/Stock/check',
    method: 'POST',
    data: { id, actualStock }
  })
}

/* 9.批量删除库存 */
export function batchDelete(ids) {
  return service({
    url: '/Stock/batchDelete',
    method: 'POST',
    data: ids
  })
}

/* 10.批量入库 */
export function batchInbound(items) {
  return service({
    url: '/Stock/batchInbound',
    method: 'POST',
    data: items
  })
}

/* 11.Excel批量入库 */
export function importExcel(formData) {
  return service({
    url: '/Stock/importExcel',
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
