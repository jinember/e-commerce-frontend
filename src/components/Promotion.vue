<template>
  <div>
    <!-- 【1】页签标题 -->
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-sell"></i>促销活动</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 【2】搜索 / 新增 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="活动名:">
          <el-input placeholder="请输入活动名" v-model="searchForm.name" clearable style="width:180px;"></el-input>
        </el-form-item>
        <el-form-item label="类型:">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width:150px;">
            <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="doSearch">查询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddBox">新增活动</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 【3】活动列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="name" label="活动名" min-width="150"></el-table-column>
        <el-table-column prop="type" label="类型" width="120"></el-table-column>
        <el-table-column label="折扣" width="90">
          <template slot-scope="scope">
            <span style="color:#F56C6C;font-weight:bold;">{{ (scope.row.discount*10).toFixed(1) }} 折</span>
          </template>
        </el-table-column>
        <!-- 【营销联动】活动挂在哪件商品上，留空=全场 -->
        <el-table-column label="关联商品" width="160">
          <template slot-scope="scope">
            <span v-if="scope.row.spuId">{{ goodsNameOf(scope.row.spuId) }}</span>
            <span v-else style="color:#67C23A;">全场活动</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160"></el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="160"></el-table-column>
        <el-table-column label="生效状态" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
              active-color="#13ce66" inactive-color="#909399"
              @change="saveRow(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top:8px;color:#909399;font-size:12px;">
        提示：活动的生效范围按「当前时间落在起止时间内 + 状态启用」判断，
        <b>关联商品留空表示全场商品都参与</b>；保存后 C 端商城列表与详情页会立刻显示活动价。
      </div>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>

    <!-- 【4】新增 / 编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="50%">
      <el-form :model="form" label-width="110px">
        <el-form-item label="活动名称">
          <el-input v-model="form.name" placeholder="例如：黑鲨5 Pro 限时秒杀"></el-input>
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="form.type" style="width:100%;">
            <el-option v-for="t in typeOptions" :key="t" :label="t" :value="t"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="折扣率">
          <el-input-number v-model="form.discount" :min="0.01" :max="1" :step="0.05" :precision="2"></el-input-number>
          <span style="margin-left:10px;color:#909399;font-size:12px;">
            0.75 = 7.5 折，保存后商品按原价 × 折扣率计价
          </span>
        </el-form-item>
        <!-- 【营销联动】关联商品下拉：留空=全场 -->
        <el-form-item label="关联商品">
          <el-select v-model="form.spuId" filterable clearable placeholder="留空=全场活动" style="width:100%;">
            <el-option v-for="g in goodsOptions" :key="g.id" :label="g.goodsName" :value="g.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="开始时间"
            value-format="yyyy-MM-dd HH:mm:ss" style="width:240px;"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss" style="width:240px;"></el-date-picker>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showFormBox=false">取消</el-button>
        <el-button type="primary" @click="saveData">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { list, add, update, remove } from '@/api/pms_promotion.js'
import { getSpuList } from '@/api/pms_goods.js'

export default {
  name: 'Promotion',
  data() {
    return {
      list: [], curPage: 1, pageSize: 10, totalCount: 0,
      searchForm: { name: '', type: '' },
      typeOptions: ['限时折扣', '拼团活动', '新用户专享', '清仓特卖', '秒杀活动', '满减活动'],
      goodsOptions: [],          /* 供下拉选择的下商品列表 */
      showFormBox: false, dialogTitle: '', isEdit: false,
      form: { id: null, name: '', type: '', discount: 0.9, spuId: null, startTime: '', endTime: '', status: 1 }
    }
  },
  methods: {
    getList(page) {
      this.curPage = page
      list(this.curPage, this.pageSize, this.searchForm).then(resp => {
        this.list = resp.data || []
        this.totalCount = resp.total || 0
      })
    },
    reloadPage(p) { this.getList(p) },
    doSearch() { this.getList(1) },
    doReset() { this.searchForm = { name: '', type: '' }; this.getList(1) },

    /* 下拉里显示「ID - 商品名」，方便核对 */
    loadGoods() {
      getSpuList(1, 200, {}).then(resp => {
        this.goodsOptions = resp.data || []
      }).catch(() => { this.goodsOptions = [] })
    },
    goodsNameOf(spuId) {
      let g = this.goodsOptions.find(x => x.id === spuId)
      return g ? (g.id + ' - ' + g.goodsName) : ('SPU#' + spuId)
    },

    showAddBox() {
      this.isEdit = false
      this.dialogTitle = '新增活动'
      this.form = { id: null, name: '', type: '限时折扣', discount: 0.9, spuId: null, startTime: '', endTime: '', status: 1 }
      this.showFormBox = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑活动'
      /* 深拷贝，避免弹窗里改动直接反映到表格（取消后脏了表格） */
      this.form = JSON.parse(JSON.stringify(row))
      if (this.form.spuId === undefined) this.form.spuId = null
      this.showFormBox = true
    },
    saveData() {
      if (!this.form.name) { this.$message.warning('请填写活动名称'); return }
      let done = () => {
        this.$message.success('保存成功，C 端商城已同步')
        this.showFormBox = false
        this.getList(this.curPage)
      }
      if (this.isEdit) update(this.form).then(done)
      else add(this.form).then(done)
    },
    saveRow(row) { update(row).then(() => this.$message.success('状态已更新')) },
    handleDelete(row) {
      this.$confirm('确定删除活动「' + row.name + '」？', '提示', { type: 'warning' })
        .then(() => { remove(row.id).then(() => { this.$message.success('已删除'); this.getList(this.curPage) }) })
        .catch(() => {})
    }
  },
  mounted() { this.getList(1); this.loadGoods() }
}
</script>

<style scoped>
.el-button span { color:#fff; }
</style>
