<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <div slot="header">
        <span style="font-weight:600">时段分析 · 用户行为 / 订单成交 / 客服咨询</span>
        <span style="margin-left:12px;color:#909399;font-size:12px">
          对应需求：「每日不同时段用户活跃分布」「时段销售分析」「用户咨询高峰时段」
        </span>
      </div>
      <div style="color:#606266;font-size:13px;line-height:1.9">
        三个维度共用同一条 0~23 点时间轴：<b>用户行为</b>看活跃高峰、<b>订单成交</b>看销售高峰、
        <b>客服咨询</b>看话务高峰。柱色越深代表该时段量越大，可直观对比三类高峰是否重合。
      </div>
    </el-card>

    <el-card shadow="never" v-for="m in modules" :key="m.key" style="margin-bottom:12px">
      <div slot="header">
        <span style="font-weight:600">{{ m.title }}</span>
        <span style="margin-left:12px;color:#909399;font-size:12px">{{ m.hint }}</span>
        <span style="float:right;font-size:12px;color:#606266" v-if="rowsOf(m.key).length">
          高峰 <b style="color:#409EFF">{{ peak(m.key).hour }} 点</b>
          ｜ 该时段 {{ fmt(peak(m.key).cnt) }}
          ｜ 全天合计 {{ fmt(total(m.key)) }}
          <template v-if="m.key === 'order'">｜ 成交额 ¥{{ totalAmount(m.key) }}</template>
          <template v-else>｜ 去重会员 {{ fmt(totalUv(m.key)) }}</template>
        </span>
      </div>
      <div v-if="!rowsOf(m.key).length" style="padding:40px;text-align:center;color:#909399">
        等待 ETL 产出 —— 结果表 ads_hourly_analysis 暂无该维度数据
      </div>
      <div v-show="rowsOf(m.key).length" :id="chartId(m.key)" style="height:300px"></div>
    </el-card>
  </div>
</template>

<script>
import { getHourly } from '@/api/pms_analysis'
import * as echarts from 'echarts'

export default {
  name: 'AnalysisHourlyAll',
  data() {
    return {
      rows: [],
      modules: [
        { key: 'behavior', title: '用户行为时段分布',
          hint: '「每日不同时段用户活跃分布」「用户时段热力图」', unit: '行为数' },
        { key: 'order', title: '订单成交时段分析',
          hint: '「时段销售分析」', unit: '订单数' },
        { key: 'chat', title: '客服咨询时段分布',
          hint: '「用户咨询高峰时段」', unit: '会话数' }
      ]
    }
  },
  created() {
    this.load()
  },
  methods: {
    fmt(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    // Y 轴金额缩单位：成交额是千万级，不缩单位会把刻度标签撑出 grid 被裁掉
    moneyAxis(v) {
      const n = Number(v) || 0
      if (n >= 100000000) return (n / 100000000).toFixed(2) + ' 亿'
      if (n >= 10000) return (n / 10000).toFixed(0) + ' 万'
      return String(n)
    },
    chartId(key) {
      return 'hourlyAll_' + key
    },
    rowsOf(key) {
      return this.rows.filter(x => x.module === key)
                      .sort((a, b) => Number(a.hourOfDay) - Number(b.hourOfDay))
    },
    peak(key) {
      const rs = this.rowsOf(key)
      if (!rs.length) return { hour: '-', cnt: 0 }
      const top = rs.reduce((m, x) => Number(x.cnt) > Number(m.cnt) ? x : m)
      return { hour: top.hourOfDay, cnt: top.cnt }
    },
    total(key) {
      return this.rowsOf(key).reduce((s, x) => s + Number(x.cnt || 0), 0)
    },
    totalUv(key) {
      return this.rowsOf(key).reduce((s, x) => s + Number(x.uv || 0), 0)
    },
    totalAmount(key) {
      const v = this.rowsOf(key).reduce((s, x) => s + Number(x.amount || 0), 0)
      return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    load() {
      getHourly().then(res => {
        const d = res && res.data ? res.data : {}
        this.rows = (d && d.rows) || []
        this.$nextTick(() => this.drawAll())
      }).catch(() => { this.rows = [] })
    },
    drawAll() {
      this.modules.forEach(m => this.draw(m.key))
    },
    draw(key) {
      const rs = this.rowsOf(key)
      if (!rs.length) return
      const el = document.getElementById(this.chartId(key))
      if (!el) return
      const meta = this.modules.filter(x => x.key === key)[0]
      const hours = rs.map(x => Number(x.hourOfDay))
      const cnts = rs.map(x => Number(x.cnt || 0))
      const maxV = Math.max.apply(null, cnts.concat([1]))

      const colors = cnts.map(v => {
        const r = Math.round(60 + (1 - v / maxV) * 150)
        const g = Math.round(140 + (1 - v / maxV) * 80)
        const b = Math.round(220 - (v / maxV) * 60)
        return 'rgb(' + r + ',' + g + ',' + b + ')'
      })

      const series = [{
        name: meta.unit,
        type: 'bar',
        data: cnts.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
        barMaxWidth: 30
      }]

      if (key === 'order') {
        series.push({
          name: '成交额',
          type: 'line',
          yAxisIndex: 1,
          data: rs.map(x => Number(x.amount || 0)),
          smooth: true,
          itemStyle: { color: '#E6A23C' }
        })
      }

      echarts.init(el).setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: key === 'order' ? [meta.unit, '成交额'] : [meta.unit] },
        grid: { left: 70, right: 70, top: 40, bottom: 40 },
        xAxis: { type: 'category', data: hours.map(h => h + '点'), axisLabel: { interval: 0 } },
        yAxis: key === 'order'
          ? [{ type: 'value', name: meta.unit },
             { type: 'value', name: '成交额', axisLabel: { formatter: v => this.moneyAxis(v) } }]
          : [{ type: 'value', name: meta.unit }],
        series: series
      }, true)
    }
  }
}
</script>

<style scoped>
</style>
