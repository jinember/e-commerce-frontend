<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <div slot="header">
        <span style="font-weight:600">浏览 / 收藏 / 加购 行为指标</span>
        <span style="margin-left:12px;color:#909399;font-size:12px">
          对应需求：「浏览UV、PV、人均浏览次数、平均浏览时长、收藏用户数、热门浏览商品TOP100、热门品类TOP20」
        </span>
      </div>
      <el-row :gutter="12">
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">浏览 PV</div><div class="kpi-value">{{ fmt(browse.cnt) }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">浏览 UV</div><div class="kpi-value">{{ fmt(browse.uv) }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">人均浏览次数</div><div class="kpi-value">{{ perUvBrowse }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">平均浏览时长(秒)</div><div class="kpi-value">{{ browse.avgStaySec || '-' }}</div></div>
        </el-col>
      </el-row>
      <el-row :gutter="12" style="margin-top:12px">
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">收藏次数</div><div class="kpi-value">{{ fmt(favorite.cnt) }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">收藏人数</div><div class="kpi-value">{{ fmt(favorite.uv) }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">加购次数</div><div class="kpi-value">{{ fmt(cart.cnt) }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">加购人数</div><div class="kpi-value">{{ fmt(cart.uv) }}</div></div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="12" style="margin-bottom:12px">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header"><span style="font-weight:600">热搜关键词 TOP20</span></div>
          <div v-if="!searchRows.length" style="padding:30px;text-align:center;color:#909399">等待 ETL 产出</div>
          <div v-show="searchRows.length" id="searchChart" style="height:300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header"><span style="font-weight:600">热门浏览品类 TOP20</span></div>
          <div v-if="!hotCategory.length" style="padding:30px;text-align:center;color:#909399">等待 ETL 产出</div>
          <div v-show="hotCategory.length" id="hotCatChart" style="height:300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <div slot="header"><span style="font-weight:600">热门浏览商品榜单（TOP20）</span></div>
      <el-table :data="hotGoods" size="small" border stripe height="360">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="dimValue" label="商品" min-width="240" show-overflow-tooltip />
        <el-table-column prop="cnt" label="浏览次数" width="110" align="right" />
        <el-table-column prop="uv" label="浏览人数" width="110" align="right" />
        <el-table-column label="平均停留(秒)" width="120" align="right">
          <template slot-scope="s">{{ s.row.avgStaySec || '-' }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getSearchAnalysis, getBehaviorSummary } from '@/api/pms_analysis'
import * as echarts from 'echarts'

export default {
  name: 'AnalysisBehavior',
  data() {
    return {
      searchRows: [],
      summaryRows: []
    }
  },
  computed: {
    pick() {
      return t => {
        const r = this.summaryRows.filter(x => x.dimType === t)[0]
        return r || { cnt: 0, uv: 0, avgStaySec: null }
      }
    },
    browse() { return this.pick('browse') },
    favorite() { return this.pick('favorite') },
    cart() { return this.pick('cart') },
    perUvBrowse() {
      const uv = Number(this.browse.uv || 0)
      return uv ? (Number(this.browse.cnt || 0) / uv).toFixed(2) : '-'
    },
    hotGoods() { return this.summaryRows.filter(x => x.dimType === 'hot_goods').slice(0, 20) },
    hotCategory() { return this.summaryRows.filter(x => x.dimType === 'hot_category').slice(0, 20) }
  },
  created() {
    this.load()
  },
  methods: {
    fmt(n) {
      return Number(n || 0).toLocaleString('zh-CN')
    },
    load() {
      Promise.all([getSearchAnalysis(), getBehaviorSummary()]).then(([a, b]) => {
        const d1 = a && a.data ? a.data : {}
        const d2 = b && b.data ? b.data : {}
        this.searchRows = (d1 && d1.rows) || []
        this.summaryRows = (d2 && d2.rows) || []
        this.$nextTick(() => { this.drawSearch(); this.drawHotCat() })
      }).catch(() => { this.searchRows = []; this.summaryRows = [] })
    },
    drawSearch() {
      if (!this.searchRows.length) return
      const el = document.getElementById('searchChart')
      if (!el) return
      const rows = this.searchRows.slice(0, 20)
      echarts.init(el).setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 90, right: 40, top: 20, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: rows.map(x => x.keyword).reverse(), axisLabel: { width: 80, overflow: 'truncate' } },
        series: [{ type: 'bar', data: rows.map(x => Number(x.searchCnt || 0)).reverse(), itemStyle: { color: '#409EFF' } }]
      }, true)
    },
    drawHotCat() {
      if (!this.hotCategory.length) return
      const el = document.getElementById('hotCatChart')
      if (!el) return
      const rows = this.hotCategory.slice().reverse()
      echarts.init(el).setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 80, right: 40, top: 20, bottom: 30 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: rows.map(x => x.dimValue), axisLabel: { width: 70, overflow: 'truncate' } },
        series: [{ type: 'bar', data: rows.map(x => Number(x.cnt || 0)), itemStyle: { color: '#67C23A' } }]
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
