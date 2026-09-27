<template>
  <div>
    <!-- 【1】页签 -->
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-refresh-left"></i>退款售后</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 【2】搜索区 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="订单号:">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width:190px;"></el-input>
        </el-form-item>
        <el-form-item label="退款原因:">
          <el-input v-model="searchForm.reason" placeholder="请输入退款原因" clearable style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width:130px;">
            <el-option label="待审核" :value="0"></el-option>
            <el-option label="已退款" :value="1"></el-option>
            <el-option label="已拒绝" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 【3】退款售后列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="orderId" label="订单号" min-width="120"></el-table-column>
        <el-table-column prop="reason" label="退款原因" min-width="150"></el-table-column>
        <el-table-column prop="amount" label="退款金额" min-width="100"></el-table-column>
        <el-table-column label="状态" min-width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status==0?'warning':scope.row.status==1?'success':'danger'">
              {{ scope.row.status==0?'待审核':scope.row.status==1?'已退款':'已拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" min-width="160"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" type="success" v-if="scope.row.status==0" @click="approve(scope.row)">同意退款</el-button>
            <el-button size="mini" type="danger" v-if="scope.row.status==0" @click="reject(scope.row)">拒绝退款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>
  </div>
</template>
<script>
import { list } from '@/api/pms_refund.js'
import request from '@/network/request.js'
import { pickForm } from '@/utils/common.js'
export default {
  name: 'Refund',
  data() { return { searchForm: { orderNo:'', reason:'', status:'' }, list: [], curPage: 1, pageSize: 10, totalCount: 0 } },
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
    reloadPage(p) { this.getList(p) },
    approve(row) {
      this.$confirm('确认同意退款？将执行库存回滚、支付回退等操作', '提示', { type: 'warning' })
        .then(() => {
          request.post('/Refund/approve/' + row.id).then(resp => {
            if (resp && resp.result === 'success') {
              this.$message.success('退款成功')
              this.getList(this.curPage)
            } else {
              this.$message.error((resp && resp.cause) || '退款失败')
            }
          }).catch(() => {})
        }).catch(() => {})
    },
    reject(row) {
      this.$confirm('确认拒绝该退款申请？', '提示', { type: 'warning' })
        .then(() => {
          request.post('/Refund/reject/' + row.id).then(resp => {
            if (resp && resp.result === 'success') {
              this.$message.success('已拒绝退款申请')
              this.getList(this.curPage)
            } else {
              this.$message.error((resp && resp.cause) || '操作失败')
            }
          }).catch(() => {})
        }).catch(() => {})
    }
  },
  mounted() { this.getList(1) }
}
</script>
<style scoped>
.el-button span { color:#fff; }
</style>
