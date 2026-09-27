<template>
  <div class="shop-page">
    <!-- 顶部通栏 -->
    <div class="shop-header">
      <div class="hd-inner">
        <span class="logo" @click="refresh">优选商城</span>
        <div class="hd-right">
          <template v-if="userInfo.nickname">
            <i class="el-icon-user-solid u-avatar" @click="goProfile"></i>
            <span class="u-name" @click="goProfile">{{ userInfo.nickname }}</span>
            <span class="u-level" :class="levelClass">{{ userInfo.level }}</span>
            <span class="u-upgrade" @click="openUpgrade">升级</span>
            <span class="u-signin" @click="doSign">签到</span>
            <span class="u-service" @click="openChat">客服</span>
            <span class="u-msg" @click="goMessage">消息
              <i v-if="unread>0" class="msg-red-dot">{{ unread>99 ? '99+' : unread }}</i>
            </span>
            <span class="u-order" @click="goOrder">我的订单</span>
            <span class="u-logout" @click="logout">退出</span>
          </template>
          <template v-else>
            <button class="reg-btn" @click="$router.push({name:'shopLogin'})">登录 / 注册</button>
          </template>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input v-model="keyword" placeholder="搜索商品..." class="search-input" @keyup.enter="doSearch"/>
      <button class="search-btn" @click="doSearch">搜索</button>
    </div>

    <div class="main-layout">
      <!-- 左侧分类 -->
      <aside class="side-cat">
        <div class="cat-title">商品分类</div>
        <div class="cat-item" :class="{on: curCat===0}" @click="filterCat(0)">全部商品</div>
        <div class="cat-item" v-for="c in categories" :key="c" :class="{on: curCat===c}" @click="filterCat(c)">{{ c }}</div>
      </aside>

      <!-- 中间主区 -->
      <div class="center-col">
        <!-- 轮播广告 -->
        <el-carousel v-if="adList.length" height="300px" class="ad-carousel">
          <el-carousel-item v-for="a in adList" :key="a.id">
            <div class="ad-slide" @click="openAd(a)" :style="a.imgUrl ? {backgroundImage:'url('+a.imgUrl+')', backgroundSize:'cover', backgroundPosition:'center', cursor:'pointer'} : {background:'linear-gradient(135deg, #409EFF, #67C23A)', cursor:'pointer'}">
              <div class="ad-text">{{ a.title }}</div>
            </div>
          </el-carousel-item>
        </el-carousel>

        <!-- 分类页横幅 -->
        <div v-if="bannerAds.length" class="banner-row">
          <div v-for="b in bannerAds" :key="b.id" class="banner-card" @click="openAd(b)">
            <img v-if="b.imgUrl" :src="b.imgUrl" class="banner-img"/>
            <div v-else class="banner-ph">{{ b.title }}</div>
          </div>
        </div>

        <!-- 商品网格 -->
        <div class="goods-grid">
          <div v-for="g in list" :key="g.id" class="goods-card" @click="goDetail(g.id)">
            <div class="goods-img">
              <img v-if="g.mainImage" :src="BASE+'/PublishGoods/showImg/goods/'+g.mainImage" class="real-img"/>
              <i v-else class="el-icon-goods"></i>
            </div>
            <div class="goods-info">
              <div class="g-name">{{ g.goodsName }}</div>
              <div class="g-desc">{{ g.goodsDetails }}</div>
              <div class="g-bottom">
                <span class="g-price">¥ {{ ((g.promoMinPrice!=null?g.promoMinPrice:(g.minPrice||0))).toFixed(2) }}</span>
                <span v-if="g.promoName" class="g-tag">{{ g.promoType || '活动' }}</span>
              </div>
              <!-- 【营销联动】命中活动时才显示这行：活动名 + 折扣 + 划线原价 -->
              <div v-if="g.promoName" class="g-promo">
                {{ g.promoName }} · {{ (g.promoDiscount*10).toFixed(1) }}折
                <s>¥{{ (g.minPrice||0).toFixed(2) }}</s>
              </div>
            </div>
          </div>
        </div>
        <div v-if="list.length==0" class="empty">暂无上架商品</div>
      </div>

      <!-- 右侧边栏广告 -->
      <aside class="right-ad">
        <div class="cat-title">活动推荐</div>
        <div v-for="s in sideAds" :key="s.id" class="side-ad-card" @click="openAd(s)">
          <img v-if="s.imgUrl" :src="s.imgUrl" class="side-ad-img"/>
          <div v-else class="side-ad-ph">{{ s.title }}</div>
          <div class="side-ad-t">{{ s.title }}</div>
        </div>
        <div v-if="!sideAds.length" class="side-empty">暂无活动</div>
      </aside>
    </div>

    <!-- 升级会员弹窗 -->
    <el-dialog title="升级会员" :visible.sync="upgradeVisible" width="500px" custom-class="center-dialog">
      <div style="text-align:center;margin-bottom:15px;">
        当前等级：<span :class="'u-level '+levelClass" style="display:inline-block;padding:4px 12px;border-radius:4px;font-weight:bold;">{{ userInfo.level }}</span>
      </div>
      <div v-for="lv in levels" :key="lv.name"
           class="lv-card" :class="{on: lv.name===userInfo.level, disabled: lv.disabled}"
           @click="!lv.disabled && doUpgrade(lv)">
        <div style="font-size:15px;font-weight:600;">{{ lv.name }}</div>
        <div style="font-size:12px;color:#909399;margin:4px 0;">{{ lv.desc }}</div>
        <div style="font-size:16px;color:#F56C6C;font-weight:bold;">¥{{ lv.price }}</div>
        <div v-if="lv.disabled" style="font-size:11px;color:#C0C4CC;margin-top:4px;">当前等级</div>
      </div>
    </el-dialog>

    <!-- 在线客服：即时对话（写入 tbl_chat_session / tbl_chat_message） -->
    <el-dialog title="在线客服" :visible.sync="chatVisible" width="580px" custom-class="center-dialog" @open="onChatOpen" @close="stopPoll">
      <div class="cs-head">
        <div class="cs-avatar">客服</div>
        <div class="cs-info">
          <div class="cs-name">商城客服 · 在线</div>
          <div class="cs-tip">发送消息即可咨询，本次对话会同步到客服工作台</div>
        </div>
      </div>
      <div class="cs-body" ref="csBody">
        <div v-if="!chatMsgs.length" class="cs-empty">还没有消息，发一句话开始咨询吧</div>
        <div v-for="(m,i) in chatMsgs" :key="i" class="cs-row" :class="m.sender==='user' ? 'is-me' : 'is-cs'">
          <div v-if="m.sender!=='user'" class="cs-who" :class="m.sender==='merchant' ? 'who-human' : 'who-bot'">
            {{ m.sender==='merchant' ? ('人工客服' + (m.staffName ? ' · ' + m.staffName : '')) : '智能客服' }}
          </div>
          <div class="cs-bubble" :class="m.sender==='merchant' ? 'b-human' : (m.sender==='bot' ? 'b-bot' : 'b-me')">{{ m.content }}</div>
          <div class="cs-time">{{ (m.sendTime||'').substring(5,16) }}</div>
        </div>
      </div>
      <div class="cs-foot">
        <input class="cs-input" v-model="chatInput" placeholder="请描述您的问题，回车发送" @keyup.enter="sendChat"/>
        <button class="cs-send" @click="sendChat">发送</button>
        <button class="cs-ticket" @click="transferHuman">转人工</button>
        <button class="cs-ticket" @click="switchToTicket">工单</button>
      </div>
    </el-dialog>

    <!-- 客服工单弹窗 -->
    <el-dialog title="提交工单" :visible.sync="ticketVisible" width="500px" custom-class="center-dialog">
      <el-input v-model="ticketTitle" placeholder="问题标题" style="margin-bottom:10px;"></el-input>
      <el-input v-model="ticketContent" type="textarea" :rows="4" placeholder="请描述您遇到的问题..."></el-input>
      <div style="text-align:center;margin-top:15px;">
        <button class="ticket-submit" @click="submitTicket">提交</button>
      </div>
    </el-dialog>

    <!-- 启动弹窗广告 -->
    <el-dialog :visible.sync="popupAdVisible" :show-close="true" width="480px" custom-class="center-dialog">
      <div v-if="popupAd" @click="openAd(popupAd)" style="cursor:pointer;text-align:center;">
        <img v-if="popupAd.imgUrl" :src="popupAd.imgUrl" style="width:100%;border-radius:6px;display:block;">
        <div style="padding:14px 6px 4px;font-size:16px;font-weight:bold;">{{ popupAd.title }}</div>
        <div style="color:#909399;font-size:12px;padding-bottom:6px;">点击图片进入活动</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { shopList, checkMember, registerMember, shopSignIn, unreadCount } from "@/api/pms_shop.js"
