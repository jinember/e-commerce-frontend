<template>
  <div>
    <!-- 【1】页签标题 -->
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-picture-outline"></i>广告设置</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 【2】搜索区 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="广告标题:">
          <el-input placeholder="请输入广告标题" v-model="searchForm.title" clearable style="width:180px;"></el-input>
        </el-form-item>
        <el-form-item label="广告位置:">
          <el-select v-model="searchForm.position" placeholder="全部" clearable style="width:150px;">
            <el-option label="首页轮播" value="首页轮播"></el-option>
            <el-option label="分类页横幅" value="分类页横幅"></el-option>
            <el-option label="启动弹窗" value="启动弹窗"></el-option>
            <el-option label="侧边栏" value="侧边栏"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="doSearch">查询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showAddBox">新增广告</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 【3】广告列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="adList" border height="450" style="width:100%">
        <el-table-column prop="id" label="编号" width="70"></el-table-column>
        <el-table-column prop="title" label="广告标题" min-width="140"></el-table-column>
        <el-table-column prop="position" label="广告位置" width="120"></el-table-column>
        <el-table-column prop="link" label="跳转链接" min-width="140" show-overflow-tooltip></el-table-column>
        <el-table-column label="图片" width="120">
          <template slot-scope="scope">
            <img v-if="scope.row.imgUrl" :src="scope.row.imgUrl" style="width:90px;height:50px;object-fit:cover;border-radius:4px;">
            <span v-else style="color:#c0c4cc;">无图</span>
          </template>
        </el-table-column>
        <el-table-column label="投放时段" width="170">
          <template slot-scope="scope">
            <span v-if="scope.row.startTime">{{ scope.row.startTime }} ~ {{ scope.row.endTime || '长期' }}</span>
            <span v-else style="color:#909399;">长期投放</span>
          </template>
        </el-table-column>
        <el-table-column prop="clickCount" label="点击量" width="80">
          <template slot-scope="scope">
            <span style="color:#E6A23C;font-weight:bold;">{{ scope.row.clickCount || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70"></el-table-column>
        <el-table-column prop="status" label="上架状态" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
              active-color="#13ce66" inactive-color="#909399"
              @change="toggleStatus(scope.row)"></el-switch>
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
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>

    <!-- 【4】新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="50%">
      <el-form :model="adForm" ref="adFormRef" :rules="rules" label-width="90px">
        <el-form-item label="广告标题" prop="title">
          <el-input v-model="adForm.title" placeholder="请输入广告标题"></el-input>
        </el-form-item>
        <el-form-item label="广告位置">
          <el-select v-model="adForm.position">
            <el-option label="首页轮播" value="首页轮播"></el-option>
            <el-option label="分类页横幅" value="分类页横幅"></el-option>
            <el-option label="启动弹窗" value="启动弹窗"></el-option>
            <el-option label="侧边栏" value="侧边栏"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="adForm.link" placeholder="请输入跳转链接"></el-input>
        </el-form-item>
        <el-form-item label="广告图片">
          <el-input v-model="adForm.imgUrl" placeholder="图片URL，留空则用渐变占位"></el-input>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="adForm.startTime" type="datetime" placeholder="开始时间"
            value-format="yyyy-MM-dd HH:mm:ss" style="width:240px;"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="adForm.endTime" type="datetime" placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss" style="width:240px;"></el-date-picker>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="adForm.sort" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="上架状态">
          <el-switch v-model="adForm.status" :active-value="1" :inactive-value="0"></el-switch>
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
import { list, addAd, updateAd, deleteAd } from '@/api/pms_ad.js'

export default {
  name: 'Ad',
  data() {
    return {
      searchForm: { title: '', position: '' },
      showFormBox: false,
      opMode: 'add',
      dialogTitle: '',
      adForm: {},
      rules: {
        title: [{ required: true, message: '请输入广告标题', trigger: 'blur' }]
      },
      adList: [],
      curPage: 1,
      pageSize: 10,
      totalCount: 0
    }
  },
  methods: {
    getAdList(param, page) {
      this.curPage = page
      list(this.curPage, this.pageSize, param).then(resp => {
        this.adList = resp.data
        this.totalCount = resp.total
      })
    },
    doReset() { this.searchForm = { title: '', position: '' }; this.doSearch() },
    doSearch() { this.getAdList(this.searchForm, 1) },
    reloadPage(newPage) { this.getAdList(this.searchForm, newPage) },
    showAddBox() {
      this.opMode = 'add'; this.dialogTitle = '新增广告'
      this.adForm = { title: '', position: '首页轮播', link: '', imgUrl: '', startTime: '', endTime: '', sort: 1, status: 1 }
      this.showFormBox = true
    },
    handleEdit(i, row) {
      this.opMode = 'edit'; this.dialogTitle = '编辑广告'
      this.adForm = { ...row }
      this.showFormBox = true
    },
    saveData() {
      this.adForm.startTime = this.adForm.startTime || null
      this.adForm.endTime = this.adForm.endTime || null
      if (this.opMode === 'add') {
        addAd(this.adForm).then(() => {
          this.$message('新增成功'); this.showFormBox = false; this.doSearch()
        })
      } else {
        updateAd(this.adForm).then(() => {
          this.$message('更新成功'); this.showFormBox = false; this.doSearch()
        })
      }
    },
    toggleStatus(row) {
      let newStatus = row.status;
      updateAd({ id: row.id, title: row.title, position: row.position, link: row.link, imgUrl: row.imgUrl, startTime: row.startTime, endTime: row.endTime, sort: row.sort, status: newStatus })
        .then(() => {
          this.$message.success(newStatus === 1 ? '已上架' : '已下架');
        })
        .catch(() => {
          row.status = newStatus === 1 ? 0 : 1;
        })
    },
    handleDelete(i, row) {
      this.$confirm(`确认删除【${row.title}】吗?`, '提示', { type: 'warning' })
        .then(() => {
          deleteAd(row.id).then(() => {
            this.$message('删除成功'); this.doSearch()
          })
        }).catch(() => {})
    }
  },
  mounted() {
    this.doSearch()
  }
}
</script>

<style scoped>
.el-button span { color:#fff; }
</style>
