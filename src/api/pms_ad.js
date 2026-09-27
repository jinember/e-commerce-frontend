import service from '@/network/request.js'

/* 1.广告列表(分页+搜索) */
export function list(page, limit, param) {
  return service({
    url: `/Ad/list/${page}/${limit}`,
    method: 'POST',
    data: param
  })
}

/* 2.新增广告 */
export function addAd(ad) {
  return service({
    url: `/Ad/addAd`,
    method: 'POST',
    data: ad
  })
}

/* 3.更新广告 */
export function updateAd(ad) {
  return service({
    url: `/Ad/updateAd`,
    method: 'PUT',
    data: ad
  })
}

/* 4.删除广告 */
export function deleteAd(id) {
  return service({
    url: `/Ad/deleteAd/${id}`,
    method: 'DELETE'
  })
}

/* 5.广告点击量+1 */
export function recordAdClick(id){
	return service({ url:`/Ad/click/${id}`, method:"POST" })
}
