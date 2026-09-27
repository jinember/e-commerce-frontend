<template>
  <div class="app-container">
    <!-- 模块标题 -->
    <div class="mod-head">
      <span class="mod-title"><i class="el-icon-data-line"></i> 模块一 · 用户全链路行为数据分析</span>
      <span class="mod-sub">数据来源：ads_user_funnel / ads_behavior_summary / ads_search_analysis（Hive 离线 ETL 产出）；时段与用户画像见独立板块</span>
    </div>

    <el-tabs v-model="tab" type="border-card">
      <!-- ① 行为漏斗 -->
      <el-tab-pane name="funnel">
        <span slot="label"><i class="el-icon-data-line"></i> 流量入口 · 转化漏斗</span>
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span><i class="el-icon-data-line"></i> 用户全链路行为漏斗</span>
            <span class="src">数据来源：ads_user_funnel</span>
          </div>

          <el-alert v-if="empty" type="info" :closable="false" show-icon
                    title="等待 ETL 产出" description="结果表 ads_user_funnel 暂无数据，请先执行离线分析任务并回写该表。"></el-alert>

          <template v-else>
            <el-row :gutter="16">
              <el-col :span="4" v-for="k in cards" :key="k.label">
                <div class="stat">
                  <div class="stat-num">{{ k.value }}</div>
                  <div class="stat-label">{{ k.label }}</div>
                </div>
              </el-col>
            </el-row>

            <!-- 需求④转化漏斗图 + 需求①流量入口看板（饼图占比） -->
            <el-row :gutter="20" style="margin-top:18px;">
              <el-col :span="10">
                <div class="chart-title">全链路转化漏斗（会员人数口径）</div>
                <div id="funnelChart" class="chart-box"></div>
              </el-col>
              <el-col :span="14">
                <div class="chart-title">各流量入口访问会员占比（最新月份）</div>
                <div id="entryPieChart" class="chart-box"></div>
              </el-col>
            </el-row>

            <!-- 需求①流量入口看板（柱状图对比各入口转化率） -->
            <div class="chart-title" style="margin-top:18px;">各入口会员转化率对比（浏览→加购 / 加购→下单 / 下单→支付）</div>
            <div id="convChart" class="chart-box" style="height:300px;"></div>

            <!-- 需求②用户行为趋势图 -->
            <div class="chart-title" style="margin-top:18px;">用户行为月度趋势（浏览 / 搜索 / 收藏 / 加购）</div>
            <div id="behaviorTrendChart" class="chart-box" style="height:300px;"></div>

            <div class="chart-title" style="margin-top:18px;">各入口明细</div>
            <el-table :data="rows" border size="small" max-height="340">
              <el-table-column prop="statDate" label="月份" width="110"></el-table-column>
              <el-table-column prop="entryPage" label="入口页" width="110"></el-table-column>
              <el-table-column prop="browseUv" label="浏览会员" width="100"></el-table-column>
              <el-table-column prop="cartUv" label="加购会员" width="100"></el-table-column>
              <el-table-column prop="orderUv" label="下单会员" width="100"></el-table-column>
              <el-table-column prop="payUv" label="支付会员" width="100"></el-table-column>
              <el-table-column prop="convViewToCart" label="浏览→加购%" width="120"></el-table-column>
              <el-table-column prop="convCartToOrder" label="加购→下单%" width="120"></el-table-column>
              <el-table-column prop="convOrderToPay" label="下单→支付%" width="120"></el-table-column>
              <el-table-column prop="browseCnt" label="浏览量" width="100"></el-table-column>
              <el-table-column prop="searchCnt" label="搜索量" width="100"></el-table-column>
              <el-table-column prop="favoriteCnt" label="收藏量" width="100"></el-table-column>
              <el-table-column prop="cartCnt" label="加购量" width="100"></el-table-column>
            </el-table>
          </template>
        </el-card>
      </el-tab-pane>

      <!-- ② 浏览 / 收藏 / 搜索 -->
      <el-tab-pane name="browse" lazy>
        <span slot="label"><i class="el-icon-view"></i> 浏览 · 收藏 · 搜索</span>
        <AnalysisBehavior v-if="tab === 'browse'" />
      </el-tab-pane>

      <!-- ③ 时段活跃 / 会员画像 已抽出为独立板块：
           「时段分析」跨行为/订单/咨询三个模块，放在这里等于同一份数据看三遍；
           「用户画像」与地域分布同类。都移到侧边栏独立页，避免强行塞进模块。 -->
    </el-tabs>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getFunnel } from '@/api/pms_analysis.js'
import AnalysisBehavior from './AnalysisBehavior.vue'

