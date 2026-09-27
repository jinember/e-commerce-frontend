<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <div slot="header">
        <span style="font-weight:600">订单流失分析</span>
        <span style="margin-left:12px;color:#909399;font-size:12px">
          对应需求：「未支付流失率、超时取消占比、流失订单金额」「客单价分布直方图」
        </span>
      </div>
      <el-row :gutter="12">
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">流失订单数</div><div class="kpi-value">{{ fmt(summary.orderCnt) }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">流失金额</div><div class="kpi-value">¥{{ fmt2(summary.amount) }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">流失率</div><div class="kpi-value" style="color:#F56C6C">{{ summary.pct }}%</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">口径说明</div><div class="kpi-value" style="font-size:13px;font-weight:400">状态 0 待支付 / 6 已取消</div></div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="12">
      <el-col :span="10">
        <el-card shadow="never">
          <div slot="header"><span style="font-weight:600">流失原因构成</span></div>
          <div v-if="!lossRows.length" style="padding:30px;text-align:center;color:#909399">等待 ETL 产出</div>
          <div v-show="lossRows.length" id="lossPie" style="height:300px"></div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never">
          <div slot="header"><span style="font-weight:600">客单价分布（成交订单）</span></div>
          <div v-if="!priceRows.length" style="padding:30px;text-align:center;color:#909399">等待 ETL 产出</div>
          <div v-show="priceRows.length" id="priceBar" style="height:300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getOrderLoss } from '@/api/pms_analysis'
import * as echarts from 'echarts'

export default {
  name: 'AnalysisOrderLoss',
  data() {
    return { rows: [] }
  },
  computed: {
    summary() {
      const r = this.rows.filter(x => x.statType === 'summary')[0]
      return r || { orderCnt: 0, amount: 0, pct: 0 }
    },
    lossRows() { return this.rows.filter(x => x.statType === 'loss_reason') },
    priceRows() { return this.rows.filter(x => x.statType === 'price_range') }
  },
  created() { this.load() },
  methods: {
    fmt(n) { return Number(n || 0).toLocaleString('zh-CN') },
    fmt2(n) { return Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
    load() {
      getOrderLoss().then(res => {
        const d = res && res.data ? res.data : {}
        this.rows = (d && d.rows) || []
        this.$nextTick(() => { this.drawPie(); this.drawPrice() })
      }).catch(() => { this.rows = [] })
    },
    drawPie() {
      if (!this.lossRows.length) return
      const el = document.getElementById('lossPie')
      if (!el) return
      echarts.init(el).setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} 单 ({d}%)' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie', radius: ['40%', '65%'],
          data: this.lossRows.map(x => ({ name: x.dimValue, value: Number(x.orderCnt || 0) })),
          label: { formatter: '{b}\n{d}%' }
        }]
      }, true)
    },
    drawPrice() {
      if (!this.priceRows.length) return
      const el = document.getElementById('priceBar')
      if (!el) return
      // 按价格带排序，保证直方图从左到右递增
      const order = ['0-100', '100-500', '500-1000', '1000-3000', '3000-5000', '5000+']
      const rows = this.priceRows.slice().sort(
        (a, b) => order.indexOf(a.dimValue) - order.indexOf(b.dimValue)
      )
      echarts.init(el).setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 60, right: 40, top: 30, bottom: 40 },
        xAxis: { type: 'category', data: rows.map(x => x.dimValue), name: '客单价区间' },
        yAxis: { type: 'value', name: '订单数' },
        series: [{
          type: 'bar',
          data: rows.map(x => Number(x.orderCnt || 0)),
          barMaxWidth: 50,
          itemStyle: { color: '#409EFF' },
          label: { show: true, position: 'top' }
        }]
      }, true)
    }
  }
}
</script>

<style scoped>
.kpi { padding: 14px; background: #f8f9fb; border-radius: 4px; text-align: center; }
.kpi-label { font-size: 12px; color: #909399; margin-bottom: 6px; }
.kpi-value { font-size: 22px; font-weight: 600; color: #303133; }
</style>
