import service from '@/network/request.js'

/* 1.客服会话分页列表 */
export function list(page, limit, param) {
  return service({ url: '/ChatSession/list/' + page + '/' + limit, method: 'POST', data: param || {} })
}
/* 2.会话质量看板：按咨询类型统计会话数/转化率 */
export function statByChatType() {
  return service({ url: '/ChatSession/statByChatType', method: 'GET' })
}
/* 3.详情 */
export function getById(id) {
  return service({ url: '/ChatSession/' + id, method: 'GET' })
}
/* 4.某会话的对话明细（查看对话抽屉） */
export function messages(id) {
  return service({ url: '/ChatSession/messages/' + id, method: 'GET' })
}
/* 5.客服回复：写入一条 merchant 消息 */
export function reply(data) {
  return service({ url: '/ChatSession/reply', method: 'POST', data: data })
}
/* 6.待回复会话列表（最后一条是会员发的，商家还没回） */
export function pendingList(page, limit) {
  return service({ url: '/ChatSession/pendingList/' + page + '/' + limit, method: 'POST', data: {} })
}
/* 7.待回复会话数 */
export function pendingCount() {
  return service({ url: '/ChatSession/pendingCount', method: 'GET' })
}
/* 8.客服聊天工作台：会话列表（带最后消息/未读数） */
export function chatList(page, limit) {
  return service({ url: '/ChatSession/chatList/' + page + '/' + limit, method: 'GET' })
}
/* 9.客服聊天工作台：未读会话总数 */
export function chatUnreadTotal() {
  return service({ url: '/ChatSession/chatUnreadTotal', method: 'GET' })
}
/* 10.客服聊天工作台：打开会话（返回对话明细 + 标记已读） */
export function chatOpen(id) {
  return service({ url: '/ChatSession/chatOpen/' + id, method: 'GET' })
}
