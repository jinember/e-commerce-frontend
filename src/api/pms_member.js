import service from '@/network/request.js'

/* 1.会员列表(分页+搜索) */
export function list(page, limit, param) {
  return service({
    url: `/Member/list/${page}/${limit}`,
    method: 'POST',
    data: param
  })
}

/* 2.新增会员 */
export function addMember(member) {
  return service({
    url: `/Member/addMember`,
    method: 'POST',
    data: member
  })
}

/* 3.更新会员 */
export function updateMember(member) {
  return service({
    url: `/Member/updateMember`,
    method: 'PUT',
    data: member
  })
}

/* 4.删除会员 */
export function deleteMember(id) {
  return service({
    url: `/Member/deleteMember/${id}`,
    method: 'DELETE'
  })
}

/* 5.顶部统计 */
export function statMember() {
  return service({
    url: `/Member/stat`,
    method: 'GET'
  })
}

/* 6.批量更新状态 */
export function batchUpdateStatus(ids, status) {
  return service({
    url: `/Member/batchStatus`,
    method: 'POST',
    data: { ids: ids, status: status }
  })
}

/* 7.批量删除 */
export function batchDelete(ids) {
  return service({
    url: `/Member/batchDelete`,
    method: 'POST',
    data: { ids: ids }
  })
}
