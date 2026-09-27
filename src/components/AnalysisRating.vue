<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <div slot="header">
        <span style="font-weight:600">商品口碑总览</span>
        <span style="margin-left:12px;color:#909399;font-size:12px">
          对应需求：「单品平均评分、低分商品TOP榜单、高口碑商品TOP榜单」「好评(4-5)/中评(3)/差评(1-2) 三类」
        </span>
      </div>
      <el-row :gutter="12">
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">有评价商品数</div><div class="kpi-value">{{ rows.length }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">口碑优 · 零差评</div><div class="kpi-value" style="color:#67C23A">{{ lv('good') }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">口碑良 · 差评率≤5%</div><div class="kpi-value" style="color:#E6A23C">{{ lv('mid') }}</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-label">待改进 · 差评率&gt;5%</div><div class="kpi-value" style="color:#F56C6C">{{ lv('bad') }}</div></div>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="12" style="margin-bottom:12px">
      <el-col :span="8">
        <el-card shadow="never">
          <div slot="header"><span style="font-weight:600">口碑等级分布</span></div>
          <div v-if="!levels.length" style="padding:30px;text-align:center;color:#909399">等待 ETL 产出</div>
          <div v-show="levels.length" id="levelPie" style="height:280px"></div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="never">
          <div slot="header">
            <span style="font-weight:600">低分商品 TOP10（优先整改）</span>
          </div>
          <el-table :data="lowGoods" size="small" border stripe height="280">
            <el-table-column type="index" label="#" width="50" />
            <el-table-column prop="goodsName" label="商品" min-width="200" show-overflow-tooltip />
            <el-table-column prop="categoryName" label="品类" width="110" />
            <el-table-column prop="commentCnt" label="评价数" width="90" align="right" />
            <el-table-column label="平均分" width="90" align="right">
              <template slot-scope="s">
                <span style="color:#F56C6C;font-weight:600">{{ s.row.avgRating }}</span>
              </template>
            </el-table-column>
            <el-table-column label="差评数" width="90" align="right">
              <template slot-scope="s">{{ s.row.badCnt }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <div slot="header"><span style="font-weight:600">高口碑商品 TOP10</span></div>
      <el-table :data="highGoods" size="small" border stripe height="300">
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="goodsName" label="商品" min-width="220" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="品类" width="120" />
        <el-table-column prop="commentCnt" label="评价数" width="100" align="right" />
        <el-table-column label="平均分" width="100" align="right">
          <template slot-scope="s">
            <span style="color:#67C23A;font-weight:600">{{ s.row.avgRating }}</span>
          </template>
        </el-table-column>
        <el-table-column label="好评率" width="110" align="right">
          <template slot-scope="s">{{ s.row.goodRate }}%</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getGoodsRating } from '@/api/pms_analysis'
import * as echarts from 'echarts'

export default {
  name: 'AnalysisRating',
  data() {
    return { rows: [], levels: [] }
  },
  computed: {
    lowGoods() {
      // 评价数≥3 才参与排名，避免 1 条差评就上榜
      return this.rows.filter(x => Number(x.commentCnt) >= 3)
                      .sort((a, b) => Number(a.avgRating) - Number(b.avgRating))
                      .slice(0, 10)
    },
    highGoods() {
      return this.rows.filter(x => Number(x.commentCnt) >= 3)
                      .sort((a, b) => Number(b.avgRating) - Number(a.avgRating))
                      .slice(0, 10)
    }
  },
  created() { this.load() },
  methods: {
    lv(t) {
      const r = this.levels.filter(x => x.levelType === t)[0]
      return r ? r.goodsCnt : 0
    },
    load() {
      getGoodsRating().then(res => {
        const d = res && res.data ? res.data : {}
        this.rows = (d && d.rows) || []
        this.levels = (d && d.levels) || []
        this.$nextTick(() => this.draw())
      }).catch(() => { this.rows = []; this.levels = [] })
    },
    draw() {
      if (!this.levels.length) return
      const el = document.getElementById('levelPie')
      if (!el) return
      // 商品级口碑分档：按【差评率】而不是平均分
      //   （实测 412 个商品平均分全在 4.0~4.87，按分数分档只会剩一类）
      const nameMap = { good: '口碑优 · 零差评', mid: '口碑良 · 差评率≤5%', bad: '待改进 · 差评率>5%' }
      const colorMap = { good: '#67C23A', mid: '#E6A23C', bad: '#F56C6C' }
      echarts.init(el).setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} 个 ({d}%)' },
        legend: { bottom: 0 },
        series: [{
          type: 'pie', radius: ['40%', '65%'],
          data: this.levels.map(x => ({
            name: nameMap[x.levelType] || x.levelType,
            value: Number(x.goodsCnt || 0),
            itemStyle: { color: colorMap[x.levelType] }
          })),
          label: { formatter: '{b}\n{d}%' }
        }]
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
