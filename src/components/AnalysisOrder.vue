<template>
  <div class="app-container">
    <div class="mod-head">
      <span class="mod-title"><i class="el-icon-shopping-cart-2"></i> 模块二 · 用户订单数据分析</span>
      <span class="mod-sub">数据来源：ads_order_analysis / ads_order_loss / ads_product_analysis（Hive 离线 ETL 产出）；时段见独立板块</span>
    </div>

    <el-tabs v-model="tab" type="border-card">
      <!-- ① 成交与退换货总览 -->
      <el-tab-pane name="overview">
        <span slot="label"><i class="el-icon-data-line"></i> 成交与退换货</span>
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span><i class="el-icon-data-line"></i> 销售数据总览与退换货分析</span>
            <span class="src">数据来源：ads_order_analysis</span>
          </div>

          <el-alert v-if="empty" type="info" :closable="false" show-icon
                    title="等待 ETL 产出" description="结果表 ads_order_analysis 暂无数据，请先执行离线分析任务并回写该表。"></el-alert>

          <template v-else>
            <!-- 需求①销售数据总览：核心指标卡片 -->
            <el-row :gutter="14">
              <el-col :span="4">
                <div class="stat"><div class="stat-num">{{ fmt(kpi.orderCnt) }}</div><div class="stat-label">订单总数</div></div>
              </el-col>
              <el-col :span="4">
                <div class="stat"><div class="stat-num">{{ fmt(kpi.payCnt) }}</div><div class="stat-label">成交订单数</div></div>
              </el-col>
              <el-col :span="5">
                <div class="stat"><div class="stat-num c-red">{{ money(kpi.gmv) }}</div><div class="stat-label">成交金额（元）</div></div>
              </el-col>
              <el-col :span="4">
                <div class="stat"><div class="stat-num">{{ money(kpi.avgOrderAmount) }}</div><div class="stat-label">客单价（元）</div></div>
              </el-col>
              <el-col :span="4">
                <div class="stat"><div class="stat-num c-good">{{ kpi.payRate }}%</div><div class="stat-label">支付转化率</div></div>
              </el-col>
              <el-col :span="3">
                <div class="stat"><div class="stat-num c-warn">{{ kpi.refundRate }}%</div><div class="stat-label">退换货率</div></div>
              </el-col>
            </el-row>

            <!-- 需求②销售趋势图（折线/柱状） -->
            <el-row :gutter="20" style="margin-top:18px;">
              <el-col :span="14">
                <div class="chart-title">成交额与订单量趋势（月度）</div>
                <div id="trendChart" class="chart-box"></div>
              </el-col>
              <!-- 需求③销售结构饼图 -->
              <el-col :span="10">
                <div class="chart-title">各品类成交额占比</div>
                <div id="catPieChart" class="chart-box"></div>
              </el-col>
            </el-row>

            <!-- 需求③品类成交额 TOP10 + 需求④各品类退换货率 -->
            <el-row :gutter="20" style="margin-top:18px;">
              <el-col :span="12">
                <div class="chart-title">品类成交额 TOP10</div>
                <div id="catChart" class="chart-box" style="height:280px;"></div>
              </el-col>
              <el-col :span="12">
                <div class="chart-title">各品类退换货率</div>
                <div id="catRefundChart" class="chart-box" style="height:280px;"></div>
              </el-col>
            </el-row>

            <!-- 需求④退换货时效波动 -->
            <div class="chart-title" style="margin-top:18px;">退款率与退款处理时长趋势</div>
            <div id="refundChart" class="chart-box" style="height:260px;"></div>

            <div class="chart-title" style="margin-top:18px;">订单明细（月 × 品类）</div>
            <el-table :data="rows" border size="small" max-height="320">
              <el-table-column prop="statDate" label="日期" width="110"></el-table-column>
              <el-table-column prop="categoryName" label="品类" width="140"></el-table-column>
              <el-table-column prop="orderCnt" label="下单量" width="90"></el-table-column>
              <el-table-column prop="payCnt" label="支付量" width="90"></el-table-column>
              <el-table-column prop="refundCnt" label="退款量" width="90"></el-table-column>
              <el-table-column prop="gmv" label="成交额" min-width="120"></el-table-column>
              <el-table-column prop="avgOrderAmount" label="客单价" width="110"></el-table-column>
              <el-table-column prop="refundRate" label="退款率%" width="100"></el-table-column>
              <el-table-column prop="refundAvgHours" label="退款处理(小时)" width="130"></el-table-column>
            </el-table>
          </template>
        </el-card>
      </el-tab-pane>

      <!-- ② 订单流失与客单价分布 -->
      <el-tab-pane name="loss" lazy>
        <span slot="label"><i class="el-icon-warning-outline"></i> 订单流失 · 客单价</span>
        <AnalysisOrderLoss v-if="tab === 'loss'" />
      </el-tab-pane>

      <!-- ③ 时段销售已抽出为独立板块「时段分析」（跨行为/订单/咨询三个模块共用同一份数据） -->

      <!-- ④ 商品与品类销售结构 -->
      <el-tab-pane name="product" lazy>
        <span slot="label"><i class="el-icon-goods"></i> 商品 · 品类结构</span>
        <AnalysisProduct v-if="tab === 'product'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getOrderAnalysis } from '@/api/pms_analysis.js'
