<template>
  <div class="profile-page">
    <!-- 顶部返回栏 -->
    <div class="profile-header">
      <span class="back" @click="$router.push({name:'shopList'})">&lt; 返回商城</span>
      <span class="title">个人信息</span>
      <span class="back"></span>
    </div>

    <!-- 资料卡 + 编辑表单（电脑版：左卡右表单） -->
    <div class="profile-main">
      <div class="profile-card">
        <div class="avatar-wrap">
          <i class="el-icon-user-solid avatar"></i>
        </div>
        <div class="p-name">{{ form.nickname || '未设置昵称' }}</div>
        <div class="p-level">{{ form.level || '普通会员' }}</div>
        <div class="p-stats">
          <div class="stat"><div class="num">{{ form.points || 0 }}</div><div class="label">积分</div></div>
          <div class="stat"><div class="num">¥{{ (form.balance || 0).toFixed(2) }}</div><div class="label">余额</div></div>
        </div>
      </div>

      <div class="profile-right">
        <div class="form-card">
          <div class="form-title">基本资料</div>
          <div class="row"><span class="k">手机号</span><span class="v readonly">{{ form.phone }}</span></div>
          <div class="row"><span class="k">昵称</span><input class="v" v-model="form.nickname" placeholder="请输入昵称"/></div>
          <div class="row">
            <span class="k">性别</span>
            <select class="v" v-model="form.gender">
              <option value="">未设置</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="row"><span class="k">年龄</span><input class="v" type="number" v-model.number="form.age" placeholder="请输入年龄"/></div>
          <div class="row"><span class="k">城市</span><input class="v" v-model="form.city" placeholder="请输入所在城市"/></div>
          <div class="row"><span class="k">注册时间</span><span class="v readonly">{{ form.registerTime }}</span></div>
        </div>

        <button class="save-btn" @click="doSave">保存修改</button>
      </div>
    </div>
  </div>
</template>

<script>
import { myInfo, updateInfo } from "@/api/pms_shop.js"
export default {
  name:"ShopProfile",
  data(){
    return {
      form: { id:null, nickname:'', phone:'', level:'普通会员', gender:'', age:null, city:'', points:0, balance:0, registerTime:'' }
    }
  },
  created(){ this.load(); },
  methods:{
    load(){
      let mid = window.localStorage.getItem('shopMemberId') || '1';
      myInfo(mid).then( resp=>{
        let d = resp.data || {};
        this.form = {
          id: d.id,
          nickname: d.nickname || '',
          phone: d.phone || '',
          level: d.level || '普通会员',
          gender: d.gender || '',
          age: d.age,
          city: d.city || '',
          points: d.points || 0,
          balance: d.balance || 0,
          registerTime: d.registerTime || ''
        };
      }).catch(()=>{ this.$message.error('获取个人信息失败'); });
    },
    doSave(){
      if(!this.form.nickname){ this.$message.warning('请输入昵称'); return; }
      updateInfo(this.form).then( resp=>{
        this.$message.success(resp.msg || '保存成功');
        /* 同步昵称到商城首页缓存 */
        window.localStorage.setItem('shopNick', this.form.nickname);
      }).catch(()=>{ this.$message.error('保存失败'); });
    }
  }
}
</script>

<style scoped>
.profile-page{ max-width:1200px; margin:0 auto; min-height:100vh; background:#f5f5f5; padding-bottom:30px; }
.profile-header{ height:50px; background:#2b2f38; color:#fff; display:flex; align-items:center; justify-content:space-between; padding:0 20px; position:sticky; top:0; z-index:10; }
.profile-header .title{ font-size:18px; font-weight:bold; }
.profile-header .back{ font-size:13px; cursor:pointer; width:80px; }
.profile-main{ display:flex; gap:20px; padding:20px; align-items:flex-start; }
.profile-card{ width:320px; flex-shrink:0; background:#409EFF; color:#fff; padding:40px 20px; text-align:center; border-radius:10px; }
.avatar{ font-size:60px; }
.p-name{ font-size:20px; font-weight:bold; margin-top:10px; }
.p-level{ display:inline-block; margin-top:8px; font-size:13px; background:rgba(255,255,255,.2); padding:2px 14px; border-radius:12px; }
.p-stats{ display:flex; justify-content:center; margin-top:20px; gap:50px; }
.stat .num{ font-size:20px; font-weight:bold; }
.stat .label{ font-size:13px; opacity:.8; margin-top:2px; }
.profile-right{ flex:1; min-width:0; }
.form-card{ background:#fff; border-radius:10px; overflow:hidden; }
.form-title{ font-size:16px; font-weight:bold; color:#303133; padding:14px 20px; border-bottom:1px solid #f0f0f0; }
.row{ display:flex; align-items:center; padding:14px 20px; border-bottom:1px solid #f0f0f0; }
.row:last-child{ border-bottom:none; }
.row .k{ width:90px; font-size:14px; color:#606266; }
.row .v{ flex:1; border:none; outline:none; font-size:14px; color:#303133; }
.row .v.readonly{ color:#909399; }
.row select.v{ height:auto; }
.save-btn{ display:block; width:200px; margin:20px auto 0; background:#409EFF; color:#fff; border:none; padding:12px; border-radius:20px; font-size:15px; cursor:pointer; }
.save-btn:active{ background:#66b1ff; }
</style>
