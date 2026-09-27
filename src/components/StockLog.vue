<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-files"></i>出入库流水</span>
      </el-tab-pane>
    </el-tabs>
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true">
        <el-form-item>
          <el-button type="primary" icon="el-icon-plus" @click="showAdd">录入出入库</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column label="商品" min-width="160">
          <template slot-scope="scope">{{ stockName(scope.row.stockId) }}</template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template slot-scope="scope">
            <el-tag :type="scope.row.changeType==='out' ? 'danger' : 'success'" size="small">
              {{ scope.row.changeType==='out' ? '出库' : '入库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="90"></el-table-column>
        <el-table-column label="供应商" min-width="130">
          <template slot-scope="scope">{{ supplierName(scope.row.supplierId) }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="130"></el-table-column>
        <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
        <el-table-column prop="createDate" label="时间" width="150"></el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>

    <el-dialog title="录入出入库" :visible.sync="showFormBox" width="45%">
      <el-form :model="form" ref="formRef" label-width="90px">
        <el-form-item label="库存商品" prop="stockId">
          <el-select v-model="form.stockId" placeholder="选择库存记录" filterable style="width:100%">
            <el-option v-for="s in stockOptions" :key="s.id"
              :label="s.goodsName + ' / ' + s.skuSpec + '（现存' + s.stock + '）'" :value="s.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="changeType">
          <el-radio-group v-model="form.changeType">
            <el-radio label="in">入库</el-radio>
            <el-radio label="out">出库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId" v-if="form.changeType==='in'">
          <el-select v-model="form.supplierId" placeholder="选择供应商" style="width:100%">
            <el-option v-for="sup in supplierOptions" :key="sup.id" :label="sup.name" :value="sup.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" placeholder="备注"></el-input>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="form.operator" placeholder="自动取当前登录人" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showFormBox=false">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { list, add } from '@/api/pms_stockLog.js'
import { allStocks } from '@/api/pms_stock.js'
import { allSuppliers } from '@/api/pms_supplier.js'
export default {
  name: 'StockLog',
  data() {
    return {
      list: [], curPage: 1, pageSize: 10, totalCount: 0,
      showFormBox: false,
      form: { stockId: null, changeType: 'in', quantity: 1, supplierId: null, remark: '', operator: '' },
      stockOptions: [], supplierOptions: []
    }
  },
  methods: {
    getList(page) {
      this.curPage = page
      list(this.curPage, this.pageSize, {}).then(resp => {
        this.list = resp.data
        this.totalCount = resp.total
      })
    },
    reloadPage(p) { this.getList(p) },
    stockName(id) {
      let s = this.stockOptions.find(x => x.id === id)
      return s ? (s.goodsName + ' / ' + s.skuSpec) : ('库存#' + id)
    },
    supplierName(id) {
      if (!id) return '-'
      let s = this.supplierOptions.find(x => x.id === id)
      return s ? s.name : ('供应商#' + id)
    },
    showAdd() {
      this.form = { stockId: null, changeType: 'in', quantity: 1, supplierId: null, remark: '', operator: window.localStorage.getItem('adminUser') || '' }
      this.showFormBox = true
    },
    save() {
      if (!this.form.stockId) { this.$message.warning('请选择库存商品'); return }
      if (!this.form.quantity || this.form.quantity < 1) { this.$message.warning('数量至少为1'); return }
      add(this.form).then(() => {
        this.$message.success(this.form.changeType === 'out' ? '出库成功' : '入库成功，库存已更新')
        this.showFormBox = false
        this.getList(this.curPage)
        // 刷新库存下拉（现存数量已变）
        allStocks().then(r => { this.stockOptions = r.data || [] })
      }).catch(err => {
        this.$message.error((err && err.message) || '操作失败')
      })
    }
  },
  mounted() {
    this.getList(1)
    allStocks().then(r => { this.stockOptions = r.data || [] })
    allSuppliers().then(r => { this.supplierOptions = r.data || [] })
  }
}
</script>
<style scoped>
.el-button span { color:#fff; }
</style>
