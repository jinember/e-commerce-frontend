<template>
  <div class="app-container">
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span><i class="el-icon-data-line"></i> 会员画像与用户分层</span>
        <span class="src">数据来源：ads_member_profile（离线 ETL 产出）</span>
      </div>

      <el-alert v-if="empty" type="info" :closable="false" show-icon
                title="等待 ETL 产出" description="结果表 ads_member_profile 暂无数据，请先执行离线分析任务并回写该表。"></el-alert>

      <template v-else>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="chart-title">性别分布</div>
            <div id="genderChart" class="chart-box"></div>
          </el-col>
          <el-col :span="8">
            <div class="chart-title">年龄段分布</div>
            <div id="ageChart" class="chart-box"></div>
          </el-col>
          <el-col :span="8">
            <div class="chart-title">会员等级分布</div>
            <div id="levelChart" class="chart-box"></div>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top:18px;">
          <el-col :span="12">
            <div class="chart-title">获客渠道分布</div>
            <div id="channelChart" class="chart-box"></div>
          </el-col>
          <el-col :span="12">
            <div class="chart-title">会员价值分层</div>
            <div id="valueChart" class="chart-box"></div>
          </el-col>
        </el-row>
      </template>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getMemberProfile } from '@/api/pms_analysis.js'

export default {
  data() {
    return { rows: [], empty: false }
  },
  computed: {
    byType() {
      const m = {}
      this.rows.forEach(x => { (m[x.dimType] = m[x.dimType] || []).push(x) })
      return m
    }
  },
  mounted() {
    getMemberProfile().then(r => {
      this.rows = ((r.data || {}).rows) || []
      this.empty = this.rows.length === 0
      if (!this.empty) this.$nextTick(() => this.draw())
    }).catch(() => { this.empty = true })
  },
  methods: {
    pie(id, data, name) {
      const c = echarts.init(document.getElementById(id))
      c.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'center' },
        series: [{
          name, type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
          label: { show: true, formatter: '{b}\n{d}%' },
          data: data.map(x => ({ name: x.dimValue, value: Number(x.memberCnt) || 0 }))
        }]
      })
    },
    bar(id, data) {
      const c = echarts.init(document.getElementById(id))
      c.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 70, right: 30, top: 30, bottom: 50 },
        xAxis: { type: 'category', data: data.map(x => x.dimValue), axisLabel: { rotate: 20 } },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: data.map(x => Number(x.memberCnt) || 0), barMaxWidth: 40 }]
      })
    },
    draw() {
      this.pie('genderChart', this.byType.gender || [], '性别')
      this.pie('ageChart', this.byType.age_band || [], '年龄段')
      this.pie('levelChart', this.byType.level || [], '等级')
      this.bar('channelChart', this.byType.channel || [])
      this.pie('valueChart', this.byType.value || [], '价值')
    }
  }
}
</script>

<style scoped>
.src { float: right; color: #909399; font-size: 12px; }
.chart-title { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.chart-box { height: 300px; }
</style>
