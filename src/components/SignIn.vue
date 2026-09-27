<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-edit-outline"></i>签到打卡</span>
      </el-tab-pane>
    </el-tabs>

    <el-card class="box-card" style="margin-top:10px;">
      <div slot="header" style="font-size:15px;font-weight:bold;">签到规则设置</div>
      <el-form :model="rule" :inline="true">
        <el-form-item label="每次签到积分">
          <el-input-number v-model="rule.basePoints" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="连续签到每天加成">
          <el-input-number v-model="rule.continuousBonus" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="单次积分上限">
          <el-input-number v-model="rule.maxPoints" :min="1"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveRule">保存规则</el-button>
        </el-form-item>
      </el-form>
      <div style="font-size:12px;color:#909399;margin-top:5px;">
        说明：首次签到得「每次签到积分」，每多连续一天再额外加「连续签到每天加成」，最终不超过「单次积分上限」。修改后对之后的新签到立即生效。
      </div>
    </el-card>

    <el-card class="box-card" style="margin-top:10px;">
      <div slot="header" style="font-size:15px;font-weight:bold;">签到记录</div>
      <el-table :data="list" border stripe height="420">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" width="90"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" width="140"></el-table-column>
        <el-table-column prop="signDate" label="签到日期" min-width="180"></el-table-column>
        <el-table-column prop="continuousDays" label="连续签到(天)" width="120"></el-table-column>
        <el-table-column prop="points" label="获得积分" width="100"></el-table-column>
      </el-table>
      <el-pagination background style="margin-top:10px; float: left;text-align:right" @current-change="load" :current-page="page" :page-size="limit" :total="total" layout="prev, pager, next"></el-pagination>
    </el-card>
  </div>
</template>
<script>
import { list, getRule, saveRule } from '@/api/pms_signIn.js'
export default {
  data(){ return {
    list:[], total:0, page:1, limit:10,
    rule: { id:1, basePoints:5, continuousBonus:2, maxPoints:20 }
  } },
  created(){ this.load(); this.loadRule() },
  methods:{
    load(p){
      if(p) this.page = p
      list(this.page,this.limit,{}).then(r=>{ this.list=r.data||[]; this.total=r.total||0; })
    },
    loadRule(){ getRule().then(r=>{ if(r.data) this.rule = r.data }) },
    saveRule(){ saveRule(this.rule).then(()=>{ this.$message.success('签到规则已保存') }) }
  }
}
</script>
<style scoped>
.el-button span { color:#fff; }
</style>
