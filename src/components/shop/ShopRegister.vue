<template>
  <div class="shop-page">
    <div class="shop-header">
      <span class="back" @click="$router.push({name:'shopList'})">&lt; 返回商城</span>
      <span class="title">用户注册</span>
      <span class="back"></span>
    </div>

    <div class="reg-box">
      <div class="reg-icon">
        <i class="el-icon-user"></i>
      </div>
      <div class="reg-title">创建账号</div>
      <div class="reg-sub">注册即送100积分</div>

      <el-form :model="form" :rules="rules" ref="regForm" label-width="0">
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" prefix-icon="el-icon-edit"></el-input>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" prefix-icon="el-icon-phone"></el-input>
        </el-form-item>
        <el-form-item prop="code">
          <div style="display:flex;gap:8px;">
            <el-input v-model="form.code" placeholder="请输入验证码" prefix-icon="el-icon-key" style="flex:1;"></el-input>
            <el-button @click="sendCode" :disabled="countdown>0">{{ countdown>0?countdown+'s':'获取验证码' }}</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReg" style="width:100%;">立即注册</el-button>
        </el-form-item>
      </el-form>

      <div class="login-link">已有账号？<a @click="$router.push({name:'shopLogin'})">去登录</a></div>
    </div>
  </div>
</template>

<script>
import { registerMember, checkMember } from "@/api/pms_shop.js"
export default {
  name:"ShopRegister",
  data(){
    return {
      form: { nickname:'', phone:'', code:'' },
      countdown: 0,
      realCode: '',
      rules: {
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度2-20个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    sendCode(){
      if(!this.form.phone){
        this.$message.warning("请先输入手机号");
        return;
      }
      if(!/^1[3-9]\d{9}$/.test(this.form.phone)){
        this.$message.warning("手机号格式不正确");
        return;
      }
      /* 生成随机6位验证码 */
      this.realCode = String(Math.floor(Math.random()*900000)+100000);
      this.countdown = 60;
      let timer = setInterval(()=>{
        this.countdown--;
        if(this.countdown<=0) clearInterval(timer);
      }, 1000);
      /* 模拟短信发送：弹窗显示验证码 */
      this.$alert("验证码已发送至 " + this.form.phone + "\n\n【模拟短信】您的验证码是：" + this.realCode, "验证码", {
        confirmButtonText: "我知道了"
      });
    },
    doReg(){
      this.$refs.regForm.validate( valid=>{
        if(!valid) return;
        /* 校验验证码 */
        if(!this.realCode){
          this.$message.warning("请先获取验证码");
          return;
        }
        if(this.form.code !== this.realCode){
          this.$message.error("验证码不正确");
          return;
        }
        registerMember({ nickname: this.form.nickname, phone: this.form.phone })
          .then(resp=>{
            window.localStorage.setItem('shopNick', this.form.nickname);
            window.localStorage.setItem('shopPhone', this.form.phone);
            window.localStorage.setItem('shopLevel', resp.level || '普通会员');
            window.localStorage.setItem('shopMemberId', resp.memberId || '1');
            this.$message.success('注册成功！赠送100积分');
            this.$router.push({ name:'shopList' });
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
