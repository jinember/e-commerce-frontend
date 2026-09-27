<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-check"></i>角色管理</span>
      </el-tab-pane>
    </el-tabs>

    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="角色名:">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名" clearable @clear="onSearch" style="width:160px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button type="info" @click="onReset">清空</el-button>
          <el-button type="primary" @click="showAdd">添加角色</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="tableData" border style="width:100%;">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="150"></el-table-column>
        <el-table-column prop="descript" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="showEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination background layout="prev, pager, next" :total="totalCount" :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="40%">
      <el-form :model="roleForm" ref="roleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="descript">
          <el-input type="textarea" v-model="roleForm.descript" placeholder="请输入角色描述"></el-input>
        </el-form-item>
        <el-form-item label="业务板块">
          <el-checkbox-group v-model="menuPermsKeys">
            <el-checkbox label="data">数据中心</el-checkbox>
            <el-checkbox label="userop">用户运营</el-checkbox>
            <el-checkbox label="goods">商品管理</el-checkbox>
            <el-checkbox label="trade">交易管理</el-checkbox>
            <el-checkbox label="marketing">营销管理</el-checkbox>
            <el-checkbox label="system">系统管理</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" style="text-align:center;">
        <el-button @click="showFormBox=false">取消</el-button>
        <el-button type="primary" @click="saveForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from "@/network/request.js"
export default {
  name:"Role",
  data(){
    return {
      searchForm:{ roleName:"" },
      tableData:[], totalCount:0, curPage:1,
      showFormBox:false, dialogTitle:"",
      roleForm:{}, opMode:"add",
      menuPermsKeys: []
    }
  },
  created(){ this.load() },
  methods:{
    load(){
      service({ url:`/Role/list/${this.curPage}/10`, method:"GET" })
        .then( resp=>{
          this.tableData = resp.data || [];
          this.totalCount = resp.total || 0;
        });
    },
    onSearch(){ this.curPage=1; this.load() },
    onReset(){ this.searchForm={}; this.curPage=1; this.load() },
    reloadPage(p){ this.curPage=p; this.load() },
    showAdd(){
      this.opMode="add"; this.dialogTitle="添加角色";
      this.roleForm={}; this.menuPermsKeys=[]; this.showFormBox=true;
    },
    showEdit(row){
      this.opMode="edit"; this.dialogTitle="编辑角色";
      this.roleForm={ ...row };
      this.menuPermsKeys = row.menuPerms ? row.menuPerms.split(",").filter(Boolean) : [];
      this.showFormBox=true;
    },
    saveForm(){
      this.roleForm.menuPerms = this.menuPermsKeys.join(",");
      let url = this.opMode==="add" ? "/Role/add" : "/Role/update";
      service({ url, method:"POST", data:this.roleForm })
        .then( ()=>{
          this.$message.success("保存成功");
          this.showFormBox=false; this.load();
        });
    },
    handleDelete(row){
      this.$confirm(`确认删除角色【${row.roleName}】吗?`, "提示", { type:"warning" })
        .then( ()=>{
          service({ url:`/Role/delete/${row.id}`, method:"POST" })
            .then( ()=>{
              this.$message.success("删除成功"); this.load();
            });
        }).catch(()=>{});
    }
  }
}
</script>
