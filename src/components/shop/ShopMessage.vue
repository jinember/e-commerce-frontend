<template>
  <div class="shop-page">
    <!-- 顶部 -->
    <div class="shop-header">
      <span class="back" @click="$router.push({name:'shopList'})">&lt; 返回商城</span>
      <span class="title">消息中心</span>
      <span class="back" @click="readAll">全部已读</span>
    </div>

    <!-- 未读统计条 -->
    <div class="msg-stat">
      共 {{ list.length }} 条消息，<span class="unread-num">{{ unread }} 条未读</span>
    </div>

    <!-- 消息列表 -->
    <div class="msg-list">
      <div v-for="m in list" :key="m.id"
           class="msg-card" :class="{ unread: m.isRead !== 1 }"
           @click="readOne(m)">
        <div class="msg-head">
          <span class="msg-type" :class="'tp-'+m.type">{{ typeText(m.type) }}</span>
          <span class="msg-title">{{ m.title }}</span>
          <span class="msg-time">{{ m.sendTime }}</span>
        </div>
        <div class="msg-content">{{ m.content }}</div>
        <div v-if="m.isRead !== 1" class="msg-dot">未读</div>
      </div>
      <div v-if="list.length==0" class="empty">暂无消息</div>
    </div>
  </div>
</template>

<script>
import { myMessages, readMessage, readAllMessages } from "@/api/pms_shop.js"
export default {
  name:"ShopMessage",
  data(){ return { list:[], unread:0 } },
  created(){ this.load() },
  methods:{
    load(){
      let mid = parseInt(window.localStorage.getItem('shopMemberId') || '0');
      if(!mid){
        this.$message.warning("请先登录");
        this.$router.push({ name:'shopLogin' });
        return;
      }
      myMessages(mid).then( resp=>{
        this.list = resp.data || [];
        this.unread = resp.unread || 0;
      }).catch(()=>{});
    },
    typeText( t ){
      return { order:"订单", system:"系统", activity:"活动", refund:"售后" }[t] || "通知";
    },
    /* 点击未读消息 → 标记已读 */
    readOne(m){
      if(m.isRead === 1) return;
      let mid = parseInt(window.localStorage.getItem('shopMemberId') || '0');
      readMessage({ id: m.id, memberId: mid }).then(()=>{
        this.$set(m, 'isRead', 1);
        this.unread = Math.max(0, this.unread - 1);
      }).catch(()=>{});
    },
    /* 全部已读 */
    readAll(){
      let mid = parseInt(window.localStorage.getItem('shopMemberId') || '0');
      if(!this.unread){
        this.$message.info("没有未读消息");
        return;
      }
      readAllMessages({ memberId: mid }).then(()=>{
        this.list.forEach( m => { this.$set(m, 'isRead', 1); });
        this.unread = 0;
        this.$message.success("已全部标记为已读");
      }).catch(()=>{});
    }
  }
}
</script>

<style scoped>
.shop-page{ max-width:1200px; margin:0 auto; min-height:100vh; background:#f5f5f5; padding-bottom:30px; }
.shop-header{ height:50px; background:#2b2f38; color:#fff; display:flex; align-items:center; justify-content:space-between; padding:0 20px; position:sticky; top:0; z-index:10; }
.shop-header .title{ font-size:18px; font-weight:bold; }
.shop-header .back{ font-size:13px; cursor:pointer; width:80px; }
.msg-stat{ padding:12px 20px; font-size:13px; color:#909399; background:#fff; border-bottom:1px solid #f0f0f0; }
.unread-num{ color:#F56C6C; }
.msg-list{ padding:20px; display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; }
.msg-card{ background:#fff; border-radius:8px; padding:14px; position:relative; box-shadow:0 1px 4px rgba(0,0,0,.04); }
.msg-card.unread{ background:#fff; box-shadow:0 0 0 1px #409EFF inset; }
.msg-head{ display:flex; align-items:center; font-size:13px; }
.msg-type{ flex-shrink:0; padding:1px 8px; border-radius:3px; color:#fff; font-size:11px; margin-right:8px; }
.tp-order{ background:#409EFF; } .tp-system{ background:#909399; } .tp-activity{ background:#E6A23C; } .tp-refund{ background:#F56C6C; }
.msg-title{ flex:1; color:#303133; font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.msg-time{ flex-shrink:0; color:#c0c4cc; font-size:11px; margin-left:8px; }
.msg-content{ font-size:13px; color:#606266; line-height:1.6; margin-top:10px; }
.msg-dot{ position:absolute; top:12px; right:12px; background:#F56C6C; color:#fff; font-size:10px;
  padding:1px 6px; border-radius:8px; }
.empty{ grid-column:1 / -1; text-align:center; color:#909399; padding:60px 0; }
</style>
