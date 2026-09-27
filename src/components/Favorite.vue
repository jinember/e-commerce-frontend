<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-star-off"></i>收藏记录</span>
      </el-tab-pane>
    </el-tabs>
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" min-width="80"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" min-width="120"></el-table-column>
        <el-table-column prop="spuId" label="商品ID" min-width="120"></el-table-column>
        <el-table-column prop="createDate" label="收藏时间" min-width="120"></el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>
  </div>
</template>
<script>
import { list } from '@/api/pms_favorite.js'
export default {
  name: 'Favorite',
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