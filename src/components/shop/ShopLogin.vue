<template>
  <div class="shop-page">
    <div class="shop-header">
      <span class="back" @click="$router.push({name:'shopList'})">&lt; 返回商城</span>
      <span class="title">用户登录</span>
      <span class="back"></span>
    </div>

    <div class="reg-box">
      <div class="reg-icon">
        <i class="el-icon-user-solid"></i>
      </div>
      <div class="reg-title">欢迎回来</div>
      <div class="reg-sub">商城账号密码登录</div>

      <el-form :model="form" :rules="rules" ref="loginForm" label-width="0">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" prefix-icon="el-icon-phone"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="el-icon-lock" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doLogin" style="width:100%;">登 录</el-button>
        </el-form-item>
      </el-form>

      <div class="login-link">还没有账号？<a @click="$router.push({name:'shopRegister'})">去注册</a></div>
    </div>
  </div>
</template>

<script>
import { checkMember } from "@/api/pms_shop.js"
export default {
  name:"ShopLogin",
  data(){
    return {
      form: { phone:'', password:'' },
      rules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    doLogin(){
      this.$refs.loginForm.validate( valid=>{
        if(!valid) return;
        /* 按手机号+密码登录：未注册或密码错误后端会返回错误 */
        checkMember({ phone: this.form.phone, password: this.form.password }).then( resp=>{
          /* 后端失败时 result=failed、cause=错误消息，不能当成登录成功 */
          if(!resp || resp.result !== 'success' || !resp.member){
            this.$message.error((resp && resp.cause) || "登录失败，请检查账号或密码");
            return;
          }
          let m = resp.member;
          window.localStorage.setItem('shopMemberId', m.id || '');
          window.localStorage.setItem('shopNick', m.nickname || '');
          window.localStorage.setItem('shopPhone', this.form.phone);
          window.localStorage.setItem('shopLevel', m.level || '普通会员');
          this.$message.success('登录成功，欢迎回来');
          this.$router.push({ name:'shopList' });
        }).catch( err=>{
          this.$message.error((err && err.message) || "登录失败");
        });
      });
    }
  }
}
</script>

<style scoped>
.shop-page{ max-width:1200px; margin:0 auto; min-height:100vh; background:#f5f5f5; }
.shop-header{ height:50px; background:#2b2f38; color:#fff; display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
.shop-header .title{ font-size:18px; font-weight:bold; }
.shop-header .back{ font-size:13px; cursor:pointer; width:80px; }
.reg-box{ max-width:420px; margin:60px auto 0; background:#fff; border-radius:10px; padding:40px 40px 50px; box-shadow:0 4px 16px rgba(0,0,0,.06); }
.reg-icon{ width:64px; height:64px; background:#409EFF; border-radius:50%; margin:0 auto; display:flex; align-items:center; justify-content:center; color:#fff; font-size:30px; }
.reg-title{ text-align:center; font-size:22px; font-weight:bold; color:#303133; margin-top:16px; }
.reg-sub{ text-align:center; font-size:13px; color:#909399; margin-top:6px; margin-bottom:30px; }
.login-link{ text-align:center; margin-top:20px; font-size:13px; color:#909399; }
.login-link a{ color:#409EFF; cursor:pointer; }
</style>
