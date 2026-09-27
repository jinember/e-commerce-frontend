<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-title">电商管理后台</div>
      <el-form :model="form" label-width="0" @submit.native.prevent="login">
        <el-form-item>
          <el-input v-model="form.account" placeholder="账号" prefix-icon="el-icon-user" @keyup.enter.native="login"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="el-icon-lock" @keyup.enter.native="login"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width:100%;" @click="login">登 录</el-button>
        </el-form-item>
      </el-form>
      <div class="tip">默认账号：admin / 123456</div>
    </div>
  </div>
</template>

<script>
import service from "@/network/request.js"
export default {
  name:"Login",
  data(){
    return { form:{ account:"", password:"" } }
  },
  methods:{
    login(){
      service({
        url:"/User/login",
        method:"POST",
        data:this.form
      }).then( resp=>{
        if(resp.result !== "success"){
          this.$message.error("账号或密码错误");
          return;
        }
        window.sessionStorage.setItem("adminToken", resp.token);
        window.sessionStorage.setItem("adminUser", resp.data && resp.data.nickName || resp.data && resp.data.account || "");
        console.log("登录返回:", resp);
        window.sessionStorage.setItem("roleId", resp.roleId || "");
        window.sessionStorage.setItem("menuPerms", resp.menuPerms || "");
        window.sessionStorage.setItem("account", (resp.data && resp.data.account) || "");
        this.$router.push({ name:"home" });
      }).catch(()=>{
        this.$message.error("账号或密码错误");
      });
    }
  }
}
</script>

<style scoped>
.login-page{
  height:100vh; background:linear-gradient(135deg, #409EFF, #667eea);
  display:flex; align-items:center; justify-content:center;
}
.login-box{
  width:360px; background:#fff; border-radius:10px; padding:40px 30px;
  box-shadow:0 10px 40px rgba(0,0,0,.2);
}
.login-title{
  text-align:center; font-size:22px; font-weight:bold; color:#303133;
  margin-bottom:30px;
}
.tip{ text-align:center; color:#909399; font-size:12px; margin-top:10px; }
</style>
