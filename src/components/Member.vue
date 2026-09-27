<template>
  <div>
    <!-- 【1】页签标题 -->
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-medal"></i>会员管理</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 【0】顶部统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:10px; margin-top:10px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">会员总数</div>
          <div class="stat-value" style="color:#409EFF;">{{ statData.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">黑名单会员</div>
          <div class="stat-value" style="color:#F56C6C;">{{ statData.blackCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">普通会员</div>
          <div class="stat-value" style="color:#67C23A;">{{ statData.normalCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-label">黄金会员</div>
          <div class="stat-value" style="color:#E6A23C;">{{ statData.goldCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 【2】搜索区 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="会员ID:">
          <el-input placeholder="请输入会员ID" v-model="searchForm.id" clearable style="width:150px;"></el-input>
        </el-form-item>
        <el-form-item label="昵称:">
          <el-input placeholder="请输入昵称" v-model="searchForm.nickname" clearable style="width:160px;"></el-input>
        </el-form-item>
        <el-form-item label="手机号:">
          <el-input placeholder="请输入手机号" v-model="searchForm.phone" clearable style="width:160px;"></el-input>
        </el-form-item>
        <el-form-item label="等级:">
          <el-select v-model="searchForm.level" placeholder="请选择" clearable style="width:130px;">
            <el-option label="普通会员" value="普通会员"></el-option>
            <el-option label="白银会员" value="白银会员"></el-option>
            <el-option label="黄金会员" value="黄金会员"></el-option>
            <el-option label="钻石会员" value="钻石会员"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="doSearch">查询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddBox">添加会员</el-button>
          <el-button type="success" icon="el-icon-download" @click="exportCsv">导出CSV</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 【3】会员列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <div style="margin-bottom:10px;">
        <el-button type="success" size="mini" :disabled="selected.length===0" @click="batchUpdateStatus(1)">批量启用</el-button>
        <el-button type="danger" size="mini" :disabled="selected.length===0" @click="batchUpdateStatus(0)">批量禁用</el-button>
        <el-button type="danger" size="mini" :disabled="selected.length===0" @click="batchDelete">批量删除</el-button>
        <span v-if="selected.length" style="margin-left:10px;color:#909399;">已选 {{ selected.length }} 项</span>
      </div>
      <el-table :data="memberList" border height="450" style="width:100%" @selection-change="onSelect">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="id" label="编号" width="60"></el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="100"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
        <el-table-column prop="level" label="会员等级" width="90">
          <template slot-scope="scope">
            <el-tag :type="levelTag(scope.row.level)" size="small">{{ scope.row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="订单数" width="80"></el-table-column>
        <el-table-column prop="totalSpend" label="累计消费" width="100">
          <template slot-scope="scope">¥{{ scope.row.totalSpend || 0 }}</template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="70"></el-table-column>
        <el-table-column prop="registerTime" label="注册时间" min-width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="70">
          <template slot-scope="scope">
            <el-tag size="mini" :type="scope.row.status==1?'success':'danger'">{{ scope.row.status==1?'正常':'禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" class-name="op-col">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" :style="{color: scope.row.status==1?'#F56C6C':'#67C23A'}" @click="toggleStatus(scope.row)">
              {{ scope.row.status==1?'禁用':'启用' }}
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>

    <!-- 【4】新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="50%">
      <el-form :model="memberForm" ref="memberFormRef" :rules="rules" label-width="90px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="memberForm.nickname" placeholder="请输入昵称"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="memberForm.phone" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="memberForm.level" placeholder="请选择等级">
            <el-option label="普通会员" value="普通会员"></el-option>
            <el-option label="白银会员" value="白银会员"></el-option>
            <el-option label="黄金会员" value="黄金会员"></el-option>
            <el-option label="钻石会员" value="钻石会员"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number v-model="memberForm.points" :min="0"></el-input-number>
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
import { list, addMember, updateMember, deleteMember, statMember, batchUpdateStatus, batchDelete } from '@/api/pms_member.js'

export default {
  name: 'Member',
  data() {
    return {
      searchForm: { id: '', nickname: '', phone: '', level: '' },
      showFormBox: false,
      opMode: 'add',
      dialogTitle: '',
      memberForm: {},
      rules: {
        nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }]
      },
      memberList: [],
      curPage: 1,
      pageSize: 10,
      totalCount: 0,
      selected: [],
      statData: { total: 0, blackCount: 0, normalCount: 0, goldCount: 0 }
    }
  },
  methods: {
    levelTag(level) {
      return { '钻石会员': 'danger', '黄金会员': 'warning', '白银会员': 'success' }[level] || ''
    },
    onSelect(rows) { this.selected = rows },
    /* 加载列表 */
    getMemberList(param, page) {
      this.curPage = page
      list(this.curPage, this.pageSize, param).then(resp => {
        this.memberList = resp.data
        this.totalCount = resp.total
      })
    },
    getStat() {
      statMember().then(resp => {
        this.statData = resp.data
      })
    },
    doReset() { this.searchForm = { id: '', nickname: '', phone: '', level: '' }; this.doSearch() },
    doSearch() { this.getMemberList(this.searchForm, 1) },
    reloadPage(newPage) { this.getMemberList(this.searchForm, newPage) },
    showAddBox() {
      this.opMode = 'add'; this.dialogTitle = '添加会员'
      this.memberForm = { nickname: '', phone: '', level: '普通会员', points: 0, status: 1 }
      this.showFormBox = true
    },
    handleEdit(i, row) {
      this.opMode = 'edit'; this.dialogTitle = '编辑会员'
      this.memberForm = { ...row }
      this.showFormBox = true
    },
    saveData() {
      if (this.opMode === 'add') {
        addMember(this.memberForm).then(() => {
          this.$message('添加成功'); this.showFormBox = false; this.doSearch()
        })
      } else {
        updateMember(this.memberForm).then(() => {
          this.$message('更新成功'); this.showFormBox = false; this.doSearch()
        })
      }
    },
    handleDelete(i, row) {
      this.$confirm(`确认删除【${row.nickname}】吗?`, '提示', { type: 'warning' })
        .then(() => {
          deleteMember(row.id).then(() => {
            this.$message('删除成功'); this.doSearch()
          })
        }).catch(() => {})
    },
    toggleStatus(row) {
      updateMember({ id: row.id, status: row.status==1 ? 0 : 1 }).then(()=>{
        this.$message.success("操作成功");
        this.doSearch();
      });
    },
    /* 批量更新状态 */
    batchUpdateStatus(status) {
      let ids = this.selected.map(r => r.id)
      this.$confirm(`确认将选中的 ${ids.length} 个会员${status==1?'启用':'禁用'}吗?`, '批量操作', { type: 'warning' })
        .then(() => {
          batchUpdateStatus(ids, status).then(() => {
            this.$message.success("批量操作成功"); this.doSearch()
          })
        }).catch(() => {})
    },
    /* 批量删除 */
    batchDelete() {
      let ids = this.selected.map(r => r.id)
      this.$confirm(`确认删除选中的 ${ids.length} 个会员吗?`, '批量操作', { type: 'warning' })
        .then(() => {
          batchDelete(ids).then(() => {
            this.$message.success("批量删除成功"); this.doSearch()
          })
        }).catch(() => {})
    },
    /* 导出CSV */
    exportCsv() {
      let head = ["编号","昵称","手机号","会员等级","订单数","累计消费","积分","注册时间","状态"]
      let rows = this.memberList.map(m => [
        m.id, m.nickname, m.phone, m.level, m.orderCount, m.totalSpend, m.points, m.registerTime, m.status==1?'正常':'禁用'
      ])
      let csv = "\uFEFF" + head.join(",") + "\n" + rows.map(r => r.join(",")).join("\n")
      let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      let a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "会员列表.csv"
      a.click()
    }
  },
  mounted() {
    this.getStat()
    this.doSearch()
  }
}
</script>

<style scoped>
.el-button span { color:#fff; }
.stat-card { text-align:center; }
.stat-label { font-size:13px; color:#909399; }
.stat-value { font-size:28px; font-weight:600; margin-top:6px; }
/* 操作列：压缩按钮内边距与间距，保证「编辑 / 禁用 / 删除」三个按钮在同一排显示 */
.op-col .el-button { padding: 7px 12px; }
.op-col .el-button + .el-button { margin-left: 6px; }
</style>
