<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <div slot="header">
        <span style="font-weight:600">{{ titleText }}</span>
        <el-radio-group v-if="!lockModule" v-model="module" size="small" style="margin-left:16px" @change="draw">
          <el-radio-button label="behavior">用户行为</el-radio-button>
          <el-radio-button label="order">订单成交</el-radio-button>
          <el-radio-button label="chat">客服咨询</el-radio-button>
        </el-radio-group>
        <span style="margin-left:12px;color:#909399;font-size:12px">{{ hintText }}</span>
      </div>

      <el-row :gutter="12" v-if="curRows.length">
        <el-col :span="6">
          <div class="kpi">
            <div class="kpi-label">高峰时段</div>
            <div class="kpi-value">{{ peakHour }} 点</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="kpi">
            <div class="kpi-label">该时段{{ unitLabel }}</div>
            <div class="kpi-value">{{ peakCnt }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="kpi">
            <div class="kpi-label">全天合计</div>
            <div class="kpi-value">{{ totalCnt }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="kpi">
            <div class="kpi-label">{{ module === 'order' ? '全天成交额' : '去重会员数' }}</div>
            <div class="kpi-value">{{ module === 'order' ? ('¥' + totalAmount) : totalUv }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never">
      <div v-if="!curRows.length" style="padding:40px;text-align:center;color:#909399">
        等待 ETL 产出 —— 结果表 ads_hourly_analysis 暂无数据，请先执行 06_ads_supplement.hql
      </div>
      <div v-show="curRows.length">
        <div :id="chartId" style="height:340px"></div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getHourly } from '@/api/pms_analysis'
import * as echarts from 'echarts'

const MODULE_META = {
  behavior: { title: '用户行为时段分布', hint: '对应需求：「每日不同时段用户活跃分布」「用户时段热力图」' },
  order: { title: '订单成交时段分析', hint: '对应需求：「时段销售分析」' },
  chat: { title: '客服咨询时段分布', hint: '对应需求：「用户咨询高峰时段」' }
}

export default {
  name: 'AnalysisHourly',
  props: {
    // 传入后锁定分析维度（嵌在对应模块内使用），不显示切换器
    lockModule: { type: String, default: '' }
  },
  data() {
    return {
      rows: [],
      module: this.lockModule || 'behavior'
    }
  },
  computed: {
    chartId() {
      return 'hourlyChart' + this._uid
    },
    titleText() {
      const m = MODULE_META[this.module]
      return (this.lockModule ? m.title : '时段分析') || '时段分析'
    },
    hintText() {
      const m = MODULE_META[this.module]
      return this.lockModule ? (m.hint || '') : '对应需求：「每日不同时段用户活跃/下单分布」「时段销售分析」「用户咨询高峰时段」'
    },
    curRows() {
      // 后端返回 [{module, hourOfDay, cnt, uv, amount}]
      return this.rows.filter(x => x.module === this.module)
                      .sort((a, b) => Number(a.hourOfDay) - Number(b.hourOfDay))
    },
    unitLabel() {
      return this.module === 'order' ? '订单数' : (this.module === 'chat' ? '会话数' : '行为数')
    },
    peakHour() {
      if (!this.curRows.length) return '-'
      return this.curRows.reduce((m, x) => Number(x.cnt) > Number(m.cnt) ? x : m).hourOfDay
    },
    peakCnt() {
      if (!this.curRows.length) return '-'
      return this.curRows.reduce((m, x) => Number(x.cnt) > Number(m.cnt) ? x : m).cnt
    },
    totalCnt() {
      return this.curRows.reduce((s, x) => s + Number(x.cnt || 0), 0)
    },
    totalUv() {
      return this.curRows.reduce((s, x) => s + Number(x.uv || 0), 0)
    },
    totalAmount() {
      const v = this.curRows.reduce((s, x) => s + Number(x.amount || 0), 0)
      return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  },
  created() {
    this.load()
  },
  methods: {
    load() {
      getHourly().then(res => {
        const d = res && res.data ? res.data : {}
        this.rows = (d && d.rows) || []
        this.$nextTick(() => this.draw())
      }).catch(() => { this.rows = [] })
    },
    // Y 轴金额缩单位：成交额是千万级，不缩单位会把刻度标签撑出 grid 被裁掉
    moneyAxis(v) {
      const n = Number(v) || 0
      if (n >= 100000000) return (n / 100000000).toFixed(2) + ' 亿'
      if (n >= 10000) return (n / 10000).toFixed(0) + ' 万'
      return String(n)
    },
    draw() {
      if (!this.curRows.length) return
      const el = document.getElementById(this.chartId)
      if (!el) return
      const chart = echarts.init(el)

      const hours = this.curRows.map(x => Number(x.hourOfDay))
      const cnts = this.curRows.map(x => Number(x.cnt || 0))
      const maxV = Math.max.apply(null, cnts.concat([1]))

      // 按数值深浅着色，视觉上接近热力效果
      const colors = cnts.map(v => {
        const r = Math.round(60 + (1 - v / maxV) * 150)
        const g = Math.round(140 + (1 - v / maxV) * 80)
        const b = Math.round(220 - (v / maxV) * 60)
        return 'rgb(' + r + ',' + g + ',' + b + ')'
      })

      const series = [{
        name: this.unitLabel,
        type: 'bar',
        data: cnts.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
        barMaxWidth: 26
      }]

      // 订单模块额外叠加成交额折线
      if (this.module === 'order') {
        series.push({
          name: '成交额',
          type: 'line',
          yAxisIndex: 1,
          data: this.curRows.map(x => Number(x.amount || 0)),
          smooth: true,
          itemStyle: { color: '#E6A23C' }
        })
      }

      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: this.module === 'order' ? [this.unitLabel, '成交额'] : [this.unitLabel] },
        grid: { left: 60, right: 60, top: 40, bottom: 40 },
        xAxis: {
          type: 'category',
          data: hours.map(h => h + '点'),
          axisLabel: { interval: 1 }
        },
        yAxis: this.module === 'order'
          ? [{ type: 'value', name: this.unitLabel },
             { type: 'value', name: '成交额', axisLabel: { formatter: v => this.moneyAxis(v) } }]
          : [{ type: 'value', name: this.unitLabel }],
        series: series
      }, true)
    }
  }
}
</script>

<style scoped>
.kpi {
  padding: 14px;
  background: #f8f9fb;
  border-radius: 4px;
  text-align: center;
}
.kpi-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}
.kpi-value {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}
</style>
