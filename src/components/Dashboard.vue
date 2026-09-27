<template>
  <div class="app-container">
    <!-- 卡片容器 -->
    <el-card shadow="hover">
      <div slot="header" class="clearfix">
        <span><i class="el-icon-house"></i> 数据概览</span>
      </div>

      <!-- 第一行：两个柱状图 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-title">各部门人数</div>
          <div id="deptBar" class="chart-box"></div>
        </el-col>
        <el-col :span="12">
          <div class="chart-title">各季度销售额（元）</div>
          <div id="quarterBar" class="chart-box"></div>
        </el-col>
      </el-row>

      <!-- 第二行：折线图 + 饼图 -->
      <el-row :gutter="20" style="margin-top:20px;">
        <el-col :span="12">
          <div class="chart-title">月度销售额趋势（元）</div>
          <div id="monthLine" class="chart-box"></div>
        </el-col>
        <el-col :span="12">
          <div class="chart-title">销售额 Top5 品类占比</div>
          <div id="productPie" class="chart-box"></div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/network/request.js'

export default {
  name: 'DataChart',
  data() {
    return {
      deptBar: null,
      quarterBar: null,
      monthLine: null,
      productPie: null,
      loading: false
    }
  },
  mounted() {
    this.initCharts()
    this.loadData()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    /* 后端 /SaleStat/dashboard 一次返回四组真实数据，
       原来这四个图是前端写死的数组，数据一变就穿帮 */
    loadData() {
      this.loading = true
      request.get('/SaleStat/dashboard').then(resp => {
        this.loading = false
        if (!resp || resp.result === 'failed') {
          this.$message.error((resp && resp.cause) || '统计数据加载失败')
          return
        }
        const deptUsers = resp.deptUsers || []
        const quarterSales = resp.quarterSales || []
        const monthlySales = resp.monthlySales || []
        const categorySales = resp.categorySales || []

        this.deptBar.setOption({
          xAxis: { data: deptUsers.map(x => x.deptName) },
          series: [{ data: deptUsers.map(x => Number(x.userCount) || 0), type: 'bar' }]
        })

        this.quarterBar.setOption({
          xAxis: { data: quarterSales.map(x => x.quarter) },
          series: [{ data: quarterSales.map(x => this.num(x.sales)), type: 'bar' }]
        })

        this.monthLine.setOption({
          xAxis: { data: monthlySales.map(x => x.month) },
          series: [{ data: monthlySales.map(x => this.num(x.sales)), type: 'line', smooth: true }]
        })

        this.productPie.setOption({
          series: [{
            type: 'pie',
            radius: '60%',
            data: categorySales.map(x => ({
              value: this.num(x.sales),
              name: x.categoryName
            }))
          }]
        })
      }).catch(() => {
        this.loading = false
        this.$message.error('统计数据加载失败')
      })
    },
    /* MySQL 的 SUM 返回 BigDecimal，Jackson 可能序列化成字符串，统一转数字 */
    num(v) {
      const n = Number(v)
      return isNaN(n) ? 0 : Math.round(n * 100) / 100
    },
    initCharts() {
      const base = { grid: { top: 5, bottom: 20, left: 50, right: 20 } }

      // 1. 部门人数柱状图（数据由 loadData 填充）
      this.deptBar = echarts.init(document.getElementById('deptBar'))
      this.deptBar.setOption(Object.assign({}, base, {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [{ data: [], type: 'bar', itemStyle: { color: '#409EFF' } }]
      }))

      // 2. 季度销售柱状图
      this.quarterBar = echarts.init(document.getElementById('quarterBar'))
      this.quarterBar.setOption(Object.assign({}, base, {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [{ data: [], type: 'bar', itemStyle: { color: '#67C23A' } }]
      }))

      // 3. 月度销售折线图
      this.monthLine = echarts.init(document.getElementById('monthLine'))
      this.monthLine.setOption(Object.assign({}, base, {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: [{ data: [], type: 'line', smooth: true, itemStyle: { color: '#E6A23C' } }]
      }))

      // 4. 品类占比饼图
      this.productPie = echarts.init(document.getElementById('productPie'))
      this.productPie.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{ type: 'pie', radius: '60%', data: [] }]
      })
    },
    resizeCharts() {
      this.deptBar.resize()
      this.quarterBar.resize()
      this.monthLine.resize()
      this.productPie.resize()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 10px;
}
.chart-box {
  width: 100%;
  height: 280px;
}
.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0px 0px 5px 0px;
  text-align: center;
}
/* 去掉 el-card 内部多余 padding */
::v-deep .el-card__body {
  padding-top: 10px !important;
}
</style>