import AnalysisOrderLoss from './AnalysisOrderLoss.vue'
import AnalysisProduct from './AnalysisProduct.vue'

export default {
  components: { AnalysisOrderLoss, AnalysisProduct },
  data() {
    return { rows: [], empty: false, tab: 'overview' }
  },
  computed: {
    // 月度汇总行（category_id 为空）
    totalRows() {
      return this.rows.filter(x => !x.categoryId).sort((a, b) => (a.statDate > b.statDate ? 1 : -1))
    },
    // 需求①：核心指标
    kpi() {
      const t = this.totalRows.reduce((a, b) => ({
        orderCnt: a.orderCnt + (Number(b.orderCnt) || 0),
        payCnt: a.payCnt + (Number(b.payCnt) || 0),
        refundCnt: a.refundCnt + (Number(b.refundCnt) || 0),
        gmv: a.gmv + (Number(b.gmv) || 0)
      }), { orderCnt: 0, payCnt: 0, refundCnt: 0, gmv: 0 })
      return {
        orderCnt: t.orderCnt,
        payCnt: t.payCnt,
        refundCnt: t.refundCnt,
        gmv: t.gmv,
        avgOrderAmount: t.payCnt ? t.gmv / t.payCnt : 0,
        payRate: t.orderCnt ? (t.payCnt * 100 / t.orderCnt).toFixed(2) : '-',
        refundRate: t.payCnt ? (t.refundCnt * 100 / t.payCnt).toFixed(2) : '-'
      }
    },
    // 跨月按品类聚合（原始表是 月×品类，直接排序会全是同一品类的不同月份）
    catAgg() {
      const m = {}
      this.rows.filter(x => x.categoryId).forEach(x => {
        const k = x.categoryName
        m[k] = m[k] || { gmv: 0, orderCnt: 0, payCnt: 0, refundCnt: 0 }
        m[k].gmv += Number(x.gmv) || 0
        m[k].orderCnt += Number(x.orderCnt) || 0
        m[k].payCnt += Number(x.payCnt) || 0
        m[k].refundCnt += Number(x.refundCnt) || 0
      })
      return Object.keys(m).map(k => ({
        name: k,
        gmv: Math.round(m[k].gmv * 100) / 100,
        orderCnt: m[k].orderCnt,
        refundRate: m[k].payCnt ? Number((m[k].refundCnt * 100 / m[k].payCnt).toFixed(2)) : 0
      })).sort((a, b) => b.gmv - a.gmv)
    }
  },
  mounted() {
    getOrderAnalysis().then(r => {
      this.rows = ((r.data || {}).rows) || []
      this.empty = this.rows.length === 0
      if (!this.empty) this.$nextTick(() => this.draw())
    }).catch(() => { this.empty = true })
  },
  methods: {
    fmt(n) { return Number(n || 0).toLocaleString('zh-CN') },
    money(n) {
      return Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    box(id) {
      const el = document.getElementById(id)
      return el ? echarts.init(el) : null
    },
    // Y 轴金额缩单位：成交额是千万级（30,000,000），不缩单位刻度标签会比 grid.left
    // 还长 → 前面的数字被直接裁掉（2026-09-22 用户反馈「纵坐标看不全」）
    moneyAxis(v) {
      const n = Number(v) || 0
      if (n >= 100000000) return (n / 100000000).toFixed(2) + ' 亿'
      if (n >= 10000) return (n / 10000).toFixed(0) + ' 万'
      return String(n)
    },
    draw() {
      const totalRows = this.totalRows

      // 需求②：销售趋势（成交额 + 订单量）
      const t = this.box('trendChart')
      if (t) {
        t.setOption({
          tooltip: { trigger: 'axis' },
          legend: { data: ['成交额', '订单量'] },
          grid: { left: 70, right: 50, top: 40, bottom: 50 },
          xAxis: { type: 'category', data: totalRows.map(x => x.statDate), axisLabel: { rotate: 30 } },
          yAxis: [
            { type: 'value', name: '成交额', axisLabel: { formatter: v => this.moneyAxis(v) } },
            { type: 'value', name: '订单量' }
          ],
          series: [
            { name: '成交额', type: 'line', smooth: true, data: totalRows.map(x => Number(x.gmv) || 0), itemStyle: { color: '#409EFF' } },
            { name: '订单量', type: 'bar', yAxisIndex: 1, data: totalRows.map(x => Number(x.orderCnt) || 0), itemStyle: { color: '#67C23A' } }
          ]
        }, true)
      }

      const all = this.catAgg

      // 需求③：各品类成交额占比（饼图）
      const cp = this.box('catPieChart')
      if (cp) {
        const top = all.slice(0, 8)
        const rest = all.slice(8).reduce((s, x) => s + x.gmv, 0)
        const data = top.map(x => ({ name: x.name, value: x.gmv }))
        if (rest > 0) data.push({ name: '其他', value: Math.round(rest * 100) / 100 })
        cp.setOption({
          tooltip: { trigger: 'item', formatter: p => p.name + ': ' + Number(p.value).toLocaleString('zh-CN') + ' (' + p.percent + '%)' },
          legend: { orient: 'vertical', right: 6, top: 'center', textStyle: { fontSize: 11 } },
          series: [{
            type: 'pie', radius: ['42%', '68%'], center: ['36%', '50%'],
            label: { formatter: '{b}\n{d}%', fontSize: 11 },
            data: data
          }]
        }, true)
      }

      // 需求③：品类成交额 TOP10
      const cc = this.box('catChart')
      if (cc) {
        const top = all.slice(0, 10)
        cc.setOption({
          tooltip: { trigger: 'axis' },
          grid: { left: 80, right: 30, top: 20, bottom: 70 },
          xAxis: { type: 'category', data: top.map(x => x.name), axisLabel: { rotate: 30 } },
          yAxis: { type: 'value', name: '成交额', axisLabel: { formatter: v => this.moneyAxis(v) } },
          series: [{ type: 'bar', barMaxWidth: 30, data: top.map(x => x.gmv), itemStyle: { color: '#409EFF' } }]
        }, true)
      }

      // 需求④：各品类退换货率
      const cr = this.box('catRefundChart')
      if (cr) {
        const top = all.slice(0, 10)
        cr.setOption({
          tooltip: { trigger: 'axis', valueFormatter: v => v + '%' },
          grid: { left: 60, right: 30, top: 20, bottom: 70 },
          xAxis: { type: 'category', data: top.map(x => x.name), axisLabel: { rotate: 30 } },
          yAxis: { type: 'value', name: '退换货率%' },
          series: [{
            type: 'bar', barMaxWidth: 30,
            data: top.map(x => x.refundRate),
            itemStyle: { color: '#F56C6C' },
            label: { show: true, position: 'top', formatter: '{c}%', fontSize: 10 }
          }]
        }, true)
      }

      // 需求④：退换货时效波动
      const rc = this.box('refundChart')
      if (rc) {
        rc.setOption({
          tooltip: { trigger: 'axis' },
          legend: { data: ['退款率%', '退款处理时长(小时)'] },
          grid: { left: 70, right: 50, top: 40, bottom: 50 },
          xAxis: { type: 'category', data: totalRows.map(x => x.statDate), axisLabel: { rotate: 30 } },
          yAxis: [{ type: 'value', name: '退款率%' }, { type: 'value', name: '小时' }],
          series: [
            { name: '退款率%', type: 'line', data: totalRows.map(x => Number(x.refundRate) || 0), itemStyle: { color: '#F56C6C' } },
            { name: '退款处理时长(小时)', type: 'line', yAxisIndex: 1, data: totalRows.map(x => Number(x.refundAvgHours) || 0), itemStyle: { color: '#E6A23C' } }
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
.chart-box { height: 300px; }
.stat { background: #f5f7fa; border-radius: 8px; padding: 12px 6px; text-align: center; }
.stat-num { font-size: 18px; font-weight: 600; color: #303133; }
.stat-num.c-red { color: #F56C6C; }
.stat-num.c-good { color: #67C23A; }
.stat-num.c-warn { color: #E6A23C; }
.stat-label { font-size: 12px; color: #909399; margin-top: 6px; }
</style>
