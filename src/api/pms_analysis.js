import service from '@/network/request.js'

/* 阶段二 大数据分析结果（只读 ads_* 结果表） */

/* 1.模块1 全链路行为漏斗 */
export function getFunnel() {
  return service({ url: '/Analysis/funnel', method: 'GET' })
}

/* 2.模块2 订单分析 */
export function getOrderAnalysis() {
  return service({ url: '/Analysis/order', method: 'GET' })
}

/* 3.模块3 评价分析 */
export function getCommentAnalysis() {
  return service({ url: '/Analysis/comment', method: 'GET' })
}

/* 4.模块4 交流分析 */
export function getChatAnalysis() {
  return service({ url: '/Analysis/chat', method: 'GET' })
}

/* 5.ETL 任务执行日志 */
export function getJobLog() {
  return service({ url: '/Analysis/jobLog', method: 'GET' })
}

/* 6.模块5 会员画像 */
export function getMemberProfile() {
  return service({ url: '/Analysis/memberProfile', method: 'GET' })
}

/* 7.模块6 地域分布 */
export function getRegion() {
  return service({ url: '/Analysis/region', method: 'GET' })
}

/* 8.模块7 商品分析 */
export function getProductAnalysis() {
  return service({ url: '/Analysis/product', method: 'GET' })
}

/* 9.需求补齐：时段分析（行为/订单/咨询 三模块共用） */
export function getHourly() {
  return service({ url: '/Analysis/hourly', method: 'GET' })
}

/* 10.需求补齐：搜索行为分析（热搜词 TOP50） */
export function getSearchAnalysis() {
  return service({ url: '/Analysis/search', method: 'GET' })
}

/* 11.需求补齐：浏览/收藏指标 + 热门榜单 */
export function getBehaviorSummary() {
  return service({ url: '/Analysis/behaviorSummary', method: 'GET' })
}

/* 12.需求补齐：订单流失分析 + 客单价分布 */
export function getOrderLoss() {
  return service({ url: '/Analysis/orderLoss', method: 'GET' })
}

/* 13.需求补齐：商品口碑 TOP 榜 + 好/中/差三分类 */
export function getGoodsRating() {
  return service({ url: '/Analysis/goodsRating', method: 'GET' })
}

/* 14.需求补齐：客服服务质量 + 热门咨询商品 */
export function getChatQuality() {
  return service({ url: '/Analysis/chatQuality', method: 'GET' })
}

/* 15.清洗前后 A/B 对照（对照组 ads_noclean_* vs 实验组 ads_*） */
export function getCleanCompare() {
  return service({ url: '/Analysis/compare', method: 'GET' })
}

/* 16.数据质量稽核 DQC（dqc_clean_audit，每类清洗动作命中行数） */
export function getDqAudit() {
  return service({ url: '/Analysis/dqAudit', method: 'GET' })
}
