<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-service"></i>客服工单</span>
      </el-tab-pane>
    </el-tabs>
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" width="80"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" width="120"></el-table-column>
        <el-table-column prop="title" label="标题" width="150"></el-table-column>
        <el-table-column prop="content" label="问题描述" min-width="200"></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="s">
            <el-tag size="mini" :type="s.row.type=='complaint'?'danger':s.row.type=='afterSale'?'warning':''">
              {{ s.row.type=='consult'?'咨询':s.row.type=='afterSale'?'售后':'投诉' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template slot-scope="s">
            <el-tag size="mini" :type="s.row.status=='resolved'?'success':s.row.status=='processing'?'warning':'info'">
              {{ s.row.status=='pending'?'待处理':s.row.status=='processing'?'处理中':'已解决' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reply" label="客服回复" min-width="150"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="s">
            <el-button type="text" @click="edit(s.row)">回复</el-button>
            <el-button type="text" style="color:#F56C6C" @click="del(s.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background style="margin-top:15px;text-align:left" @current-change="load" :current-page="page" :page-size="limit" :total="total" layout="prev, pager, next"></el-pagination>
    </el-card>

    <el-dialog title="回复工单" :visible.sync="dialog" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="问题">{{ form.content }}</el-form-item>
        <el-form-item label="回复">
          <el-input v-model="form.reply" type="textarea" placeholder="请输入回复内容"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已解决" value="resolved"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer"><el-button @click="dialog=false">取消</el-button><el-button type="primary" @click="save">保存</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { list, add, del } from '@/api/pms_ticket.js'
export default {
  data(){ return { list:[], total:0, page:1, limit:10, dialog:false, form:{} } },
  created(){ this.load() },
  methods:{
    load(p){ if(p) this.page=p; list(this.page,this.limit,{}).then(r=>{ this.list=r.data||[]; this.total=r.total||0; }) },
    edit(row){ this.form=Object.assign({},row); this.dialog=true; },
    save(){ add(this.form).then(()=>{ this.dialog=false; this.$message.success('保存成功'); this.load(); }) },
    del(id){ this.$confirm('确认删除?','提示',{type:'warning'}).then(()=>{ del(id).then(()=>{ this.$message.success('删除成功'); this.load(); }) }).catch(()=>{}); }
  }
}
</script>
