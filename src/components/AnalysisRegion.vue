<template>
  <div class="app-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span><i class="el-icon-data-line"></i> 地域分布（扩展分析）</span>
        <span class="src">数据来源：ads_region_dist（离线 ETL 产出）</span>
      </div>

      <el-alert v-if="empty" type="info" :closable="false" show-icon
                title="等待 ETL 产出" description="结果表 ads_region_dist 暂无数据，请先执行离线分析任务并回写该表。"></el-alert>

      <template v-else>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-title">会员城市分布 TOP15</div>
            <div id="memberChart" class="chart-box"></div>
          </el-col>
          <el-col :span="12">
            <div class="chart-title">销售城市分布 TOP15（订单数）</div>
            <div id="orderChart" class="chart-box"></div>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top:18px;">
          <el-col :span="24">
            <div class="chart-title">销售城市成交额 TOP15</div>
            <div id="gmvChart" class="chart-box"></div>
          </el-col>
        </el-row>
      </template>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getRegion } from '@/api/pms_analysis.js'

export default {
  data() {
    return { rows: [], empty: false }
  },
  mounted() {
    getRegion().then(r => {
      this.rows = ((r.data || {}).rows) || []
      this.empty = this.rows.length === 0
      if (!this.empty) this.$nextTick(() => this.draw())
    }).catch(() => { this.empty = true })
  },
  methods: {
    hbar(id, data, field) {
      const top = data.slice(0, 15)
      const c = echarts.init(document.getElementById(id))
      c.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 70, right: 30, top: 10, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: top.map(x => x.city).reverse() },
        series: [{ type: 'bar', data: top.map(x => Number(x[field]) || 0).reverse(), barMaxWidth: 16 }]
      })
    },
    draw() {
      const members = this.rows.filter(x => x.scope === 'member').sort((a, b) => (Number(b.memberCnt) || 0) - (Number(a.memberCnt) || 0))
      const orders = this.rows.filter(x => x.scope === 'order').sort((a, b) => (Number(b.orderCnt) || 0) - (Number(a.orderCnt) || 0))
      this.hbar('memberChart', members, 'memberCnt')
      this.hbar('orderChart', orders, 'orderCnt')
      const gmvTop = orders.slice().sort((a, b) => (Number(b.gmv) || 0) - (Number(a.gmv) || 0))
      this.hbar('gmvChart', gmvTop, 'gmv')
    }
  }
}
</script>

<style scoped>
.src { float: right; color: #909399; font-size: 12px; }
.chart-title { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.chart-box { height: 320px; }
</style>
