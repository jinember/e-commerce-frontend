<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-message"></i>站内消息</span>
      </el-tab-pane>
    </el-tabs>
    <el-card class="box-card" style="margin-top:10px;">
      <el-button type="primary" icon="el-icon-plus" @click="dialog=true" style="margin-bottom:15px;">发送消息</el-button>
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" width="80"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" width="120"></el-table-column>
        <el-table-column prop="title" label="标题" width="150"></el-table-column>
        <el-table-column prop="content" label="内容" min-width="200"></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="s">
            <el-tag size="mini">{{ s.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isRead" label="已读" width="80">
          <template slot-scope="s">
            <el-tag size="mini" :type="s.row.isRead==1?'success':'danger'">{{ s.row.isRead==1?'已读':'未读' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间" width="160"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="s">
            <el-button type="text" @click="edit(s.row)">编辑</el-button>
            <el-button type="text" style="color:#F56C6C" @click="del(s.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background style="margin-top:15px;text-align:left" @current-change="load" :current-page="page" :page-size="limit" :total="total" layout="prev, pager, next"></el-pagination>
    </el-card>

    <el-dialog :title="form.id?'编辑':'发送消息'" :visible.sync="dialog" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="接收用户">
          <el-select v-model="form.memberId" filterable placeholder="请选择会员" style="width:100%">
            <el-option v-for="m in memberOptions" :key="m.id" :label="(m.nickname||'未命名') + '（ID:' + m.id + '）'" :value="m.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标题"><el-input v-model="form.title"></el-input></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea"></el-input></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="订单通知" value="order"></el-option>
            <el-option label="物流通知" value="logistics"></el-option>
            <el-option label="活动推送" value="promotion"></el-option>
            <el-option label="系统消息" value="system"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer"><el-button @click="dialog=false">取消</el-button><el-button type="primary" @click="save">确定</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { list, add, del } from '@/api/pms_message.js'
import { list as memberList } from '@/api/pms_member.js'
export default {
  data(){ return { list:[], total:0, page:1, limit:10, dialog:false, form:{}, memberOptions:[] } },
  created(){ this.load(); this.loadMembers() },
  methods:{
    load(p){ if(p) this.page=p; list(this.page,this.limit,{}).then(r=>{ this.list=r.data||[]; this.total=r.total||0; }) },
    loadMembers(){ memberList(1, 200, {}).then(r=>{ this.memberOptions = r.data || []; }) },
    edit(row){ this.form=Object.assign({},row); this.dialog=true; },
    save(){ add(this.form).then(()=>{ this.dialog=false; this.$message.success('保存成功'); this.load(); }) },
    del(id){ this.$confirm('确认删除?','提示',{type:'warning'}).then(()=>{ del(id).then(()=>{ this.$message.success('删除成功'); this.load(); }) }).catch(()=>{}); }
  }
}
</script>
