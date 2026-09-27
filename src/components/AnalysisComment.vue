<template>
  <div class="app-container">
    <div class="mod-head">
      <span class="mod-title"><i class="el-icon-pie-chart"></i> 模块三 · 用户评价数据分析与统计</span>
      <span class="mod-sub">数据来源：ads_comment_analysis / ads_goods_rating（Hive 离线 ETL 产出）</span>
    </div>

    <el-tabs v-model="tab" type="border-card">
      <!-- ① 评价总览 -->
      <el-tab-pane name="overview">
        <span slot="label"><i class="el-icon-data-line"></i> 舆情总览与关键词</span>
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span><i class="el-icon-data-line"></i> 评价舆情总览</span>
            <span class="src">数据来源：ads_comment_analysis</span>
          </div>

          <el-alert v-if="empty" type="info" :closable="false" show-icon
                    title="等待 ETL 产出" description="结果表 ads_comment_analysis 暂无数据，请先执行离线分析任务并回写该表。"></el-alert>

          <template v-else>
            <!-- 需求①评价舆情总览：核心卡片 -->
            <el-row :gutter="14">
              <el-col :span="6">
                <div class="stat">
                  <div class="stat-num">{{ fmt(agg.total) }}</div>
                  <div class="stat-label">总评价数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat">
                  <div class="stat-num c-good">{{ goodRate }}%</div>
                  <div class="stat-label">整体好评率（4-5 星）</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat">
                  <div class="stat-num c-bad">{{ badRate }}%</div>
                  <div class="stat-label">差评率（1-2 星）</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat">
                  <div class="stat-num">{{ avgRating }}</div>
                  <div class="stat-label">平均评分</div>
                </div>
              </el-col>
            </el-row>

            <!-- 需求②等级分布饼图（好/中/差）+ 原星级分布 -->
            <el-row :gutter="20" style="margin-top:18px;">
              <el-col :span="12">
                <div class="chart-title">评价等级分布（好评 4-5 星 / 中评 3 星 / 差评 1-2 星）</div>
                <div id="level3Pie" class="chart-box"></div>
              </el-col>
              <el-col :span="12">
                <div class="chart-title">星级明细分布（1-5 星）</div>
                <div id="ratingChart" class="chart-box"></div>
              </el-col>
            </el-row>

            <!-- 需求③关键词（柱状明细） -->
            <div class="chart-title" style="margin-top:18px;">评价关键词 TOP15</div>
            <div id="kwChart" class="chart-box" style="height:340px;"></div>

            <!-- 需求⑤口碑趋势折线图 -->
            <div class="chart-title" style="margin-top:18px;">商品口碑随时间变化趋势（月度）</div>
            <div id="commentTrendChart" class="chart-box" style="height:300px;"></div>

            <!-- 需求④品类口碑对比图 -->
            <div class="chart-title" style="margin-top:18px;">品类口碑对比（评价量 TOP10 品类）</div>
            <div id="catRateChart" class="chart-box" style="height:300px;"></div>

            <div class="chart-title" style="margin-top:18px;">品类评分明细</div>
            <el-table :data="catRows" border size="small" max-height="300">
              <el-table-column prop="statDate" label="月份" width="100"></el-table-column>
              <el-table-column prop="categoryName" label="品类" width="160"></el-table-column>
              <el-table-column prop="commentCnt" label="评价量" width="110"></el-table-column>
              <el-table-column prop="avgRating" label="平均分" width="110"></el-table-column>
              <el-table-column prop="goodRate" label="好评率%" width="120"></el-table-column>
            </el-table>
          </template>
        </el-card>
      </el-tab-pane>

      <!-- ② 商品口碑榜与好中差三分类 -->
      <el-tab-pane name="ratings" lazy>
        <span slot="label"><i class="el-icon-star-off"></i> 商品口碑 · 榜单</span>
        <AnalysisRating v-if="tab === 'ratings'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getCommentAnalysis } from '@/api/pms_analysis.js'
import AnalysisRating from './AnalysisRating.vue'

