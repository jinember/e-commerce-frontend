<template>
  <div class="app-container">
    <!-- 按项目约定：新增分析一律收进 Tab，不开新侧边栏菜单 -->
    <el-tabs v-model="tab" type="border-card">

      <el-tab-pane label="ETL 执行日志" name="log">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span><i class="el-icon-cpu"></i> 离线 ETL 任务执行日志</span>
            <span class="src">数据来源：tbl_etl_job_log（由 ETL 脚本运行结束后写入）</span>
          </div>

          <el-row :gutter="16" style="margin-bottom:14px;">
            <el-col :span="6"><div class="stat"><div class="stat-num">{{ stat.total }}</div><div class="stat-label">任务总数</div></div></el-col>
            <el-col :span="6"><div class="stat"><div class="stat-num ok">{{ stat.success }}</div><div class="stat-label">成功</div></div></el-col>
            <el-col :span="6"><div class="stat"><div class="stat-num fail">{{ stat.failed }}</div><div class="stat-label">失败</div></div></el-col>
            <el-col :span="6"><div class="stat"><div class="stat-num">{{ stat.rows }}</div><div class="stat-label">累计写入行数</div></div></el-col>
          </el-row>

          <el-alert v-if="empty" type="info" :closable="false" show-icon
                    title="暂无执行记录"
                    description="ETL 脚本运行结束后，向 tbl_etl_job_log 写一条记录（脚本名/命令/行数/耗时/状态），此处即可展示运行结果。"></el-alert>

          <template v-else>
            <el-table :data="rows" border size="small" max-height="480">
              <el-table-column prop="jobName" label="任务名" width="150"></el-table-column>
              <el-table-column prop="execPhase" label="阶段" width="100">
                <template slot-scope="s">
                  <el-tag size="mini" :type="s.row.execPhase==='IMPORT'?'warning':s.row.execPhase==='EXPORT'?'success':''">
                    {{ s.row.execPhase || '-' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="scriptPath" label="脚本" min-width="170" show-overflow-tooltip></el-table-column>
              <el-table-column prop="execCmd" label="执行命令" min-width="240" show-overflow-tooltip></el-table-column>
              <el-table-column prop="targetTables" label="写入表" min-width="160" show-overflow-tooltip></el-table-column>
              <el-table-column prop="startTime" label="开始时间" width="160"></el-table-column>
              <el-table-column prop="durationSec" label="耗时(秒)" width="90"></el-table-column>
              <el-table-column prop="rowsRead" label="读取行数" width="100"></el-table-column>
              <el-table-column prop="rowsWritten" label="写入行数" width="100"></el-table-column>
              <el-table-column prop="status" label="状态" width="90">
                <template slot-scope="s">
                  <el-tag size="mini" :type="s.row.status==='SUCCESS'?'success':s.row.status==='FAILED'?'danger':'info'">
                    {{ s.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-card>
      </el-tab-pane>

      <el-tab-pane name="dq">
        <span slot="label"><i class="el-icon-magic-stick"></i> 清洗与数据质量</span>
        <AnalysisCleanCompare />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
import { getJobLog } from '@/api/pms_analysis.js'
import AnalysisCleanCompare from '@/components/AnalysisCleanCompare.vue'

export default {
  name: 'EtlJobLog',
  components: { AnalysisCleanCompare },
  data() {
    return {
      // 支持 /etlJobLog?tab=dq 直接深链到质量页（截图/演示用）
      tab: (this.$route && this.$route.query && this.$route.query.tab) || 'log',
      rows: [],
      empty: false
    }
  },
  computed: {
    stat() {
      const rs = this.rows
      return {
        total: rs.length,
        success: rs.filter(x => x.status === 'SUCCESS').length,
        failed: rs.filter(x => x.status === 'FAILED').length,
        rows: rs.reduce((a, b) => a + (Number(b.rowsWritten) || 0), 0)
      }
    }
  },
  mounted() {
    getJobLog().then(r => {
      this.rows = ((r.data || {}).rows) || []
      this.empty = this.rows.length === 0
    }).catch(() => { this.empty = true })
  }
}
</script>

<style scoped>
.src { float: right; color: #909399; font-size: 12px; }
.stat { background: #f5f7fa; border-radius: 8px; padding: 12px 8px; text-align: center; }
.stat-num { font-size: 20px; font-weight: 500; color: #303133; }
.stat-num.ok { color: #67C23A; }
.stat-num.fail { color: #F56C6C; }
.stat-label { font-size: 12px; color: #909399; margin-top: 4px; }
</style>
