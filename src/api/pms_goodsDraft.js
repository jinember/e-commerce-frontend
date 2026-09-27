import service from '@/network/request.js'

/* 草稿分页列表（param 可传 draftName / status 过滤）。 */
export function list(page, limit, param) {
  return service({ url: '/GoodsDraft/list/' + page + '/' + limit, method: 'POST', data: param })
}

/* 【保存草稿】给当前发布流程的 Redis 缓存拍快照。参数：{pubKey, draftName, step} */
export function saveFromCache(param) {
  return service({ url: '/GoodsDraft/saveFromCache', method: 'POST', data: param })
}

/* 【继续编辑】把草稿灌回 Redis，返回 pubKey。 */
export function resume(id) {
  return service({ url: '/GoodsDraft/resume/' + id, method: 'POST' })
}

/* 【立即发布】草稿直接发布上架。 */
export function publishNow(id) {
  return service({ url: '/GoodsDraft/publish/' + id, method: 'POST' })
}

/* 【定时发布】设置定时发布时间。参数：{publishTime:'yyyy-MM-dd HH:mm:ss'} */
export function schedule(id, publishTime) {
  return service({ url: '/GoodsDraft/schedule/' + id, method: 'POST', data: { publishTime: publishTime } })
}

/* 通用保存（直接传 JSON，保留兼容）。 */
export function save(obj) {
  return service({ url: '/GoodsDraft/save', method: 'POST', data: obj })
}

export function get(id) {
  return service({ url: '/GoodsDraft/get/' + id, method: 'GET' })
}

export function remove(id) {
  return service({ url: '/GoodsDraft/delete/' + id, method: 'DELETE' })
}
