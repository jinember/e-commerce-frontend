<template>
  <div>
    <!-- 【1】页签 -->
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-wallet"></i>支付流水</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 【2】搜索区 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="订单号:">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable style="width:190px;"></el-input>
        </el-form-item>
        <el-form-item label="支付方式:">
          <el-select v-model="searchForm.payType" placeholder="请选择" clearable style="width:130px;">
            <el-option label="支付宝" value="支付宝"></el-option>
            <el-option label="微信支付" value="微信支付"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态:">
          <el-select v-model="searchForm.payStatus" placeholder="请选择" clearable style="width:130px;">
            <el-option label="待支付" :value="0"></el-option>
            <el-option label="已支付" :value="1"></el-option>
            <el-option label="已退款" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 【3】支付流水列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="orderId" label="订单号" min-width="120"></el-table-column>
        <el-table-column prop="payType" label="支付方式" min-width="120"></el-table-column>
        <el-table-column prop="payAmount" label="支付金额" min-width="120"></el-table-column>
        <el-table-column prop="payTime" label="支付时间" min-width="120"></el-table-column>
        <!-- 支付状态：库里存的是 0待支付/1已支付/2已退款，这里映射成文字，
             与上方筛选下拉的取值口径保持一致（原先直接输出数字，界面显示的是 1）。 -->
        <el-table-column label="支付状态" min-width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.payStatus==1 ? 'success'
                        : (scope.row.payStatus==0 ? 'warning' : 'info')">
              {{ scope.row.payStatus==0 ? '待支付'
                 : (scope.row.payStatus==1 ? '已支付' : '已退款') }}
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
import { list } from '@/api/pms_payment.js'
import { pickForm } from '@/utils/common.js'
export default {
  name: 'Payment',
  data() { return { searchForm: { orderNo:'', payType:'', payStatus:'' }, list: [], curPage: 1, pageSize: 10, totalCount: 0 } },
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
