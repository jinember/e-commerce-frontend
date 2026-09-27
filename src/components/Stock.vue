<template>
  <div>
    <!-- 【1】页签标题 -->
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-box"></i>库存管理</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 【2】搜索区 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="商品名称:">
          <el-input placeholder="请输入商品名称" v-model="searchForm.goodsName" clearable style="width:180px;"></el-input>
        </el-form-item>
        <el-form-item label="仓库:">
          <el-select v-model="searchForm.warehouse" placeholder="全部" clearable style="width:140px;">
            <el-option label="主仓库" value="主仓库"></el-option>
            <el-option label="配件仓" value="配件仓"></el-option>
            <el-option label="华东仓" value="华东仓"></el-option>
            <el-option label="华南仓" value="华南仓"></el-option>
            <el-option label="华北仓" value="华北仓"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="doSearch">查询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddBox">新增库存商品</el-button>
          <el-button type="warning" icon="el-icon-bell" @click="showWarning">库存预警</el-button>
          <el-button type="success" icon="el-icon-edit-outline" @click="showCheckBox">库存盘点</el-button>
          <el-button type="success" icon="el-icon-download" @click="showBatchIn">批量入库</el-button>
          <el-button type="danger" icon="el-icon-delete" @click="batchDel">批量删除</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 【3】库存列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="stockList" border height="450" style="width:100%" @selection-change="onSelectChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="id" label="编号" width="70"></el-table-column>
        <el-table-column prop="goodsName" label="商品名称" min-width="140"></el-table-column>
        <el-table-column prop="skuSpec" label="SKU规格" min-width="130"></el-table-column>
        <el-table-column prop="warehouse" label="所在仓库" width="90"></el-table-column>
        <el-table-column label="库存数量(可直接改)" width="170">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.stock" :min="0" size="mini" controls-position="right" style="width:130px;"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="预警阈值" width="150">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.safeStock" :min="0" size="mini" controls-position="right" style="width:110px;"></el-input-number>
          </template>
        </el-table-column>
        <el-table-column label="供应商" min-width="110">
          <template slot-scope="scope">{{ supplierName(scope.row.supplierId) }}</template>
        </el-table-column>
        <el-table-column label="库存状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="stockTag(scope.row)" size="small">{{ stockText(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">调库存</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>

    <!-- 【4】新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="50%">
      <el-form :model="stockForm" ref="stockFormRef" :rules="rules" label-width="100px">
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="stockForm.goodsName" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="SKU规格" prop="skuSpec">
          <el-input v-model="stockForm.skuSpec" placeholder="如: 黑色/128G"></el-input>
        </el-form-item>
        <el-form-item label="所在仓库">
          <el-select v-model="stockForm.warehouse">
            <el-option label="主仓库" value="主仓库"></el-option>
            <el-option label="配件仓" value="配件仓"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number v-model="stockForm.stock" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="预警阈值">
          <el-input-number v-model="stockForm.safeStock" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="供应商">
          <el-select v-model="stockForm.supplierId" placeholder="选择供应商" clearable style="width:100%">
            <el-option v-for="sup in supplierOptions" :key="sup.id" :label="sup.name" :value="sup.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showFormBox=false">取消</el-button>
        <el-button type="primary" @click="saveData">确定</el-button>
      </span>
    </el-dialog>

    <!-- 【5】库存预警弹窗 -->
    <el-dialog title="库存预警（低于安全库存）" :visible.sync="showWarnBox" width="70%">
      <el-table :data="warnList" border size="small">
        <el-table-column prop="goodsName" label="商品名称" min-width="150"></el-table-column>
        <el-table-column prop="skuSpec" label="SKU规格" min-width="120"></el-table-column>
        <el-table-column prop="stock" label="当前库存" width="90"></el-table-column>
        <el-table-column prop="safeStock" label="安全库存" width="90"></el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="scope.row.stock === 0 ? 'danger' : 'warning'" size="small">
              {{ scope.row.stock === 0 ? '缺货' : '偏低' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 【7】批量入库弹窗：上传Excel -->
    <el-dialog title="批量入库（上传Excel）" :visible.sync="batchInVisible" width="50%">
      <el-alert title="Excel格式：第一行表头，从第二行开始，第一列商品ID，第二列入库数量" type="info" :closable="false" style="margin-bottom:10px;"></el-alert>
      <el-upload action="#" :auto-upload="false" :show-file-list="true" :on-change="onExcelChange" accept=".xlsx,.xls">
        <el-button size="small" type="primary" icon="el-icon-upload">选择Excel文件</el-button>
      </el-upload>
      <span slot="footer">
        <el-button @click="batchInVisible=false">取消</el-button>
        <el-button type="primary" @click="doImportExcel" :loading="importing">开始导入</el-button>
      </span>
    </el-dialog>

    <!-- 【6】库存盘点弹窗 -->
    <el-dialog title="库存盘点" :visible.sync="showCheck" width="40%">
      <el-form label-width="100px">
        <el-form-item label="选择商品">
          <el-select v-model="checkForm.id" filterable placeholder="选择要盘点的库存" style="width:100%">
            <el-option v-for="s in stockList" :key="s.id"
              :label="s.goodsName + ' ' + s.skuSpec + '（账面' + s.stock + '）'" :value="s.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="实盘数量">
          <el-input-number v-model="checkForm.actualStock" :min="0"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showCheck=false">取消</el-button>
        <el-button type="primary" @click="doCheck">提交盘点</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { list, addStock, updateStock, deleteStock, batchUpdate, warningList, stockCheck, batchDelete, importExcel } from '@/api/pms_stock.js'
import { allSuppliers } from '@/api/pms_supplier.js'

export default {
  name: 'Stock',
  data() {
    return {
      searchForm: { goodsName: '', warehouse: '' },
      showFormBox: false,
      opMode: 'add',
      dialogTitle: '',
      stockForm: {},
      rules: {
        goodsName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        skuSpec: [{ required: true, message: '请输入SKU规格', trigger: 'blur' }]
      },
      stockList: [],
      curPage: 1,
      pageSize: 10,
      totalCount: 0,
      supplierOptions: [],
      selectedRows: [],
      showWarnBox: false,
      warnList: [],
      showCheck: false,
      batchInVisible: false,
      excelFile: null,
      importing: false,
      checkForm: { id: null, actualStock: 0 }
    }
  },
  methods: {
    supplierName(id) {
      if (!id) return '-'
      let s = this.supplierOptions.find(x => x.id === id)
      return s ? s.name : ('供应商#' + id)
    },
    stockText(row) {
      if (row.stock === 0) return '缺货'
      return row.stock <= row.safeStock ? '偏低' : '充足'
    },
    stockTag(row) {
      if (row.stock === 0) return 'danger'
      return row.stock <= row.safeStock ? 'warning' : 'success'
    },
    getStockList(param, page) {
      this.curPage = page
      list(this.curPage, this.pageSize, param).then(resp => {
        this.stockList = resp.data
        this.totalCount = resp.total
      })
    },
    doReset() { this.searchForm = { goodsName: '', warehouse: '' }; this.doSearch() },
    doSearch() { this.getStockList(this.searchForm, 1) },
    reloadPage(newPage) { this.getStockList(this.searchForm, newPage) },
    onSelectChange(rows) { this.selectedRows = rows },
    showAddBox() {
      this.opMode = 'add'; this.dialogTitle = '新增库存商品'
      this.stockForm = { goodsName: '', skuSpec: '', warehouse: '主仓库', stock: 0, safeStock: 50 }
      this.showFormBox = true
    },
    handleEdit(i, row) {
      this.opMode = 'edit'; this.dialogTitle = '调整库存'
      this.stockForm = { ...row }
      this.showFormBox = true
    },
    saveData() {
      if (this.opMode === 'add') {
        addStock(this.stockForm).then(() => {
          this.$message('新增成功'); this.showFormBox = false; this.doSearch()
        })
      } else {
        updateStock(this.stockForm).then(() => {
          this.$message('库存已更新'); this.showFormBox = false; this.doSearch()
        })
      }
    },
    handleDelete(i, row) {
      this.$confirm(`确认删除【${row.goodsName} ${row.skuSpec}】库存记录吗?`, '提示', { type: 'warning' })
        .then(() => {
          deleteStock(row.id).then(() => {
            this.$message('删除成功'); this.doSearch()
          })
        }).catch(() => {})
    },
    /* 批量保存勾选行的修改 */
    batchSave() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请先勾选要保存的行'); return
      }
      batchUpdate(this.selectedRows).then(resp => {
        this.$message.success(resp.msg || '批量保存成功')
        this.doSearch()
      })
    },
    /* 库存预警列表 */
    showWarning() {
      warningList().then(resp => {
        this.warnList = resp.data || []
        this.showWarnBox = true
      })
    },
    /* 盘点 */
    showCheckBox() {
      this.checkForm = { id: null, actualStock: 0 }
      this.showCheck = true
    },
    doCheck() {
      if (!this.checkForm.id) { this.$message.warning('请选择商品'); return }
      stockCheck(this.checkForm.id, this.checkForm.actualStock).then(resp => {
        this.$message.success(resp.msg || '盘点完成')
        this.showCheck = false
        this.doSearch()
      })
    },
    batchDel() {
      if (this.selectedRows.length === 0) { this.$message.warning('请先勾选要删除的行'); return }
      this.$confirm(`确认删除勾选的 ${this.selectedRows.length} 条库存记录吗?`, '提示', { type: 'warning' })
        .then(() => {
          batchDelete(this.selectedRows.map(r => r.id)).then(resp => {
            this.$message.success(resp.msg || '删除成功')
            this.doSearch()
          })
        }).catch(() => {})
    },
    showBatchIn() {
      this.excelFile = null
      this.batchInVisible = true
    },
    onExcelChange(file) {
      this.excelFile = file.raw
    },
    doImportExcel() {
      if (!this.excelFile) { this.$message.warning('请先选择Excel文件'); return }
      this.importing = true
      const fd = new FormData()
      fd.append('file', this.excelFile)
      importExcel(fd).then(resp => {
        this.$message.success(resp.msg || '导入完成')
        this.importing = false
        this.batchInVisible = false
        this.doSearch()
      }).catch(() => { this.importing = false })
    }
  },
  mounted() {
    this.doSearch()
    allSuppliers().then(r => { this.supplierOptions = r.data || [] })
  }
}
</script>

<style scoped>
.el-button span { color:#fff; }
</style>
