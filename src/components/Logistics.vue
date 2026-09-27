<template>
  <div>
    <!-- 【1】页签 -->
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-truck"></i>物流信息</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 【2】搜索区 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="订单号:">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width:190px;"></el-input>
        </el-form-item>
        <el-form-item label="快递公司:">
          <el-input v-model="searchForm.company" placeholder="请输入快递公司" clearable style="width:170px;"></el-input>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width:130px;">
            <el-option label="运输中" :value="1"></el-option>
            <el-option label="已签收" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 【3】物流信息列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="orderId" label="订单号" min-width="120"></el-table-column>
        <el-table-column prop="company" label="快递公司" min-width="120"></el-table-column>
        <el-table-column prop="trackingNo" label="运单号" min-width="120"></el-table-column>
        <el-table-column prop="province" label="省" min-width="90"></el-table-column>
        <el-table-column prop="city" label="市" min-width="90"></el-table-column>
        <el-table-column prop="shipTime" label="发货时间" min-width="120"></el-table-column>
        <el-table-column prop="receiveTime" label="收货时间" min-width="120"></el-table-column>
        <el-table-column label="状态" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status==2?'success':'warning'">
              {{ scope.row.status==2?'已签收':'运输中' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>
  </div>
</template>
<script>
import { list } from '@/api/pms_logistics.js'
import { pickForm } from '@/utils/common.js'
export default {
  name: 'Logistics',
  data() { return { searchForm: { orderNo:'', company:'', status:'' }, list: [], curPage: 1, pageSize: 10, totalCount: 0 } },
  methods: {
    getList(page) {
      this.curPage = page
      list(this.curPage, this.pageSize, pickForm(this.searchForm)).then(resp => {
        this.list = resp.data
        this.totalCount = resp.total
      })
    },
    doReset(){ this.searchForm = {}; this.onSearch(); },
    onSearch(){ this.getList(1); },
    reloadPage(p) { this.getList(p) }
  },
  mounted() { this.getList(1) }
}
</script>
<style scoped>
.el-button span { color:#fff; }
</style>
