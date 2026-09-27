<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-location"></i>收货地址</span>
      </el-tab-pane>
    </el-tabs>
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" min-width="80"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" min-width="120"></el-table-column>
        <el-table-column prop="receiver" label="收货人" min-width="100"></el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="130"></el-table-column>
        <el-table-column label="地址" min-width="200">
          <template slot-scope="s">{{ s.row.province }} {{ s.row.city }} {{ s.row.district }} {{ s.row.detail }}</template>
        </el-table-column>
        <el-table-column prop="isDefault" label="默认" min-width="80">
          <template slot-scope="s">
            <el-tag size="mini" :type="s.row.isDefault==1?'success':''">{{ s.row.isDefault==1?'是':'否' }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>
  </div>
</template>
<script>
import { list } from '@/api/pms_address.js'
export default {
  name: 'Address',
  data() { return { list: [], curPage: 1, pageSize: 10, totalCount: 0 } },
  methods: {
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