export default {
  components: { AnalysisBehavior },
  data() {
    return { rows: [], empty: false, tab: 'funnel' }
  },
  computed: {
    latest() {
      if (!this.rows.length) return []
      const maxDate = this.rows.map(x => x.statDate).sort().reverse()[0]
      return this.rows.filter(x => x.statDate === maxDate)
    },
    cards() {
      const t = this.latest.reduce((a, b) => ({
        browseUv: a.browseUv + (Number(b.browseUv) || 0),
        cartUv: a.cartUv + (Number(b.cartUv) || 0),
        orderUv: a.orderUv + (Number(b.orderUv) || 0),
        payUv: a.payUv + (Number(b.payUv) || 0)
      }), { browseUv: 0, cartUv: 0, orderUv: 0, payUv: 0 })
      return [
        { label: '浏览会员', value: t.browseUv },
        { label: '加购会员', value: t.cartUv },
        { label: '下单会员', value: t.orderUv },
        { label: '支付会员', value: t.payUv },
        { label: '浏览→加购', value: (t.browseUv ? (t.cartUv * 100 / t.browseUv).toFixed(1) : 0) + '%' },
        { label: '下单→支付', value: (t.orderUv ? (t.payUv * 100 / t.orderUv).toFixed(1) : 0) + '%' }
      ]
    },
    // 需求②：月度行为趋势（按月份汇总四类行为量）
    trendRows() {
      const m = {}
      this.rows.forEach(x => {
        const k = x.statDate
        m[k] = m[k] || { browse: 0, search: 0, favorite: 0, cart: 0 }
        m[k].browse += Number(x.browseCnt) || 0
        m[k].search += Number(x.searchCnt) || 0
        m[k].favorite += Number(x.favoriteCnt) || 0
        m[k].cart += Number(x.cartCnt) || 0
      })
      return Object.keys(m).sort().map(k => Object.assign({ statDate: k }, m[k]))
    }
  },
  mounted() {
    getFunnel().then(r => {
      this.rows = ((r.data || {}).rows) || []
      this.empty = this.rows.length === 0
      if (!this.empty) this.$nextTick(() => this.draw())
    }).catch(() => { this.empty = true })
  },
  methods: {
    box(id) {
      const el = document.getElementById(id)
      return el ? echarts.init(el) : null
    },
    draw() {
      const l = this.latest
      const sum = k => l.reduce((a, b) => a + (Number(b[k]) || 0), 0)

      // 需求④：转化漏斗
      const f = this.box('funnelChart')
      if (f) {
        f.setOption({
          tooltip: { trigger: 'item' },
          series: [{
            type: 'funnel', left: '10%', width: '80%', minSize: '22%',
            label: { formatter: p => p.name + ': ' + p.value + ' 人' },
            data: [
              { name: '浏览会员', value: sum('browseUv') },
              { name: '加购会员', value: sum('cartUv') },
              { name: '下单会员', value: sum('orderUv') },
              { name: '支付会员', value: sum('payUv') }
            ]
          }]
        }, true)
      }

      // 需求①：各入口访问会员占比（饼图）
      const ep = this.box('entryPieChart')
      if (ep) {
        const show = l.filter(x => Number(x.browseUv) > 0)
        ep.setOption({
          tooltip: { trigger: 'item', formatter: '{b}: {c} 人 ({d}%)' },
          legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
          series: [{
            type: 'pie', radius: ['42%', '68%'], center: ['36%', '50%'],
            label: { formatter: '{b}\n{d}%', fontSize: 11 },
            data: show.map(x => ({ name: x.entryPage, value: Number(x.browseUv) || 0 }))
          }]
        }, true)
      }

      // 需求①：各入口转化率对比（柱状）
      const cv = this.box('convChart')
      if (cv) {
        const show = l.filter(x => Number(x.browseUv) > 0)
        cv.setOption({
          tooltip: { trigger: 'axis', valueFormatter: v => v + '%' },
          legend: { data: ['浏览→加购', '加购→下单', '下单→支付'] },
          grid: { left: 60, right: 30, top: 40, bottom: 60 },
          xAxis: { type: 'category', data: show.map(x => x.entryPage), axisLabel: { rotate: 20 } },
          yAxis: { type: 'value', name: '转化率%' },
          series: [
            { name: '浏览→加购', type: 'bar', barMaxWidth: 22, data: show.map(x => Number(x.convViewToCart) || 0) },
            { name: '加购→下单', type: 'bar', barMaxWidth: 22, data: show.map(x => Number(x.convCartToOrder) || 0) },
            { name: '下单→支付', type: 'bar', barMaxWidth: 22, data: show.map(x => Number(x.convOrderToPay) || 0) }
          ]
        }, true)
      }

      // 需求②：行为趋势折线
      const bt = this.box('behaviorTrendChart')
      if (bt) {
        const t = this.trendRows
        bt.setOption({
          tooltip: { trigger: 'axis' },
          legend: { data: ['浏览量', '搜索量', '收藏量', '加购量'] },
          grid: { left: 70, right: 30, top: 40, bottom: 60 },
          xAxis: { type: 'category', data: t.map(x => x.statDate), axisLabel: { rotate: 30 } },
          yAxis: { type: 'value', name: '行为次数' },
          series: [
            { name: '浏览量', type: 'line', smooth: true, data: t.map(x => x.browse), itemStyle: { color: '#409EFF' } },
            { name: '搜索量', type: 'line', smooth: true, data: t.map(x => x.search), itemStyle: { color: '#E6A23C' } },
            { name: '收藏量', type: 'line', smooth: true, data: t.map(x => x.favorite), itemStyle: { color: '#909399' } },
            { name: '加购量', type: 'line', smooth: true, data: t.map(x => x.cart), itemStyle: { color: '#67C23A' } }
          ]
        }, true)
      }
    }
  }
}
</script>

<style scoped>
.mod-head { margin-bottom: 12px; }
.mod-title { font-size: 16px; font-weight: 600; color: #303133; }
.mod-sub { display: block; margin-top: 6px; color: #909399; font-size: 12px; }
.src { float: right; color: #909399; font-size: 12px; }
.chart-title { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.chart-box { height: 280px; }
.stat { background: #f5f7fa; border-radius: 8px; padding: 12px 8px; text-align: center; }
.stat-num { font-size: 20px; font-weight: 500; color: #303133; }
.stat-label { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
