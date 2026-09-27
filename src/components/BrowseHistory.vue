<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-time"></i>浏览历史</span>
      </el-tab-pane>
    </el-tabs>
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" min-width="80"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" min-width="120"></el-table-column>
        <el-table-column prop="spuId" label="商品ID" min-width="80"></el-table-column>
        <el-table-column prop="browseTime" label="浏览时间" min-width="160"></el-table-column>
        <el-table-column prop="stayDuration" label="停留时长(秒)" min-width="120"></el-table-column>
      </el-table>
      <el-pagination background style="margin-top:15px;text-align:left" @current-change="load" :current-page="page" :page-size="limit" :total="total" layout="prev, pager, next"></el-pagination>
    </el-card>
  </div>
</template>
<script>
import { list } from '@/api/pms_browseHistory.js'
export default {
  data(){ return { list:[], total:0, page:1, limit:10 } },
  created(){ this.load() },
  methods:{
    load(p){ if(p) this.page=p; list(this.page,this.limit,{}).then(r=>{ this.list=r.data||[]; this.total=r.total||0; }) }
  }
}
</script>
