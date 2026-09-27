<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-office-building"></i> 供应商管理</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 搜索栏 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="供应商名称:">
          <el-input placeholder="请输入供应商名称" v-model="searchForm.name" clearable
            @clear="doSearch" style="width:200px;"></el-input>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width:130px;">
            <el-option label="合作中" :value="1"></el-option>
            <el-option label="已停用" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="doSearch">查询</el-button>
          <el-button type="primary" @click="showAddBox">添加供应商</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="name" label="供应商名" min-width="180"></el-table-column>
        <el-table-column prop="contact" label="联系人" min-width="110"></el-table-column>
        <el-table-column prop="phone" label="联系电话" min-width="140"></el-table-column>
        <el-table-column prop="address" label="地址" min-width="220"></el-table-column>
        <el-table-column label="状态" width="90">
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
        <el-form-item label="供应商名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入供应商公司名称"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contact">
          <el-input v-model="form.contact" placeholder="请输入对接人姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="手机号或固话，例如 13800138000"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入供应商详细地址"></el-input>
        </el-form-item>
        <el-form-item label="是否合作">
          <el-switch v-model="form.statusBool" active-color="#13ce66" inactive-color="#909399"
            active-text="合作中" inactive-text="已停用">
          </el-switch>
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
import { list, add, update, remove } from '@/api/pms_supplier.js'
import { pickForm } from '@/utils/common.js'

export default {
  name: 'Supplier',
  data() {
    /* 手机号或固话校验（非必填，填了就要合法） */
    const checkPhone = (rule, value, callback) => {
      if (!value) return callback()
      const mobile = /^1[3-9]\d{9}$/
      const tel = /^0\d{2,3}-?\d{7,8}$/
      if (mobile.test(value) || tel.test(value)) return callback()
      return callback(new Error('请输入正确的手机号或固话'))
    }
    return {
      searchForm: { name: '', status: '' },
      list: [],
      curPage: 1,
      pageSize: 10,
      totalCount: 0,
      showFormBox: false,
      opMode: 'add',
      dialogTitle: '添加供应商',
      form: {},
      rules: {
        name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
        contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        phone: [{ required: true, validator: checkPhone, trigger: 'blur' }]
      }
    }
  },
  methods: {
    getList(searchForm, page) {
      this.curPage = page
      list(this.curPage, this.pageSize, searchForm).then(resp => {
        this.list = resp.data
        this.totalCount = resp.total
      })
    },
    doReset() { this.searchForm = { name: '', status: '' }; this.doSearch() },
    doSearch() { this.getList(pickForm(this.searchForm), 1) },
    reloadPage(p) { this.getList(pickForm(this.searchForm), p) },

    statusChange(row) {
      update(row).then(() => {
        this.$message.success((row.status === 1 ? '已恢复合作' : '已停用') + '【' + row.name + '】')
      })
    },

    showAddBox() {
      this.opMode = 'add'
      this.dialogTitle = '添加供应商'
      this.form = { name: '', contact: '', phone: '', address: '', statusBool: true }
      this.showFormBox = true
      this.$nextTick(() => { this.$refs.formRef && this.$refs.formRef.clearValidate() })
    },
    handleEdit(index, row) {
      this.opMode = 'edit'
      this.dialogTitle = '编辑供应商：' + row.name
      this.form = Object.assign({}, row)
      this.form.statusBool = row.status === 1
      this.showFormBox = true
      this.$nextTick(() => { this.$refs.formRef && this.$refs.formRef.clearValidate() })
    },

    saveData() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        let payload = Object.assign({}, this.form)
        payload.status = payload.statusBool ? 1 : 0
        delete payload.statusBool
        if (this.opMode === 'add') {
          add(payload).then(() => { this.onSaveSuccess('添加') })
        } else {
          update(payload).then(() => { this.onSaveSuccess('更新') })
        }
      })
    },
    onSaveSuccess(opType) {
      this.$message.success(opType + '供应商成功')
      this.showFormBox = false
      this.getList(pickForm(this.searchForm), 1)
    },

    handleDelete(index, row) {
      this.$confirm('确认删除供应商【' + row.name + '】吗？删除后不影响历史库存与订单记录。', '安全警告', {
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