export default {
  components: { AnalysisRating },
  data() {
    return { rows: [], empty: false, tab: 'overview' }
  },
  computed: {
    ratingRows() { return this.rows.filter(x => x.rowType === 'rating') },
    // 需求①：总评价数 / 好评率 / 差评率 / 平均分
    agg() {
      const a = { total: 0, good: 0, mid: 0, bad: 0, sum: 0 }
      this.ratingRows.forEach(x => {
        const c = Number(x.commentCnt) || 0
        const r = Number(x.rating) || 0
        a.total += c
        a.sum += r * c
        if (r >= 4) a.good += c
        else if (r === 3) a.mid += c
        else a.bad += c
      })
      return a
    },
    goodRate() { return this.agg.total ? (this.agg.good * 100 / this.agg.total).toFixed(2) : '-' },
    badRate() { return this.agg.total ? (this.agg.bad * 100 / this.agg.total).toFixed(2) : '-' },
    avgRating() { return this.agg.total ? (this.agg.sum / this.agg.total).toFixed(2) : '-' },
    // 需求⑤：口碑趋势（按月加权）
    trendRows() {
      const m = {}
      this.ratingRows.forEach(x => {
        const k = x.statDate
        const c = Number(x.commentCnt) || 0
        const r = Number(x.rating) || 0
        m[k] = m[k] || { sum: 0, cnt: 0, good: 0 }
        m[k].sum += r * c
        m[k].cnt += c
        if (r >= 4) m[k].good += c
      })
      return Object.keys(m).sort().map(k => ({
        statDate: k,
        avgRating: m[k].cnt ? Number((m[k].sum / m[k].cnt).toFixed(2)) : 0,
        goodRate: m[k].cnt ? Number((m[k].good * 100 / m[k].cnt).toFixed(2)) : 0
      }))
    },
    // 需求④：品类口碑（跨月加权聚合成 TOP10 品类）
    catAgg() {
      const m = {}
      this.rows.filter(x => x.rowType === 'category').forEach(x => {
        const k = x.categoryName
        const c = Number(x.commentCnt) || 0
        m[k] = m[k] || { cnt: 0, sum: 0, goodSum: 0 }
        m[k].cnt += c
        m[k].sum += (Number(x.avgRating) || 0) * c
        m[k].goodSum += (Number(x.goodRate) || 0) * c
      })
      return Object.keys(m).map(k => ({
        name: k,
        commentCnt: m[k].cnt,
        avgRating: m[k].cnt ? Number((m[k].sum / m[k].cnt).toFixed(2)) : 0,
        goodRate: m[k].cnt ? Number((m[k].goodSum / m[k].cnt).toFixed(2)) : 0
      })).sort((a, b) => b.commentCnt - a.commentCnt).slice(0, 10)
    },
    // 关键词 TOP15：粒度是 月×关键词，同一词有 39 个月份行 —— 必须先按词跨月汇总
    kwRows() {
      const ag = {}
      this.rows.filter(x => x.rowType === 'keyword').forEach(x => {
        ag[x.keyword] = (ag[x.keyword] || 0) + (Number(x.commentCnt) || 0)
      })
      return Object.keys(ag).map(k => ({ keyword: k, commentCnt: ag[k] }))
        .sort((a, b) => b.commentCnt - a.commentCnt).slice(0, 15)
    },
    catRows() { return this.rows.filter(x => x.rowType === 'category').sort((a, b) => (Number(b.commentCnt) || 0) - (Number(a.commentCnt) || 0)) }
  },
  mounted() {
    getCommentAnalysis().then(r => {
      this.rows = ((r.data || {}).rows) || []
      this.empty = this.rows.length === 0
      if (!this.empty) this.$nextTick(() => this.draw())
    }).catch(() => { this.empty = true })
  },
  methods: {
    fmt(n) { return Number(n || 0).toLocaleString('zh-CN') },
    box(id) {
      const el = document.getElementById(id)
      return el ? echarts.init(el) : null
    },
    draw() {
      // ① 好/中/差 三分类饼图（需求明确要求"好评/中评/差评占比结构"）
      const lp = this.box('level3Pie')
      if (lp) {
        lp.setOption({
          tooltip: { trigger: 'item', formatter: '{b}: {c} 条 ({d}%)' },
          legend: { bottom: 0 },
          series: [{
            type: 'pie', radius: ['42%', '68%'],
            label: { formatter: '{b}\n{d}%' },
            data: [
              { name: '好评(4-5星)', value: this.agg.good, itemStyle: { color: '#67C23A' } },
              { name: '中评(3星)', value: this.agg.mid, itemStyle: { color: '#E6A23C' } },
              { name: '差评(1-2星)', value: this.agg.bad, itemStyle: { color: '#F56C6C' } }
            ]
          }]
        }, true)
      }

      // ② 星级明细分布
      const aggR = {}
      this.ratingRows.forEach(x => { aggR[x.rating] = (aggR[x.rating] || 0) + (Number(x.commentCnt) || 0) })
      const rc = this.box('ratingChart')
      if (rc) {
        rc.setOption({
          tooltip: { trigger: 'item', formatter: '{b}: {c} 条 ({d}%)' },
          series: [{
            type: 'pie', radius: ['40%', '65%'],
            label: { formatter: '{b}\n{d}%' },
            data: Object.keys(aggR).sort().map(k => ({ name: k + ' 星', value: aggR[k] }))
          }]
        }, true)
      }

      // ③ 关键词 TOP15
      const kw = this.box('kwChart')
      if (kw) {
        kw.setOption({
          tooltip: { trigger: 'axis' },
          grid: { left: 100, right: 30, top: 20, bottom: 30 },
          xAxis: { type: 'value' },
          yAxis: { type: 'category', data: this.kwRows.map(x => x.keyword).reverse() },
          series: [{ type: 'bar', data: this.kwRows.map(x => Number(x.commentCnt) || 0).reverse(), itemStyle: { color: '#409EFF' } }]
        }, true)
      }

      // ④ 口碑趋势折线
      const tr = this.box('commentTrendChart')
      if (tr) {
        const t = this.trendRows
        tr.setOption({
          tooltip: { trigger: 'axis' },
          legend: { data: ['平均评分', '好评率%'] },
          grid: { left: 60, right: 60, top: 40, bottom: 50 },
          xAxis: { type: 'category', data: t.map(x => x.statDate), axisLabel: { rotate: 30 } },
          yAxis: [{ type: 'value', name: '平均评分', min: 0, max: 5 }, { type: 'value', name: '好评率%', min: 0, max: 100 }],
          series: [
            { name: '平均评分', type: 'line', smooth: true, data: t.map(x => x.avgRating), itemStyle: { color: '#409EFF' } },
            { name: '好评率%', type: 'line', smooth: true, yAxisIndex: 1, data: t.map(x => x.goodRate), itemStyle: { color: '#67C23A' } }
          ]
        }, true)
      }

      // ⑤ 品类口碑对比柱状
      const cr = this.box('catRateChart')
      if (cr) {
        const c = this.catAgg
        cr.setOption({
          tooltip: { trigger: 'axis' },
          legend: { data: ['平均评分', '好评率%'] },
          grid: { left: 60, right: 60, top: 40, bottom: 70 },
          xAxis: { type: 'category', data: c.map(x => x.name), axisLabel: { rotate: 30 } },
          yAxis: [{ type: 'value', name: '平均评分', min: 0, max: 5 }, { type: 'value', name: '好评率%', min: 0, max: 100 }],
          series: [
            { name: '平均评分', type: 'bar', barMaxWidth: 26, data: c.map(x => x.avgRating), itemStyle: { color: '#409EFF' } },
            { name: '好评率%', type: 'line', yAxisIndex: 1, smooth: true, data: c.map(x => x.goodRate), itemStyle: { color: '#67C23A' } }
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
.chart-box { height: 280px; }
.stat { background: #f5f7fa; border-radius: 8px; padding: 14px 8px; text-align: center; }
.stat-num { font-size: 22px; font-weight: 600; color: #303133; }
.stat-num.c-good { color: #67C23A; }
.stat-num.c-bad { color: #F56C6C; }
.stat-label { font-size: 12px; color: #909399; margin-top: 6px; }
</style>
