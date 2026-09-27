<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-coin"></i>积分流水</span>
      </el-tab-pane>
    </el-tabs>
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" min-width="80"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" min-width="120"></el-table-column>
        <el-table-column prop="changeType" label="变动类型" min-width="100" :formatter="fmtChangeType"></el-table-column>
        <el-table-column prop="points" label="变动积分" min-width="100"></el-table-column>
        <el-table-column prop="balance" label="剩余积分" min-width="100"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
        <el-table-column prop="createDate" label="时间" min-width="120"></el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>
  </div>
</template>
<script>
import { list } from '@/api/pms_pointLog.js'
export default {
  name: 'PointLog',
  data() { return { list: [], curPage: 1, pageSize: 10, totalCount: 0 } },
  methods: {
    fmtChangeType(row, column, cellValue) {
      const m = { add: '加积分', subtract: '减积分' }
      return m[cellValue] || cellValue
    },
    getList(page) {
      this.curPage = page
      list(this.curPage, this.pageSize, {}).then(resp => {
        this.list = resp.data
        this.totalCount = resp.total
      })
    },
    reloadPage(p) { this.getList(p) }
  },
  mounted() { this.getList(1) }
}
</script>
<style scoped>
.el-button span { color:#fff; }
</style>