<template>
  <div id="app">
    <!-- 【1】顶部横栏 -->
    <div class="topbar" v-if="!isLogin">
      <div class="logo">
        <i class="el-icon-s-shop"></i>
        <span>电商管理后台</span>
      </div>
      <div class="topbar-right">
        <span class="user-welcome" v-if="adminUser">欢迎，{{ adminUser }}</span>
        <el-button type="text" icon="el-icon-switch-button" class="logout-btn" @click="logout">退出登录</el-button>
      </div>
    </div>

    <!-- 【2】主体：左侧菜单 + 内容区 -->
    <div class="main" v-if="!isLogin">
      <el-menu
        :default-active="activeMenu"
        class="sidebar"
        mode="vertical"
        background-color="#ffffff"
        text-color="#5a6373"
        active-text-color="#409EFF"
        router>
        <el-menu-item index="/home"><i class="el-icon-s-home"></i>首页</el-menu-item>
        <el-menu-item index="/shop"><i class="el-icon-s-shop"></i>C端商城</el-menu-item>
        <!-- 数据中心：数据全景 + 阶段二大数据分析（ads_* 四张离线 ETL 结果表） -->
        <el-submenu index="data">
          <template slot="title"><i class="el-icon-s-data"></i><span>数据中心</span></template>
          <el-menu-item index="/dashboard"><i class="el-icon-house"></i>数据全景</el-menu-item>
          <el-menu-item index="/analysisFunnel"><i class="el-icon-data-line"></i>用户行为</el-menu-item>
          <el-menu-item index="/analysisOrder"><i class="el-icon-shopping-cart-2"></i>交易分析</el-menu-item>
          <el-menu-item index="/analysisComment"><i class="el-icon-pie-chart"></i>评价分析</el-menu-item>
          <el-menu-item index="/analysisChat"><i class="el-icon-service"></i>客服分析</el-menu-item>
          <el-menu-item index="/analysisHourlyAll"><i class="el-icon-time"></i>时段分析</el-menu-item>
          <el-menu-item index="/analysisProfile"><i class="el-icon-user"></i>用户画像</el-menu-item>
          <el-menu-item index="/etlJobLog"><i class="el-icon-cpu"></i>ETL 执行日志</el-menu-item>
        </el-submenu>

        <el-submenu index="userop" v-if="showUserOp">
          <template slot="title"><i class="el-icon-user-solid"></i><span>用户运营</span></template>
          <el-menu-item index="/member"><i class="el-icon-medal"></i>会员管理</el-menu-item>
          <el-menu-item index="/userBehavior"><i class="el-icon-data-line"></i>行为日志</el-menu-item>
          <el-menu-item index="/favorite"><i class="el-icon-star-off"></i>收藏记录</el-menu-item>
          <el-menu-item index="/comment"><i class="el-icon-chat-dot-square"></i>商品评价</el-menu-item>
          <el-menu-item index="/pointLog"><i class="el-icon-coin"></i>积分流水</el-menu-item>
          <el-menu-item index="/signIn"><i class="el-icon-edit-outline"></i>签到打卡</el-menu-item>
          <el-menu-item index="/browseHistory"><i class="el-icon-time"></i>浏览历史</el-menu-item>
          <el-menu-item index="/message"><i class="el-icon-message"></i>站内消息</el-menu-item>
          <el-menu-item index="/ticket"><i class="el-icon-service"></i>客服工单</el-menu-item>
          <el-menu-item index="/chatSession"><i class="el-icon-headset"></i>客服会话</el-menu-item>
          <el-menu-item index="/invoice"><i class="el-icon-tickets"></i>发票管理</el-menu-item>
          <el-menu-item index="/address"><i class="el-icon-location-outline"></i>收货地址</el-menu-item>
        </el-submenu>
        <el-submenu index="goods" v-if="showGoods">
          <template slot="title"><i class="el-icon-s-goods"></i><span>商品管理</span></template>
          <el-menu-item index="/category"><i class="el-icon-collection"></i>商品类别</el-menu-item>
          <el-menu-item index="/brand"><i class="el-icon-star-off"></i>品牌管理</el-menu-item>
          <el-menu-item index="/attrGroup"><i class="el-icon-collection"></i>属性分组</el-menu-item>
          <el-menu-item index="/goodsAttr"><i class="el-icon-document"></i>规格参数</el-menu-item>
          <el-menu-item index="/saleAttr"><i class="el-icon-set-up"></i>销售属性</el-menu-item>
          <el-menu-item index="/publishBaseInfo"><i class="el-icon-circle-plus-outline"></i>发布商品</el-menu-item>
          <el-menu-item index="/goods"><i class="el-icon-goods"></i>商品管理</el-menu-item>
          <el-menu-item index="/skuList"><i class="el-icon-goods"></i>SKU管理</el-menu-item>
          <el-menu-item index="/stock"><i class="el-icon-box"></i>库存管理</el-menu-item>
          <el-menu-item index="/stockLog"><i class="el-icon-files"></i>出入库流水</el-menu-item>
          <el-menu-item index="/supplier"><i class="el-icon-office-building"></i>供应商</el-menu-item>
        </el-submenu>

        <el-submenu index="trade" v-if="showTrade">
          <template slot="title"><i class="el-icon-s-order"></i><span>交易管理</span></template>
          <el-menu-item index="/order"><i class="el-icon-tickets"></i>订单管理</el-menu-item>
          <el-menu-item index="/payment"><i class="el-icon-wallet"></i>支付流水</el-menu-item>
          <el-menu-item index="/logistics"><i class="el-icon-truck"></i>物流信息</el-menu-item>
          <el-menu-item index="/refund"><i class="el-icon-refresh-left"></i>退款售后</el-menu-item>
          <el-menu-item index="/cart"><i class="el-icon-shopping-cart-2"></i>购物车</el-menu-item>
          <el-menu-item index="/saleStat"><i class="el-icon-data-analysis"></i>销售统计</el-menu-item>
        </el-submenu>

        <el-submenu index="marketing" v-if="showMarketing">
          <template slot="title"><i class="el-icon-s-promotion"></i><span>营销管理</span></template>
          <el-menu-item index="/coupon"><i class="el-icon-price-tag"></i>优惠券</el-menu-item>
          <el-menu-item index="/promotion"><i class="el-icon-sell"></i>促销活动</el-menu-item>
          <el-menu-item index="/ad"><i class="el-icon-picture-outline"></i>广告设置</el-menu-item>
        </el-submenu>

        <el-submenu index="system" v-if="showSystem">
          <template slot="title"><i class="el-icon-s-custom"></i><span>系统管理</span></template>
          <el-menu-item index="/user"><i class="el-icon-key"></i>用户管理</el-menu-item>
          <el-menu-item index="/role"><i class="el-icon-check"></i>角色管理</el-menu-item>
          <el-menu-item index="/dept"><i class="el-icon-office-building"></i>部门管理</el-menu-item>
        </el-submenu>
      </el-menu>

      <div class="content">
        <router-view/>
      </div>
    </div>
    <!-- 登录页全屏 -->
    <div v-if="isLogin" style="height:100vh;">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data(){ return { P:1, roleId: window.sessionStorage.getItem('roleId') || '', menuPerms: window.sessionStorage.getItem('menuPerms') || '', adminUser: window.sessionStorage.getItem('adminUser') || '' } },
  watch:{
    $route(){ this.roleId = window.sessionStorage.getItem('roleId') || ''; this.menuPerms = window.sessionStorage.getItem('menuPerms') || ''; this.adminUser = window.sessionStorage.getItem('adminUser') || ''; }
  },
  computed:{
    activeMenu(){ return this.$route.path; },
    isLogin(){ return this.$route.path === '/login'; },
    isAdmin(){ return window.sessionStorage.getItem('roleId') === '5'; },
    showGoods(){ return (this.menuPerms || '').includes('goods'); },
    showTrade(){ return (this.menuPerms || '').includes('trade'); },
    showUserOp(){ return (this.menuPerms || '').includes('userop'); },
    showMarketing(){ return (this.menuPerms || '').includes('marketing'); },
    showSystem(){ return (this.menuPerms || '').includes('system'); }
  },
  methods:{
    logout(){
      this.$confirm("确认退出系统吗?", "提示", { type:"warning" })
      .then(()=>{
        window.sessionStorage.removeItem("pubKey");
        window.sessionStorage.removeItem("adminToken");
        window.sessionStorage.removeItem("adminUser");
        window.sessionStorage.removeItem("roleId");
        Object.keys(window.sessionStorage)
          .filter( k=> k.startsWith("skuDiscount-") )
          .forEach( k=> window.sessionStorage.removeItem(k) );
        this.$router.push({ name:'login' });
      }).catch(()=>{});
    }
  },
  created(){
    const PUB_PAGES = ['publishBaseInfo','setGoodsAttr','setGoodsSale','setGoodsSku','setGoodsDone'];
    const nav = performance.getEntriesByType('navigation')[0];
    const isReload = nav ? nav.type === 'reload' : (window.performance.navigation.type === 1);
    if( isReload && PUB_PAGES.includes( this.$route.name ) ){
      window.sessionStorage.removeItem("pubKey");
      window.sessionStorage.removeItem("adminToken");
      window.sessionStorage.removeItem("adminUser");
      Object.keys(window.sessionStorage)
        .filter( k=> k.startsWith('skuDiscount-') )
        .forEach( k=> window.sessionStorage.removeItem(k) );
      if( this.$route.name !== 'publishBaseInfo' ){
        this.$router.replace({ name:'publishBaseInfo' });
      }
    }
  }
}
</script>

<style>
body{ margin:0px; }
#app{ color:#2c3e50; }
.topbar{
  height:50px; background:#304156; color:#fff;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 20px; box-shadow:0 2px 4px rgba(0,0,0,.1);
}
.logo{ font-size:18px; font-weight:bold; }
.logo i{ margin-right:8px; color:#409EFF; font-size:22px; vertical-align:middle; }
.logo span{ vertical-align:middle; }
.logout-btn{ color:#fff !important; font-size:14px; }
.logout-btn:hover{ color:#409EFF !important; }
.topbar-right{ display:flex; align-items:center; }
.user-welcome{ color:#fff; font-size:14px; margin-right:16px; }
.main{ display:flex; height:calc(100vh - 50px); overflow:hidden; }
.sidebar{
  width:220px; overflow-y:auto; flex-shrink:0;
  border-right:1px solid #e4e7ed; overflow-x:hidden;
}
.content{ flex:1; overflow-y:auto; padding:15px; background:#f0f2f5; min-width:0; }
</style>
