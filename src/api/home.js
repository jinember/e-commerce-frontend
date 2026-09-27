import service from '@/network/request.js'

/* 首页统计 */
export function getHomeStats() {
  return service({
    url: '/Home/stats',
    method: 'GET'
  })
}
