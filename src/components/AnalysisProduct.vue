<template>
  <div class="app-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span><i class="el-icon-data-line"></i> 商品与品类销售结构</span>
        <span class="src">数据来源：ads_product_analysis（离线 ETL 产出）</span>
      </div>

      <el-alert v-if="empty" type="info" :closable="false" show-icon
                title="等待 ETL 产出" description="结果表 ads_product_analysis 暂无数据，请先执行离线分析任务并回写该表。"></el-alert>

      <template v-else>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-title">品类销量 TOP10</div>
            <div id="prodCatChart" class="chart-box"></div>
          </el-col>
          <el-col :span="12">
            <div class="chart-title">品牌销量 TOP10</div>
            <div id="brandChart" class="chart-box"></div>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top:18px;">
          <el-col :span="12">
            <div class="chart-title">价格带 SKU 分布</div>
            <div id="priceChart" class="chart-box"></div>
          </el-col>
          <el-col :span="12">
            <div class="chart-title">品类成交额 TOP10</div>
            <div id="catGmvChart" class="chart-box"></div>
          </el-col>
        </el-row>
      </template>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getProductAnalysis } from '@/api/pms_analysis.js'

export default {
  data() {
    return { rows: [], empty: false }
  },
  mounted() {
    getProductAnalysis().then(r => {
      this.rows = ((r.data || {}).rows) || []
      this.empty = this.rows.length === 0
      if (!this.empty) this.$nextTick(() => this.draw())
    }).catch(() => { this.empty = true })
  },
  methods: {
    bar(id, data, field, topN) {
      const top = data.slice(0, topN)
      // ⚠️ 成交额是千万级（如 30,000,000），若 Y 轴不缩单位，刻度标签会长过 grid.left，
      //    前面的数字被直接裁掉（2026-09-22 用户反馈「纵坐标看不全」）
      const isMoney = field === 'gmv'
      const axisFmt = v => {
        if (!isMoney) return v
        const n = Number(v) || 0
        if (n >= 100000000) return (n / 100000000).toFixed(2) + ' 亿'
        if (n >= 10000) return (n / 10000).toFixed(0) + ' 万'
        return String(n)
      }
      const opt = {
        tooltip: { trigger: 'axis' },
        grid: { left: isMoney ? 74 : 70, right: 30, top: 30, bottom: 50 },
        xAxis: { type: 'category', data: top.map(x => x.name), axisLabel: { rotate: 25 } },
        yAxis: { type: 'value', axisLabel: { formatter: axisFmt } },
        series: [{ type: 'bar', data: top.map(x => Number(x[field]) || 0), barMaxWidth: 32 }]
      }
      if (isMoney) {
        // Y 轴缩了单位，tooltip 仍给完整金额，避免读数失真
        opt.tooltip.formatter = p => p[0].name + '<br/>成交额：¥' +
          Number(p[0].value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      }
      echarts.init(document.getElementById(id)).setOption(opt)
    },
    draw() {
      const cats = this.rows.filter(x => x.ptype === 'category').sort((a, b) => (Number(b.saleCnt) || 0) - (Number(a.saleCnt) || 0))
      const brands = this.rows.filter(x => x.ptype === 'brand').sort((a, b) => (Number(b.saleCnt) || 0) - (Number(a.saleCnt) || 0))
      // 价格带按金额升序排列（否则 X 轴顺序跟着数据返回顺序走，看着是乱的：
      //   曾出现「100-500 / 3000+ / 0-100 / 1000-3000」这种错序）
      const priceNum = s => { const m = String(s).match(/\d+/); return m ? Number(m[0]) : 0 }
      const prices = this.rows.filter(x => x.ptype === 'price')
                               .sort((a, b) => priceNum(a.name) - priceNum(b.name))
      const catGmv = this.rows.filter(x => x.ptype === 'category').sort((a, b) => (Number(b.gmv) || 0) - (Number(a.gmv) || 0))

      this.bar('prodCatChart', cats, 'saleCnt', 10)
      this.bar('brandChart', brands, 'saleCnt', 10)
      this.bar('catGmvChart', catGmv, 'gmv', 10)

      const pc = echarts.init(document.getElementById('priceChart'))
      pc.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 70, right: 30, top: 30, bottom: 40 },
        xAxis: { type: 'category', data: prices.map(x => x.name) },
        yAxis: { type: 'value', name: 'SKU 数' },
        series: [{ type: 'bar', data: prices.map(x => Number(x.skuCnt) || 0), barMaxWidth: 40 }]
      })
    }
  }
}
</script>

<style scoped>
.src { float: right; color: #909399; font-size: 12px; }
.chart-title { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.chart-box { height: 300px; }
</style>