import { list as adList, recordAdClick } from "@/api/pms_ad.js"
import request from "@/network/request.js"
export default {
  name:"ShopList",
  data(){
    return { list:[], allList:[], adList:[], bannerAds:[], sideAds:[], popupAd:null, popupAdVisible:false, keyword:'', BASE:'http://localhost:8090/mall-sys',
      userInfo:{ nickname:'', phone:'', level:'普通会员' }, isReg:false,
      upgradeVisible:false, ticketVisible:false,
      ticketTitle:'', ticketContent:'',
      chatVisible:false, chatMsgs:[], chatInput:'', chatSessionId:0, chatTimer:null,
      curCat:0, unread:0,
      levels: [
        { name:'普通会员', price:0, desc:'注册即享', disabled:false },
        { name:'白银会员', price:99, desc:'9.5折优惠', disabled:false },
        { name:'黄金会员', price:199, desc:'9折优惠+专属客服', disabled:false },
        { name:'钻石会员', price:399, desc:'8.5折+生日礼包', disabled:false }
      ]
    }
  },
  computed:{
    levelClass(){
      if(this.userInfo.level==='钻石会员') return 'lv-diamond';
      if(this.userInfo.level==='黄金会员') return 'lv-gold';
      return 'lv-normal';
    },
    categories(){
      let set = {};
      (this.allList||[]).forEach(g=>{ if(g.categoryName) set[g.categoryName]=1; });
      return Object.keys(set);
    }
  },
  created(){ this.userInfo.nickname = window.localStorage.getItem('shopNick') || '';
      this.userInfo.phone = window.localStorage.getItem('shopPhone') || '';
      this.userInfo.level = window.localStorage.getItem('shopLevel') || '普通会员';
      this.load(); this.loadAds(); this.loadBannerAds(); this.loadSideAds(); this.loadPopupAd();
      this.loadUnread(); },
  methods:{
    load(){
      shopList().then( resp=>{
        this.allList = resp.data || [];
        this.applyFilter();
      });
    },
    applyFilter(){
      let arr = this.allList;
      if(this.curCat && this.curCat!==0){
        arr = arr.filter(g=>g.categoryName===this.curCat);
      }
      if(this.keyword){
        let kw = this.keyword.toLowerCase();
        arr = arr.filter(g=> g.goodsName.toLowerCase().includes(kw) || (g.goodsDetails && g.goodsDetails.toLowerCase().includes(kw)) );
      }
      this.list = arr;
    },
    filterCat(c){ this.curCat = c; this.applyFilter(); },
    /* 通用：按位置拉取已上架且在投放时段内的广告 */
    loadAdsByPos(pos){
      return adList(1, 10, { position: pos }).then(resp=>{
        let now = Date.now();
        return (resp.data||[]).filter(a=>{
          if(a.position !== pos) return false;
          if(a.status!==1) return false;
          if(a.startTime && Date.parse(a.startTime) > now) return false;
          if(a.endTime && Date.parse(a.endTime) < now) return false;
          return true;
        });
      }).catch(()=>[]);
    },
    loadAds(){ this.loadAdsByPos('首页轮播').then(arr=>{ this.adList = arr; }); },
    loadBannerAds(){ this.loadAdsByPos('分类页横幅').then(arr=>{ this.bannerAds = arr; }); },
    loadSideAds(){ this.loadAdsByPos('侧边栏').then(arr=>{ this.sideAds = arr; }); },
    doSearch(){
      let mid = window.localStorage.getItem('shopMemberId') || '1';
      if(this.keyword) request.get('/shop/searchLog', {
        params: { keyword: this.keyword, memberId: mid }
      }).catch(() => {});
      this.applyFilter();
    },
    doSign(){
      let mid = window.localStorage.getItem('shopMemberId') || '1';
      shopSignIn(mid).then( resp=>{ this.$message.success(resp.msg || '签到成功'); })
        .catch( err=>{ this.$message.error('签到失败，请重试'); });
    },
    goProfile(){ this.$router.push({ name:"shopProfile" }); },
    /* 消息中心入口：加载未读数 */
    loadUnread(){
      let mid = window.localStorage.getItem('shopMemberId');
      if(!mid) return;
      unreadCount(mid).then( resp=>{ this.unread = resp.unread || 0; }).catch(()=>{});
    },
    goMessage(){
      let mid = window.localStorage.getItem('shopMemberId');
      if(!mid){ this.$message.warning("请先登录"); this.$router.push({ name:'shopLogin' }); return; }
      this.$router.push({ name:"shopMessage" });
    },
    loadPopupAd(){
      this.loadAdsByPos('启动弹窗').then(arr=>{
        if(arr.length){ this.popupAd = arr[0]; this.popupAdVisible = true; }
      });
    },
    openAd(a){
      if(a && a.id) recordAdClick(a.id);
      if(!a || !a.link) return;
      const link = String(a.link);
      const m = link.match(/\/goods\/(\d+)/);
      if(m){ this.$router.push({ name:"shopDetail", params:{ spuId: parseInt(m[1]) } }); }
      else if(/^https?:\/\//.test(link)){ window.open(link, "_blank"); }
      else { this.$router.push(link); }
    },
    refresh(){ this.load(); this.loadAds(); },
    goDetail( id ){ this.$router.push({ name:"shopDetail", params:{ spuId:id } }); },
    saveUser(){
      window.localStorage.setItem('shopNick', this.userInfo.nickname);
      window.localStorage.setItem('shopPhone', this.userInfo.phone);
      window.localStorage.setItem('shopLevel', this.userInfo.level);
    },
    logout(){
      window.localStorage.removeItem('shopNick');
      window.localStorage.removeItem('shopPhone');
      window.localStorage.removeItem('shopLevel');
      this.userInfo = { nickname:'', phone:'', level:'普通会员' };
      this.$message.success('已退出登录');
    },
    goOrder(){
      let name = window.localStorage.getItem('shopNick') || '匿名';
      this.$router.push({ name:"shopOrder", params:{ userName:name } });
    },
    openUpgrade(){
      this.levels.forEach( lv => { lv.disabled = lv.name === this.userInfo.level; });
      this.upgradeVisible = true;
    },
    doUpgrade(lv){
      this.$confirm('确认升级到'+lv.name+'？需支付¥'+lv.price, '提示', { type:'warning' })
        .then(()=>{
          request.post('/shop/upgradeLevel', { phone: this.userInfo.phone, level: lv.name })
            .then(resp => {
              if (resp && resp.result === 'failed') { this.$message.error(resp.cause || '升级失败'); return; }
              this.userInfo.level = lv.name; this.saveUser(); this.upgradeVisible = false;
              this.$message.success('升级成功！欢迎成为'+lv.name);
            }).catch(() => {});
        }).catch(()=>{});
    },
    /* ============ 在线客服：即时对话 ============ */
    openChat(){ this.chatMsgs=[]; this.chatInput=''; this.chatSessionId=0; this.chatVisible=true; },
    myMid(){ return window.localStorage.getItem('shopMemberId') || '1'; },
    onChatOpen(){
      this.startPoll();
      if(this.chatSessionId){ this.refreshChat(); return; }
      let mid = this.myMid();
      request.post('/shop/chatStart', { memberId: mid, chatType:'商品咨询' }).then(resp => {
        if(!resp || resp.result === 'failed'){ this.$message.error('客服接入失败，请稍后再试'); return; }
        let d = resp.data || {};
        this.chatSessionId = d.session ? d.session.id : 0;
        this.chatMsgs = d.rows || [];
        this.scrollChat();
      }).catch(()=>{});
    },
    /* 轮询：商家（人工客服）在后台回复后，会员这边自动刷出来 */
    startPoll(){
      this.stopPoll();
      this.chatTimer = setInterval(()=>{ this.refreshChat(); }, 8000);
    },
    stopPoll(){
      if(this.chatTimer){ clearInterval(this.chatTimer); this.chatTimer = null; }
    },
    refreshChat(){
      if(!this.chatSessionId) return;
      request({ url:'/shop/chatHistory', method:'GET',
        params:{ sessionId:this.chatSessionId, memberId:this.myMid() } }).then(resp => {
        let d = resp && resp.data ? resp.data : null;
        if(d && d.rows && d.rows.length !== this.chatMsgs.length){
          this.chatMsgs = d.rows;
          this.scrollChat();
          this.$message({ message:'客服回复了您', type:'success', duration:2000 });
        }
      }).catch(()=>{});
    },
    sendChat(){
      let txt = (this.chatInput||'').trim();
      if(!txt) return;
      if(!this.chatSessionId){ this.$message.warning('正在接入客服，请稍候'); return; }
      this.chatInput = '';
      let n = new Date(), p = x => (x<10?'0':'')+x;
      this.chatMsgs.push({ sender:'user', content:txt,
        sendTime: n.getFullYear()+'-'+p(n.getMonth()+1)+'-'+p(n.getDate())+' '+p(n.getHours())+':'+p(n.getMinutes())+':'+p(n.getSeconds()) });
      this.scrollChat();
      request.post('/shop/chatSend', { sessionId:this.chatSessionId, memberId:this.myMid(), content:txt }).then(resp => {
        if(!resp || resp.result === 'failed'){ this.$message.error((resp && resp.cause) || '发送失败'); return; }
        let d = resp.data || {};
        this.chatMsgs = d.rows || this.chatMsgs;
        this.scrollChat();
      }).catch(()=>{});
    },
    scrollChat(){ this.$nextTick(()=>{ let el=this.$refs.csBody; if(el) el.scrollTop = el.scrollHeight; }); },
    /* 申请转人工：不再触发智能应答，等商家（人工客服）来回复 */
    transferHuman(){
      if(!this.chatSessionId){ this.$message.warning('正在接入客服，请稍候'); return; }
      request.post('/shop/chatTransfer', { sessionId:this.chatSessionId, memberId:this.myMid() }).then(resp => {
        if(!resp || resp.result === 'failed'){ this.$message.error((resp && resp.cause) || '转人工失败'); return; }
        this.chatMsgs = (resp.data && resp.data.rows) || this.chatMsgs;
        this.scrollChat();
        this.$message.success('已通知人工客服，请稍候');
      }).catch(()=>{});
    },
    switchToTicket(){ this.chatVisible = false; this.openTicket(); },
    openTicket(){ this.ticketTitle=''; this.ticketContent=''; this.ticketVisible=true; },
    submitTicket(){
      if(!this.ticketTitle || !this.ticketContent){ this.$message.warning("请填写完整问题标题和内容"); return; }
      request.post('/shop/submitTicket', {
        title: this.ticketTitle, content: this.ticketContent, type: 'consult'
      }).then(resp => {
        if (resp && resp.result === 'failed') { this.$message.error(resp.cause || '提交失败'); return; }
        this.$message.success("工单提交成功，客服会尽快处理"); this.ticketVisible = false;
      }).catch(() => {});
    }
  }
}
</script>

<style scoped>
.shop-page{ min-height:100vh; background:#f5f5f5; padding-bottom:30px; }
.shop-header{ background:#2b2f38; color:#fff; }
.hd-inner{ max-width:1200px; margin:0 auto; height:60px; display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
.logo{ font-size:22px; font-weight:bold; color:#fff; cursor:pointer; }
.hd-right{ display:flex; align-items:center; gap:14px; }
.u-avatar{ font-size:22px; color:#fff; cursor:pointer; }
.u-name{ font-size:14px; color:#fff; cursor:pointer; }
.u-level{ padding:3px 10px; border-radius:4px; font-size:12px; font-weight:bold; }
.u-order{ font-size:13px; color:#c8c9cc; cursor:pointer; }
.u-order:hover{ color:#fff; }
.u-msg{ position:relative; font-size:13px; color:#c8c9cc; cursor:pointer; }
.u-msg:hover{ color:#fff; }
.msg-red-dot{ position:absolute; top:-8px; right:-14px; min-width:16px; height:16px; line-height:16px;
  padding:0 4px; border-radius:8px; background:#F56C6C; color:#fff; font-size:10px; font-style:normal; text-align:center; }
.u-logout{ font-size:13px; color:#909399; cursor:pointer; }
.u-logout:hover{ color:#F56C6C; }
.u-upgrade{ font-size:12px; color:#E6A23C; cursor:pointer; padding:3px 10px; border:1px solid #E6A23C; border-radius:12px; }
.u-upgrade:hover{ background:#E6A23C; color:#fff; }
.u-service{ font-size:12px; color:#409EFF; cursor:pointer; padding:3px 10px; border:1px solid #409EFF; border-radius:12px; }
.u-service:hover{ background:#409EFF; color:#fff; }
.u-signin{ font-size:12px; color:#67C23A; cursor:pointer; padding:3px 10px; border:1px solid #67C23A; border-radius:12px; }
.u-signin:hover{ background:#67C23A; color:#fff; }
.reg-btn{ background:#409EFF; color:#fff; border:none; padding:7px 20px; border-radius:16px; font-size:13px; cursor:pointer; }
.ticket-submit{ background:#409EFF; color:#fff; border:none; padding:8px 30px; border-radius:20px; font-size:14px; cursor:pointer; }
/* 在线客服聊天窗 */
.cs-head{ display:flex; align-items:center; gap:10px; padding-bottom:10px; border-bottom:1px solid #ebeef5; }
.cs-avatar{ width:38px; height:38px; border-radius:50%; background:#409EFF; color:#fff; font-size:13px; display:flex; align-items:center; justify-content:center; flex:none; }
.cs-name{ font-size:14px; font-weight:bold; color:#303133; }
.cs-tip{ font-size:12px; color:#909399; margin-top:2px; }
.cs-body{ height:280px; overflow-y:auto; padding:12px; background:#f7f8fa; border-radius:6px; margin-top:10px; }
.cs-empty{ text-align:center; color:#c0c4cc; font-size:13px; padding-top:110px; }
.cs-row{ display:flex; flex-direction:column; margin-bottom:12px; }
.cs-row.is-me{ align-items:flex-end; }
.cs-row.is-cs{ align-items:flex-start; }
.cs-bubble{ max-width:74%; padding:8px 12px; border-radius:8px; font-size:13px; line-height:1.6; word-break:break-all; }
.cs-bubble.b-me{ background:#409EFF; color:#fff; }
.cs-bubble.b-bot{ background:#fff; color:#303133; border:1px solid #e4e7ed; }
.cs-bubble.b-human{ background:#E1F5EE; color:#0F6E56; border:1px solid #9FE1CB; }
.cs-who{ font-size:11px; margin-bottom:3px; padding-left:2px; }
.cs-who.who-bot{ color:#909399; }
.cs-who.who-human{ color:#0F6E56; font-weight:bold; }
.cs-time{ font-size:11px; color:#c0c4cc; margin-top:4px; }
.cs-foot{ display:flex; align-items:center; gap:8px; margin-top:10px; }
.cs-input{ flex:1; height:34px; border:1px solid #dcdfe6; border-radius:4px; padding:0 10px; font-size:13px; outline:none; }
.cs-input:focus{ border-color:#409EFF; }
.cs-send{ background:#409EFF; color:#fff; border:none; height:34px; padding:0 18px; border-radius:4px; font-size:13px; cursor:pointer; }
.cs-ticket{ background:#fff; color:#909399; border:1px solid #dcdfe6; height:34px; padding:0 12px; border-radius:4px; font-size:12px; cursor:pointer; }
.lv-card{ background:#f8f9fb; border-radius:8px; padding:12px; margin-bottom:10px; cursor:pointer; text-align:center; border:2px solid transparent; }
.lv-card.on{ border-color:#E6A23C; background:#fdf6ec; }
.lv-card.disabled{ opacity:.5; cursor:not-allowed; }
.lv-normal{ background:#f4f4f5; color:#909399; }
.lv-gold{ background:#fdf6ec; color:#E6A23C; }
.lv-diamond{ background:#ecf5ff; color:#409EFF; }

.search-bar{ max-width:1200px; margin:15px auto; display:flex; gap:10px; padding:0 20px; }
.search-input{ flex:1; max-width:600px; padding:9px 16px; border:1px solid #ddd; border-radius:20px; font-size:14px; outline:none; }
.search-input:focus{ border-color:#409EFF; }
.search-btn{ background:#409EFF; color:#fff; border:none; padding:0 24px; border-radius:20px; font-size:14px; cursor:pointer; }

.main-layout{ max-width:1200px; margin:0 auto; padding:0 20px; display:flex; gap:16px; align-items:flex-start; }
.side-cat{ width:160px; background:#fff; border-radius:8px; padding:10px 0; flex-shrink:0; }
.cat-title{ font-size:14px; font-weight:bold; color:#303133; padding:8px 16px; border-bottom:1px solid #f0f0f0; margin-bottom:6px; }
.cat-item{ padding:9px 16px; font-size:13px; color:#606266; cursor:pointer; }
.cat-item:hover{ background:#f5f7fa; }
.cat-item.on{ color:#409EFF; font-weight:bold; background:#ecf5ff; }

.center-col{ flex:1; min-width:0; }
.ad-carousel{ border-radius:8px; overflow:hidden; margin-bottom:12px; }
.ad-slide{ height:300px; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; }
.ad-text{ font-size:30px; font-weight:bold; text-shadow:0 2px 8px rgba(0,0,0,.3); }
.banner-row{ display:flex; gap:12px; margin-bottom:12px; }
.banner-card{ flex:1; height:80px; border-radius:8px; overflow:hidden; cursor:pointer; }
.banner-img{ width:100%; height:100%; object-fit:cover; display:block; }
.banner-ph{ width:100%; height:100%; background:linear-gradient(135deg,#E6A23C,#F56C6C); color:#fff; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; }

.goods-grid{ display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; }
.goods-card{ background:#fff; border-radius:8px; overflow:hidden; cursor:pointer; transition:.2s; }
.goods-card:hover{ box-shadow:0 4px 12px rgba(0,0,0,.12); transform:translateY(-2px); }
.goods-img{ height:170px; background:#f0f2f5; display:flex; align-items:center; justify-content:center; color:#c0c4cc; font-size:48px; }
.real-img{ width:100%; height:100%; object-fit:cover; }
.goods-info{ padding:10px; }
.g-name{ font-size:14px; color:#303133; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.g-desc{ font-size:12px; color:#909399; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.g-bottom{ display:flex; align-items:center; justify-content:space-between; margin-top:8px; }
.g-price{ color:#F56C6C; font-size:18px; font-weight:bold; }
.g-tag{ background:#fff1f0; color:#F56C6C; font-size:11px; padding:2px 6px; border-radius:3px; }
.g-promo{ margin-top:5px; font-size:11px; color:#F56C6C; }
.g-promo s{ margin-left:4px; color:#C0C4CC; }

.right-ad{ width:200px; background:#fff; border-radius:8px; padding-bottom:8px; flex-shrink:0; }
.side-ad-card{ margin:8px; border-radius:6px; overflow:hidden; cursor:pointer; }
.side-ad-img{ width:100%; height:110px; object-fit:cover; display:block; }
.side-ad-ph{ height:110px; background:linear-gradient(135deg,#409EFF,#67C23A); color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:bold; }
.side-ad-t{ font-size:12px; color:#606266; padding:6px; }
.side-empty{ font-size:12px; color:#c0c4cc; text-align:center; padding:20px 0; }
.empty{ text-align:center; color:#909399; padding:60px 0; }
</style>

<style>
.center-dialog{ position:fixed !important; top:50% !important; left:50% !important; transform:translate(-50%,-50%) !important; margin:0 !important; }
</style>
