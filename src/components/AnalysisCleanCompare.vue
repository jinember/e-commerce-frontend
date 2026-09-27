<template>
  <div class="clean-compare">
    <!-- 未跑对照组时的提示 -->
    <el-alert v-if="!ready" type="warning" :closable="false" show-icon
              title="对照组（C 组·未清洗）暂无数据"
              description="请在集群上依次执行：hive -f 08_ads_noclean.hql → sh 09_export_noclean.sh → sh 11_export_dqc.sh，本页即会出现 A/B 对照结果。">
    </el-alert>

    <template v-else>
      <!-- 一、清洗价值总览 -->
      <el-row :gutter="16" style="margin-bottom:16px;">
        <el-col :span="6">
          <div class="kpi"><div class="kpi-num">{{ dqSummary.ruleCnt || 0 }}</div>
            <div class="kpi-label">DQC 稽核规则条数</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-num warn">{{ fmt(dqSummary.hitTotal) }}</div>
            <div class="kpi-label">被清洗修复的行数</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-num">{{ dqSummary.tableCnt || 0 }}</div>
            <div class="kpi-label">覆盖来源表数</div></div>
        </el-col>
        <el-col :span="6">
          <div class="kpi"><div class="kpi-num ok">{{ diffCount }}</div>
            <div class="kpi-label">A/B 存在差异的指标数</div></div>
        </el-col>
      </el-row>

      <!-- 二、A/B 关键指标并排对照 -->
      <el-card shadow="hover" style="margin-bottom:16px;">
        <div slot="header">
          <span><i class="el-icon-s-operation"></i> 关键指标对照：跳过清洗(C组) vs 完整清洗(B组)</span>
          <span class="src">口径完全一致，唯一区别是 C 组跳过 DWD 清洗层直接聚合</span>
        </div>
        <el-alert type="info" :closable="false" show-icon style="margin-bottom:12px;"
                  title="怎么读这张表"
                  description="两组的原始数据、聚合口径完全相同，只有「是否经过 DWD 清洗」这一个变量。差异列越大，说明该类脏数据对分析结论的污染越严重 —— 这就是清洗的价值量化。"></el-alert>
        <el-table :data="metrics" border size="small">
          <el-table-column prop="metric" label="指标" min-width="190"></el-table-column>
          <el-table-column label="未清洗 (C组)" width="150" align="right">
            <template slot-scope="s"><span class="raw">{{ fmt(s.row.rawVal) }}</span></template>
          </el-table-column>
          <el-table-column label="已清洗 (B组)" width="150" align="right">
            <template slot-scope="s"><span class="clean">{{ fmt(s.row.cleanVal) }}</span></template>
          </el-table-column>
          <el-table-column label="差异" width="130" align="right">
            <template slot-scope="s">
              <el-tag size="mini" v-if="diffOf(s.row) === null" type="info">—</el-tag>
              <el-tag size="mini" v-else :type="Math.abs(diffOf(s.row)) >= 5 ? 'danger' : (Math.abs(diffOf(s.row)) >= 1 ? 'warning' : 'success')">
                {{ diffOf(s.row) > 0 ? '+' : '' }}{{ diffOf(s.row) }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="说明" min-width="220">
            <template slot-scope="s"><span class="note">{{ noteOf(s.row.metric) }}</span></template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 三、两张对照图 -->
      <el-row :gutter="16" style="margin-bottom:16px;">
        <el-col :span="12">
          <el-card shadow="hover">
            <div slot="header"><span><i class="el-icon-share"></i> 流量入口分布对照（浏览会员数）</span></div>
            <div class="chart-note">未清洗时 '首页 ' / 'unknown' 会变成独立假入口，把真实入口的占比稀释掉。</div>
            <div id="ccEntryChart" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover">
            <div slot="header"><span><i class="el-icon-s-goods"></i> 品类 GMV 对照 TOP10</span></div>
            <div class="chart-note">金额单位混用（元/分）会让部分品类的 GMV 出现数量级虚高。</div>
            <div id="ccCatChart" class="chart-box"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 四、会员画像对照 -->
      <el-card shadow="hover" style="margin-bottom:16px;">
        <div slot="header">
          <span><i class="el-icon-user"></i> 会员画像维度对照</span>
          <span class="src">未清洗的 'M' / '男 ' / 'Vip' / 'WECHAT' 会多出假类别</span>
        </div>
        <el-table :data="memberProfile" border size="small" max-height="320">
          <el-table-column prop="dimType" label="维度" width="120"></el-table-column>
          <el-table-column prop="dimValue" label="维度值" min-width="150"></el-table-column>
          <el-table-column prop="rawCnt" label="未清洗" width="120" align="right"></el-table-column>
          <el-table-column prop="cleanCnt" label="已清洗" width="120" align="right"></el-table-column>
          <el-table-column label="差异" width="120" align="right">
            <template slot-scope="s">
              <span :class="Math.abs(pctOf(s.row.rawCnt, s.row.cleanCnt)) >= 5 ? 'raw' : ''">
                {{ pctOf(s.row.rawCnt, s.row.cleanCnt) > 0 ? '+' : '' }}{{ pctOf(s.row.rawCnt, s.row.cleanCnt) }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 五、DQC 数据质量体检单 -->
      <el-card shadow="hover">
        <div slot="header">
          <span><i class="el-icon-document-checked"></i> 数据质量稽核单（DQC）</span>
          <span class="src">数据来源：dqc_clean_audit（由 03_dwd_clean.hql 产出，11_export_dqc.sh 导出）</span>
        </div>
        <el-alert type="success" :closable="false" show-icon style="margin-bottom:12px;"
                  title="这是清洗过程的「体检单」"
                  description="每一类清洗动作命中了多少行、修改了什么、剔除了多少，全部可追溯。没有这张表，清洗就是黑盒 —— 有了它，数据质量才能被监控和复盘。"></el-alert>
        <el-table :data="dqRows" border size="small" max-height="420">
          <el-table-column prop="ruleCode" label="编号" width="90"></el-table-column>
          <el-table-column prop="tableName" label="来源表" width="180"></el-table-column>
          <el-table-column prop="ruleDesc" label="清洗规则" min-width="280"></el-table-column>
          <el-table-column prop="hitRows" label="命中行数" width="120" align="right">
            <template slot-scope="s">{{ fmt(s.row.hitRows) }}</template>
          </el-table-column>
          <el-table-column prop="runTime" label="跑批时间" width="170"></el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getCleanCompare, getDqAudit } from '@/api/pms_analysis.js'

/* 每个指标配一句"为什么会不一样"，答辩时照着念即可 */
const NOTES = {
  '入口页类别数': '未清洗时 首页/首页空格/unknown 各算一类，入口数量虚增',
  '漏斗·浏览会员数': '行为类型大小写没归一，部分行为被判为非法值丢掉',
  '漏斗·加购会员数': '入口页脏值让部分会员归不进任何入口，漏斗掉层',
  '漏斗·下单会员数': '重复上报的埋点未去重，会员数被放大',
  '漏斗·支付会员数': '状态越界(9)的订单未剔除，计入支付口径',
  '转化率>100%的异常行数': '脏数据导致下层不是上层子集，转化率算出超过 100%',
  'GMV合计(元)': '金额单位元/分混用未归一，GMV 出现数量级虚高',
  '商品品类数': '品类名带空格被当成两个品类',
  '好评率(%)': '评价内容乱码与空值未清理，好评率被稀释',
  '会话转化率(%)': '会话时间时区错乱导致跨月，转化率失真',
  '人工首响(秒)': '时间字符串格式不统一，首响时长算不出来或被拉偏',
  '地域覆盖城市数': '城市字段空值/带"市"字未归一，多为假城市',
  '会员画像维度值数': '性别/渠道/等级枚举不规范，多出 M、WECHAT、Vip 等假类别'
}

export default {
  name: 'AnalysisCleanCompare',
  data() {
    return {
      ready: false,
      metrics: [],
      entryPages: [],
      categories: [],
      memberProfile: [],
      dqRows: [],
      dqSummary: {},
      charts: []
    }
  },
  computed: {
    diffCount() {
      return this.metrics.filter(m => {
        const d = this.diffOf(m)
        return d !== null && Math.abs(d) >= 1
      }).length
    }
  },
  methods: {
    fmt(v) {
      if (v === null || v === undefined || v === '') return '-'
      const n = Number(v)
      if (isNaN(n)) return v
      return n.toLocaleString('zh-CN')
    },
    /* 相对差异百分比：以已清洗为基准 */
    diffOf(row) {
      const c = Number(row.cleanVal)
      const r = Number(row.rawVal)
      if (!c || isNaN(c) || isNaN(r)) return null
      return Math.round((r - c) * 1000 / Math.abs(c)) / 10
    },
    pctOf(rawV, cleanV) {
      const c = Number(cleanV)
      const r = Number(rawV)
      if (!c || isNaN(c) || isNaN(r)) return 0
      return Math.round((r - c) * 1000 / c) / 10
    },
    noteOf(metric) {
      return NOTES[metric] || ''
    },
    drawCharts() {
      // ── 入口页对照 ──
      const ep = this.entryPages || []
      this.renderChart('ccEntryChart', {
        legend: ['未清洗 (C组)', '已清洗 (B组)'],
        categories: ep.map(x => x.entryPage),
        series: [
          { name: '未清洗 (C组)', data: ep.map(x => Number(x.rawUv) || 0), color: '#EF9F27' },
          { name: '已清洗 (B组)', data: ep.map(x => Number(x.cleanUv) || 0), color: '#1D9E75' }
        ]
      })
      // ── 品类 GMV 对照（取已清洗侧 TOP10，再按同样顺序排未清洗） ──
      const cat = (this.categories || []).slice(0, 10)
      this.renderChart('ccCatChart', {
        legend: ['未清洗 (C组)', '已清洗 (B组)'],
        categories: cat.map(x => x.categoryName),
        series: [
          { name: '未清洗 (C组)', data: cat.map(x => Math.round(Number(x.rawGmv) || 0)), color: '#EF9F27' },
          { name: '已清洗 (B组)', data: cat.map(x => Math.round(Number(x.cleanGmv) || 0)), color: '#1D9E75' }
        ]
      })
    },
    renderChart(id, opt) {
      const el = document.getElementById(id)
      if (!el) return
      const inst = echarts.init(el)
      inst.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: opt.legend, top: 0, textStyle: { fontSize: 11 } },
        grid: { left: 10, right: 16, bottom: 46, top: 34, containLabel: true },
        xAxis: {
          type: 'category',
          data: opt.categories,
          axisLabel: { interval: 0, rotate: 30, fontSize: 11 }
        },
        yAxis: { type: 'value', name: '数值', nameTextStyle: { fontSize: 11 } },
        series: opt.series.map(s => ({
          name: s.name, type: 'bar', data: s.data, barMaxWidth: 22,
          itemStyle: { color: s.color, borderRadius: [3, 3, 0, 0] }
        }))
      })
      this.charts.push(inst)
    },
    load() {
      getCleanCompare().then(r => {
        const d = (r.data || {})
        this.ready = !!d.ready
        this.metrics = d.metrics || []
        this.entryPages = d.entryPages || []
        this.categories = d.categories || []
        this.memberProfile = d.memberProfile || []
        this.$nextTick(() => this.drawCharts())
      }).catch(() => { this.ready = false })

      getDqAudit().then(r => {
        const d = (r.data || {})
        this.dqRows = d.rows || []
        this.dqSummary = d.summary || {}
      }).catch(() => {})
    }
  },
  mounted() {
    this.load()
    this._onResize = () => this.charts.forEach(c => c.resize())
    window.addEventListener('resize', this._onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._onResize)
    this.charts.forEach(c => c.dispose())
    this.charts = []
  }
}
</script>

<style scoped>
.kpi { background: #f5f7fa; border-radius: 8px; padding: 14px 10px; text-align: center; }
.kpi-num { font-size: 22px; font-weight: 500; color: #303133; }
.kpi-num.ok { color: #67C23A; }
.kpi-num.warn { color: #E6A23C; }
.kpi-label { font-size: 12px; color: #909399; margin-top: 4px; }
.chart-box { width: 100%; height: 300px; }
.chart-note { font-size: 12px; color: #909399; margin-bottom: 6px; line-height: 1.6; }
.src { float: right; color: #909399; font-size: 12px; }
.raw { color: #E6A23C; font-weight: 500; }
.clean { color: #67C23A; font-weight: 500; }
.note { color: #909399; font-size: 12px; }
</style>
