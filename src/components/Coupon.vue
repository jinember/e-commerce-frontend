<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-price-tag"></i> 优惠券管理</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 搜索栏 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="优惠券名称:">
          <el-input placeholder="请输入优惠券名称" v-model="searchForm.name" clearable
            @clear="doSearch" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="类型:">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width:140px;">
            <el-option label="满减券" value="满减券"></el-option>
            <el-option label="折扣券" value="折扣券"></el-option>
            <el-option label="无门槛券" value="无门槛券"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width:120px;">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="停用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="doSearch">查询</el-button>
          <el-button type="primary" @click="showAddBox">添加优惠券</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="name" label="券名" min-width="180"></el-table-column>
        <el-table-column label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="typeTag(scope.row.type)" size="small">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="面额" width="100">
          <template slot-scope="scope">¥{{ scope.row.value }}</template>
        </el-table-column>
        <el-table-column label="使用门槛" width="110">
          <template slot-scope="scope">
            <span v-if="!scope.row.minAmount || scope.row.minAmount===0">无门槛</span>
            <span v-else>满{{ scope.row.minAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="发行总量" width="90"></el-table-column>
        <el-table-column label="已领/剩余" width="110">
          <template slot-scope="scope">
            {{ scope.row.usedCount }} / {{ scope.row.totalCount - scope.row.usedCount }}
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="200">
          <template slot-scope="scope">
            <div style="font-size:12px;line-height:1.4;">
              <div>{{ scope.row.startTime }}</div>
              <div>至 {{ scope.row.endTime }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" active-color="#13ce66" inactive-color="#909399"
              :active-value="1" :inactive-value="0" @change="statusChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;">
      </el-pagination>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="600px" append-to-body>
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：满500减50"></el-input>
        </el-form-item>
        <el-form-item label="优惠券类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width:100%;" @change="onTypeChange">
            <el-option label="满减券" value="满减券"></el-option>
            <el-option label="折扣券" value="折扣券"></el-option>
            <el-option label="无门槛券" value="无门槛券"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="面额(元)" prop="value">
          <el-input-number v-model="form.value" :min="0.01" :precision="2" :step="10"
            controls-position="right" style="width:100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="使用门槛(元)" prop="minAmount">
          <el-input-number v-model="form.minAmount" :min="0" :precision="2" :step="100"
            controls-position="right" style="width:100%;"
            :disabled="form.type==='无门槛券'"></el-input-number>
        </el-form-item>
        <el-form-item label="发行总量" prop="totalCount">
          <el-input-number v-model="form.totalCount" :min="0" :step="100"
            controls-position="right" style="width:100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="有效期" prop="dateRange">
          <el-date-picker v-model="form.dateRange" type="daterange" value-format="yyyy-MM-dd"
            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
            style="width:100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="form.statusBool" active-color="#13ce66" inactive-color="#909399"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showFormBox=false">取消</el-button>
        <el-button type="primary" @click="saveData">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { list, add, update, remove } from '@/api/pms_coupon.js'
import { pickForm } from '@/utils/common.js'

export default {
  name: 'Coupon',
  data() {
    return {
      searchForm: { name: '', type: '', status: '' },
      list: [],
      curPage: 1,
      pageSize: 10,
      totalCount: 0,
      showFormBox: false,
      opMode: 'add',
      dialogTitle: '添加优惠券',
      form: {},
      rules: {
        name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择优惠券类型', trigger: 'change' }],
        value: [{ required: true, message: '请输入面额', trigger: 'blur' }],
        minAmount: [{ required: true, message: '请输入使用门槛', trigger: 'blur' }],
        totalCount: [{ required: true, message: '请输入发行总量', trigger: 'blur' }],
        dateRange: [{ required: true, message: '请选择有效期', trigger: 'change' }]
      }
    }
  },
  methods: {
    /* 类型对应的标签颜色 */
    typeTag(type) {
      if (type === '满减券') return 'warning'
      if (type === '折扣券') return 'success'
      return 'danger'
    },
    getList(searchForm, page) {
      this.curPage = page
      list(this.curPage, this.pageSize, searchForm).then(resp => {
        this.list = resp.data
        this.totalCount = resp.total
      })
    },
    doReset() { this.searchForm = { name: '', type: '', status: '' }; this.doSearch() },
    doSearch() { this.getList(pickForm(this.searchForm), 1) },
    reloadPage(p) { this.getList(pickForm(this.searchForm), p) },

    /* 列表上直接切换启用/停用 */
    statusChange(row) {
      update(row).then(() => {
        this.$message.success((row.status === 1 ? '已启用' : '已停用') + '【' + row.name + '】')
      })
    },

    showAddBox() {
      this.opMode = 'add'
      this.dialogTitle = '添加优惠券'
      this.form = {
        name: '', type: '满减券', value: 10, minAmount: 0,
        totalCount: 100, dateRange: [], statusBool: true
      }
      this.showFormBox = true
      this.$nextTick(() => { this.$refs.formRef && this.$refs.formRef.clearValidate() })
    },
    handleEdit(index, row) {
      this.opMode = 'edit'
      this.dialogTitle = '编辑优惠券：' + row.name
      this.form = Object.assign({}, row)
      this.form.statusBool = row.status === 1
      this.form.dateRange = [
        row.startTime ? row.startTime.substring(0, 10) : '',
        row.endTime ? row.endTime.substring(0, 10) : ''
      ]
      this.showFormBox = true
      this.$nextTick(() => { this.$refs.formRef && this.$refs.formRef.clearValidate() })
    },

    /* 切换类型：无门槛券强制门槛为 0 */
    onTypeChange(type) {
      if (type === '无门槛券') { this.form.minAmount = 0 }
    },

    saveData() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        let payload = Object.assign({}, this.form)
        if (payload.type === '无门槛券') { payload.minAmount = 0 }
        payload.startTime = payload.dateRange[0] + ' 00:00:00'
        payload.endTime = payload.dateRange[1] + ' 23:59:59'
        payload.status = payload.statusBool ? 1 : 0
        delete payload.dateRange
        delete payload.statusBool
        if (this.opMode === 'add') {
          payload.usedCount = 0
          add(payload).then(() => { this.onSaveSuccess('添加') })
        } else {
          update(payload).then(() => { this.onSaveSuccess('更新') })
        }
      })
    },
    onSaveSuccess(opType) {
      this.$message.success(opType + '优惠券成功')
      this.showFormBox = false
      this.getList(pickForm(this.searchForm), 1)
    },

    handleDelete(index, row) {
      this.$confirm('确认删除优惠券【' + row.name + '】吗？已领取的记录将保留。', '安全警告', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        remove(row.id).then(() => {
          this.$message.success('删除成功')
          this.getList(pickForm(this.searchForm), 1)
        })
      }).catch(() => {})
    }
  },
  mounted() { this.doSearch() }
}
</script>

<style scoped>
.el-button span { color:#fff; }
</style>
