<template>
  <div class="app-container">
    <div class="mod-head">
      <span class="mod-title"><i class="el-icon-service"></i> 模块四 · 用户与商家交流数据分析</span>
      <span class="mod-sub">数据来源：ads_chat_analysis / ads_chat_quality（Hive 离线 ETL 产出）；时段见独立板块</span>
    </div>

    <el-tabs v-model="tab" type="border-card">
      <!-- ① 会话与工单总览 -->
      <el-tab-pane name="overview">
        <span slot="label"><i class="el-icon-data-line"></i> 会话与工单</span>
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span><i class="el-icon-data-line"></i> 咨询转化与工单状态</span>
            <span class="src">数据来源：ads_chat_analysis</span>
          </div>

          <el-alert v-if="empty" type="info" :closable="false" show-icon
                    title="等待 ETL 产出" description="结果表 ads_chat_analysis 暂无数据，请先执行离线分析任务并回写该表。"></el-alert>

          <template v-else>
            <el-row :gutter="20">
              <el-col :span="14">
                <div class="chart-title">各咨询类型的会话量与转化率</div>
                <div id="typeChart" class="chart-box"></div>
              </el-col>
              <el-col :span="10">
                <div class="chart-title">工单状态分布</div>
                <div id="ticketChart" class="chart-box"></div>
              </el-col>
            </el-row>

            <div class="chart-title" style="margin-top:18px;">服务效率明细</div>
            <el-table :data="rows" border size="small" max-height="320">
              <el-table-column prop="statDate" label="日期" width="110"></el-table-column>
              <el-table-column prop="metricScope" label="维度" width="100"></el-table-column>
              <el-table-column prop="dimValue" label="取值" width="140"></el-table-column>
              <el-table-column prop="sessionCnt" label="会话/工单数" width="120"></el-table-column>
              <el-table-column prop="convertedCnt" label="已转化" width="90"></el-table-column>
              <el-table-column prop="convertRate" label="转化率%" width="100"></el-table-column>
              <el-table-column prop="avgFirstResponseSec" label="平均首响(秒)" width="130"></el-table-column>
              <el-table-column prop="avgDurationSec" label="平均时长(秒)" width="130"></el-table-column>
              <el-table-column prop="avgMsgCnt" label="平均对话条数" width="130"></el-table-column>
            </el-table>
          </template>
        </el-card>
      </el-tab-pane>

      <!-- ② 客服服务质量 -->
      <el-tab-pane name="quality" lazy>
        <span slot="label"><i class="el-icon-phone-outline"></i> 客服服务质量</span>
        <AnalysisChatQuality v-if="tab === 'quality'" />
      </el-tab-pane>

      <!-- ③ 咨询时段已抽出为独立板块「时段分析」（跨行为/订单/咨询三个模块共用同一份数据） -->
    </el-tabs>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getChatAnalysis } from '@/api/pms_analysis.js'
import AnalysisChatQuality from './AnalysisChatQuality.vue'

export default {
  components: { AnalysisChatQuality },
  data() {
    return { rows: [], empty: false, tab: 'overview' }
  },
  computed: {
    sessRows() { return this.rows.filter(x => x.metricScope === 'session') },
    ticketRows() { return this.rows.filter(x => x.metricScope === 'ticket') }
  },
  mounted() {
    getChatAnalysis().then(r => {
      this.rows = ((r.data || {}).rows) || []
      this.empty = this.rows.length === 0
      if (!this.empty) this.$nextTick(() => this.draw())
    }).catch(() => { this.empty = true })
  },
  methods: {
    draw() {
      const tc = echarts.init(document.getElementById('typeChart'))
      tc.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['会话量', '转化率%'] },
        grid: { left: 60, right: 60, top: 40, bottom: 60 },
        xAxis: { type: 'category', data: this.sessRows.map(x => x.dimValue), axisLabel: { rotate: 20 } },
        yAxis: [{ type: 'value', name: '会话量' }, { type: 'value', name: '转化率%' }],
        series: [
          { name: '会话量', type: 'bar', data: this.sessRows.map(x => Number(x.sessionCnt) || 0) },
          { name: '转化率%', type: 'line', yAxisIndex: 1, data: this.sessRows.map(x => Number(x.convertRate) || 0) }
        ]
      })

      const tt = echarts.init(document.getElementById('ticketChart'))
      // 工单状态分布：表粒度是 月×状态，同一状态有几十个月份行，
      // 必须先按状态跨月求和再画饼，否则同一状态会裂成几十个扇区（实测踩坑）
      const stAgg = {}
      this.ticketRows.forEach(x => {
        stAgg[x.dimValue] = (stAgg[x.dimValue] || 0) + (Number(x.sessionCnt) || 0)
      })
      tt.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 10, top: 'center' },
        series: [{
          type: 'pie', radius: ['40%', '65%'],
          label: { show: true, formatter: '{b}\n{d}%' },
          data: Object.keys(stAgg).map(k => ({ name: k, value: stAgg[k] }))
        }]
      })
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
</style>
