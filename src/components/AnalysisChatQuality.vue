<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <div slot="header">
        <span style="font-weight:600">客服服务质量总览</span>
        <span style="margin-left:12px;color:#909399;font-size:12px">
          对应需求：「有效会话数、平均首次响应时长、会话解决率、客服平均回复次数」
        </span>
      </div>

      <div v-if="!typeRows.length" style="padding:30px;text-align:center;color:#909399">
        等待 ETL 产出 —— 结果表 ads_chat_quality 暂无数据，请先执行 06_ads_supplement.hql
      </div>

      <template v-else>
        <el-row :gutter="14">
          <el-col :span="6">
            <div class="kpi"><div class="kpi-label">有效会话总数</div><div class="kpi-value">{{ fmt(totalSession) }}</div></div>
          </el-col>
          <el-col :span="6">
            <div class="kpi"><div class="kpi-label">平均首次响应(秒)</div><div class="kpi-value">{{ avgFirstResp }}</div></div>
          </el-col>
          <el-col :span="6">
            <div class="kpi"><div class="kpi-label">整体会话解决率</div><div class="kpi-value c-good">{{ overallSolveRate }}%</div></div>
          </el-col>
          <el-col :span="6">
            <div class="kpi"><div class="kpi-label">平均会话时长(秒)</div><div class="kpi-value">{{ avgDuration }}</div></div>
          </el-col>
        </el-row>

        <el-row :gutter="14" style="margin-top:14px">
          <el-col :span="6">
            <div class="kpi"><div class="kpi-label">用户提问总次数</div><div class="kpi-value">{{ fmt(totalUserMsg) }}</div></div>
          </el-col>
          <el-col :span="6">
            <div class="kpi"><div class="kpi-label">客服回复总次数</div><div class="kpi-value">{{ fmt(totalMerchantReply) }}</div></div>
          </el-col>
          <el-col :span="6">
            <div class="kpi"><div class="kpi-label">机器人回复次数</div><div class="kpi-value">{{ fmt(totalBotReply) }}</div></div>
          </el-col>
          <el-col :span="6">
            <div class="kpi"><div class="kpi-label">人均客服回复条数</div><div class="kpi-value">{{ perSessionReply }}</div></div>
          </el-col>
        </el-row>
      </template>
    </el-card>

    <el-row :gutter="12" style="margin-bottom:12px">
      <el-col :span="10">
        <el-card shadow="never">
          <div slot="header"><span style="font-weight:600">咨询类型分布</span></div>
          <div v-if="!typeRows.length" style="padding:30px;text-align:center;color:#909399">等待 ETL 产出</div>
          <div v-show="typeRows.length" id="chatTypePie" style="height:300px"></div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never">
          <div slot="header"><span style="font-weight:600">各咨询类型解决率对比</span></div>
          <div v-if="!typeRows.length" style="padding:30px;text-align:center;color:#909399">等待 ETL 产出</div>
          <div v-show="typeRows.length" id="solveChart" style="height:300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-bottom:12px">
      <div slot="header"><span style="font-weight:600">服务质量明细（按咨询类型）</span></div>
      <el-table :data="typeRows" size="small" border stripe>
        <el-table-column prop="dimValue" label="咨询类型" min-width="130" />
        <el-table-column prop="sessionCnt" label="会话数" width="90" align="right" />
        <el-table-column label="用户提问总次数" width="130" align="right">
          <template slot-scope="s">{{ s.row.userMsgSum }}</template>
        </el-table-column>
        <el-table-column label="客服回复总次数" width="130" align="right">
          <template slot-scope="s">{{ s.row.merchantReplySum }}</template>
        </el-table-column>
        <el-table-column label="机器人回复" width="110" align="right">
          <template slot-scope="s">{{ s.row.botReplySum }}</template>
        </el-table-column>
        <el-table-column label="解决率" width="110" align="right">
          <template slot-scope="s">
            <span :style="{ color: Number(s.row.solveRate) >= 50 ? '#67C23A' : '#E6A23C', fontWeight: 600 }">
              {{ s.row.solveRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="平均首响(秒)" width="120" align="right">
          <template slot-scope="s">{{ s.row.avgFirstResp }}</template>
        </el-table-column>
        <el-table-column label="平均时长(秒)" width="120" align="right">
          <template slot-scope="s">{{ s.row.avgDuration }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never">
      <div slot="header"><span style="font-weight:600">热门咨询商品 TOP10</span></div>
      <el-table :data="hotGoods" size="small" border stripe height="300">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="dimValue" label="商品" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sessionCnt" label="咨询次数" width="100" align="right" />
        <el-table-column prop="userMsgSum" label="提问次数" width="100" align="right" />
        <el-table-column label="解决率" width="100" align="right">
          <template slot-scope="s">{{ s.row.solveRate }}%</template>
        </el-table-column>
        <el-table-column label="平均首响(秒)" width="120" align="right">
          <template slot-scope="s">{{ s.row.avgFirstResp }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getChatQuality } from '@/api/pms_analysis'
import * as echarts from 'echarts'

export default {
  name: 'AnalysisChatQuality',
  data() {
    return { rows: [] }
  },
  computed: {
    typeRows() { return this.rows.filter(x => x.dimType === 'type_overall') },
    hotGoods() { return this.rows.filter(x => x.dimType === 'hot_goods').slice(0, 10) },
    totalSession() { return this.typeRows.reduce((s, x) => s + (Number(x.sessionCnt) || 0), 0) },
    totalUserMsg() { return this.typeRows.reduce((s, x) => s + (Number(x.userMsgSum) || 0), 0) },
    totalMerchantReply() { return this.typeRows.reduce((s, x) => s + (Number(x.merchantReplySum) || 0), 0) },
    totalBotReply() { return this.typeRows.reduce((s, x) => s + (Number(x.botReplySum) || 0), 0) },
    totalSolved() { return this.typeRows.reduce((s, x) => s + (Number(x.solvedCnt) || 0), 0) },
    overallSolveRate() {
      return this.totalSession ? (this.totalSolved * 100 / this.totalSession).toFixed(2) : '-'
    },
    avgFirstResp() {
      const n = this.typeRows.length
      if (!n) return '-'
      return (this.typeRows.reduce((s, x) => s + (Number(x.avgFirstResp) || 0), 0) / n).toFixed(1)
    },
    avgDuration() {
      const n = this.typeRows.length
      if (!n) return '-'
      return (this.typeRows.reduce((s, x) => s + (Number(x.avgDuration) || 0), 0) / n).toFixed(0)
    },
    perSessionReply() {
      return this.totalSession ? (this.totalMerchantReply / this.totalSession).toFixed(2) : '-'
    }
  },
  created() { this.load() },
  methods: {
    fmt(n) { return Number(n || 0).toLocaleString('zh-CN') },
    load() {
      getChatQuality().then(res => {
        const d = res && res.data ? res.data : {}
        this.rows = (d && d.rows) || []
        this.$nextTick(() => this.draw())
      }).catch(() => { this.rows = [] })
    },
    draw() {
      if (!this.typeRows.length) return

      // 咨询类型分布饼图
      const pieEl = document.getElementById('chatTypePie')
      if (pieEl) {
        echarts.init(pieEl).setOption({
          tooltip: { trigger: 'item', formatter: '{b}: {c} 次会话 ({d}%)' },
          legend: { orient: 'vertical', right: 6, top: 'center', textStyle: { fontSize: 12 } },
          series: [{
            type: 'pie', radius: ['42%', '68%'], center: ['38%', '50%'],
            label: { formatter: '{b}\n{d}%', fontSize: 11 },
            data: this.typeRows.map(x => ({ name: x.dimValue, value: Number(x.sessionCnt) || 0 }))
          }]
        }, true)
      }

      // 各咨询类型解决率对比
      const el = document.getElementById('solveChart')
      if (el) {
        const rows = this.typeRows.slice().sort((a, b) => Number(b.solveRate) - Number(a.solveRate))
        echarts.init(el).setOption({
          tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
          grid: { left: 60, right: 40, top: 30, bottom: 60 },
          xAxis: { type: 'category', data: rows.map(x => x.dimValue), axisLabel: { rotate: 30 } },
          yAxis: { type: 'value', name: '解决率%', max: 100 },
          series: [{
            type: 'bar',
            data: rows.map(x => Number(x.solveRate || 0)),
            barMaxWidth: 46,
            itemStyle: { color: '#409EFF' },
            label: { show: true, position: 'top', formatter: '{c}%' }
          }]
        }, true)
      }
    }
  }
}
</script>

<style scoped>
.kpi { padding: 14px; background: #f8f9fb; border-radius: 4px; text-align: center; }
.kpi-label { font-size: 12px; color: #909399; margin-bottom: 6px; }
.kpi-value { font-size: 22px; font-weight: 600; color: #303133; }
.kpi-value.c-good { color: #67C23A; }
</style>
