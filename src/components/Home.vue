<template>
  <div class="home-page">

    <!-- 【1】欢迎横幅 -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-title">欢迎使用电商管理系统</div>
        <div class="hero-sub">今天是 {{ today }}，祝您工作顺利</div>
        <div class="hero-actions">
          <el-button v-if="hasPerm('goods')" type="primary" icon="el-icon-plus" @click="go('/publishBaseInfo')">发布新商品</el-button>
          <el-button v-if="hasPerm('data')" icon="el-icon-data-analysis" @click="go('/dashboard')">查看数据全景</el-button>
        </div>
      </div>
      <div class="hero-right">
        <i class="el-icon-monitor"></i>
      </div>
    </div>

    <!-- 【2】统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6" v-for="(card, i) in statCards" :key="i">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: card.color }">
            <i :class="card.icon"></i>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ card.num }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 【3】功能导航 -->
    <el-card shadow="never" class="nav-card">
      <div slot="header" class="nav-header">
        <span>功能导航</span>
        <span class="nav-tip">点击卡片快速进入对应模块</span>
      </div>

      <div class="group-block" v-for="(g, gi) in visibleGroups" :key="gi">
        <div class="group-title">{{ g.group }}</div>
        <el-row :gutter="20">
          <el-col :span="6" v-for="(m, i) in g.items" :key="gi + '-' + i" style="margin-bottom: 20px;">
            <div class="module-item" :class="{ disabled: !m.path }" @click="m.path && go(m.path)">
              <div class="module-icon" :style="{ background: m.color }">
                <i :class="m.icon"></i>
              </div>
              <div class="module-name">{{ m.name }}</div>
              <div class="module-desc">{{ m.path ? m.desc : '开发中…' }}</div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

  </div>
</template>

<script>
import { getHomeStats } from '@/api/home.js'
export default {
  name: 'Home',
  data() {
    return {
      today: '',
      statCards: [
        { num: '-', label: '商品总数',   icon: 'el-icon-goods',       color: '#409EFF' },
        { num: '-',   label: '今日订单',  icon: 'el-icon-tickets',     color: '#67C23A' },
        { num: '-', label: '注册用户',  icon: 'el-icon-user',        color: '#E6A23C' },
        { num: '¥-', label: '今日销售额', icon: 'el-icon-coin',      color: '#F56C6C' }
      ],
      moduleGroups: [
        { group: '交易', items: [
          { name: '订单管理', desc: '订单查询与流转', icon: 'el-icon-tickets',   color: '#409EFF', path: '/order', perm: 'trade' },
          { name: '支付流水', desc: '支付记录查询',   icon: 'el-icon-bank-card',  color: '#67C23A', path: '/payment', perm: 'trade' },
          { name: '物流管理', desc: '发货与签收',     icon: 'el-icon-truck',      color: '#E6A23C', path: '/logistics', perm: 'trade' },
          { name: '退款管理', desc: '退款审核处理',   icon: 'el-icon-refresh-left', color: '#F56C6C', path: '/refund', perm: 'trade' },
          { name: '购物车',   desc: '用户加购记录',   icon: 'el-icon-shopping-cart-2', color: '#409EFF', path: '/cart', perm: 'trade' },
          { name: '收藏夹',   desc: '用户收藏记录',   icon: 'el-icon-star-off',   color: '#67C23A', path: '/favorite', perm: 'userop' }
        ]},
        { group: '会员', items: [
          { name: '会员管理', desc: '会员档案维护',   icon: 'el-icon-user',       color: '#409EFF', path: '/member', perm: 'userop' },
          { name: '收货地址', desc: '地址库维护',     icon: 'el-icon-location-outline', color: '#67C23A', path: '/address', perm: 'userop' },
          { name: '积分流水', desc: '积分变动记录',   icon: 'el-icon-coin',       color: '#E6A23C', path: '/pointLog', perm: 'userop' },
          { name: '签到记录', desc: '每日签到明细',   icon: 'el-icon-date',       color: '#F56C6C', path: '/signIn', perm: 'userop' },
          { name: '优惠券',   desc: '券模板与核销',   icon: 'el-icon-ticket',     color: '#409EFF', path: '/coupon', perm: 'marketing' },
          { name: '商品评价', desc: '评论与评分',     icon: 'el-icon-chat-line-square', color: '#67C23A', path: '/comment', perm: 'userop' }
        ]},
        { group: '库存与供应', items: [
          { name: '库存管理', desc: '库存与安全库存', icon: 'el-icon-box',        color: '#409EFF', path: '/stock', perm: 'goods' },
          { name: '库存流水', desc: '出入库明细',     icon: 'el-icon-sort',       color: '#67C23A', path: '/stockLog', perm: 'goods' },
          { name: '供应商',   desc: '供应商档案',     icon: 'el-icon-office-building', color: '#E6A23C', path: '/supplier', perm: 'goods' }
        ]},
        { group: '商品', items: [
          { name: '商品管理', desc: '在售商品维护',   icon: 'el-icon-goods',      color: '#409EFF', path: '/goods', perm: 'goods' },
          { name: 'SKU 列表', desc: '单品与规格',     icon: 'el-icon-menu',       color: '#67C23A', path: '/skuList', perm: 'goods' },
          { name: '品牌管理', desc: '品牌库维护',     icon: 'el-icon-star-on',    color: '#E6A23C', path: '/brand', perm: 'goods' },
          { name: '商品类别', desc: '分类层级管理',   icon: 'el-icon-folder',     color: '#F56C6C', path: '/category', perm: 'goods' },
          { name: '属性分组', desc: '分类属性分组',   icon: 'el-icon-collection', color: '#409EFF', path: '/attrGroup', perm: 'goods' },
          { name: '规格参数', desc: '参数模板维护',   icon: 'el-icon-cpu',        color: '#67C23A', path: '/goodsAttr', perm: 'goods' },
          { name: '销售属性', desc: '规格值维护',     icon: 'el-icon-price-tag',  color: '#E6A23C', path: '/saleAttr', perm: 'goods' },
          { name: '发布商品', desc: '五步流程发布',   icon: 'el-icon-circle-plus', color: '#F56C6C', path: '/publishBaseInfo', perm: 'goods' }
        ]},
        { group: '运营', items: [
          { name: '促销活动', desc: '活动与折扣',     icon: 'el-icon-present',    color: '#409EFF', path: '/promotion', perm: 'marketing' },
          { name: '广告位',   desc: '轮播与弹窗',     icon: 'el-icon-picture',    color: '#E6A23C', path: '/ad', perm: 'marketing' },
          { name: '站内消息', desc: '消息推送记录',   icon: 'el-icon-message',    color: '#F56C6C', path: '/message', perm: 'userop' },
          { name: '售后工单', desc: '工单处理',       icon: 'el-icon-service',    color: '#409EFF', path: '/ticket', perm: 'userop' },
          { name: '客服会话', desc: '对话明细与质量', icon: 'el-icon-headset',    color: '#909399', path: '/chatSession', perm: 'userop' },
          { name: '发票管理', desc: '开票记录',       icon: 'el-icon-document',   color: '#67C23A', path: '/invoice', perm: 'userop' }
        ]},
        { group: '数据', items: [
          { name: '数据全景', desc: '经营数据图表',   icon: 'el-icon-data-analysis', color: '#409EFF', path: '/dashboard', perm: 'data' },
          { name: '销售统计', desc: '销售报表',       icon: 'el-icon-s-data',     color: '#67C23A', path: '/saleStat', perm: 'trade' },
          { name: '用户行为', desc: '埋点日志',       icon: 'el-icon-view',       color: '#E6A23C', path: '/userBehavior', perm: 'userop' },
          { name: '浏览历史', desc: '浏览足迹',       icon: 'el-icon-time',       color: '#F56C6C', path: '/browseHistory', perm: 'userop' }
        ]},
        { group: '系统', items: [
          { name: '用户管理', desc: '账号查询与维护', icon: 'el-icon-user',       color: '#409EFF', path: '/user', perm: 'system' },
          { name: '部门管理', desc: '组织结构维护',   icon: 'el-icon-share',      color: '#67C23A', path: '/dept', perm: 'system' },
          { name: '角色权限', desc: '角色与授权',     icon: 'el-icon-lock',       color: '#E6A23C', path: '/role', perm: 'system' }
        ]},
        { group: '阶段二 · 大数据分析', items: [
          { name: '全链路行为', desc: '模块1 漏斗与入口', icon: 'el-icon-s-data',   color: '#409EFF', path: '/analysisFunnel', perm: 'data' },
          { name: '订单分析',   desc: '模块2 成交与退款', icon: 'el-icon-s-data',   color: '#67C23A', path: '/analysisOrder', perm: 'data' },
          { name: '评价分析',   desc: '模块3 星级与关键词', icon: 'el-icon-s-data', color: '#E6A23C', path: '/analysisComment', perm: 'data' },
          { name: '交流分析',   desc: '模块4 会话与工单', icon: 'el-icon-s-data',   color: '#F56C6C', path: '/analysisChat', perm: 'data' },
          { name: 'ETL 日志',   desc: '脚本运行结果',   icon: 'el-icon-cpu',        color: '#909399', path: '/etlJobLog', perm: 'data' }
        ]}
      ]
    }
  },
  computed: {
    menuPerms() {
      return window.sessionStorage.getItem('menuPerms') || ''
    },
    /* 按当前角色权限过滤：组内只保留有权限的入口，整组为空则不显示 */
    visibleGroups() {
      const perms = this.menuPerms
      return this.moduleGroups
        .map(g => ({ group: g.group, items: g.items.filter(m => perms.includes(m.perm)) }))
        .filter(g => g.items.length > 0)
    }
  },
  mounted() {
    const d = new Date()
    const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
    this.today = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${week}`
    /* 加载真实统计数据 */
    getHomeStats().then(resp => {
      const d = resp.data || {}
      this.statCards[0].num = Number(d.goodsCount || 0).toLocaleString()
      this.statCards[1].num = Number(d.todayOrders || 0).toLocaleString()
      this.statCards[2].num = Number(d.memberCount || 0).toLocaleString()
      this.statCards[3].num = '¥' + Number(d.todaySales || 0).toLocaleString()
    })
  },
  methods: {
    hasPerm(p) {
      return (this.menuPerms || '').includes(p)
    },
    go(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style scoped>
.home-page { padding: 16px; }

/* 欢迎横幅 */
.hero {
  display: flex; justify-content: space-between; align-items: center;
  background: linear-gradient(135deg, #1f2d3d 0%, #3a5a82 100%);
  border-radius: 12px; padding: 32px 36px; color: #fff; margin-bottom: 20px;
}
.hero-title { font-size: 26px; font-weight: 600; margin-bottom: 8px; }
.hero-sub { font-size: 14px; opacity: .8; margin-bottom: 18px; }
.hero-actions .el-button { margin-right: 10px; }
.hero-right i { font-size: 72px; opacity: .25; }

/* 统计卡片 */
.stat-row { margin-bottom: 20px; }
.stat-card {
  display: flex; align-items: center;
  background: #fff; border-radius: 10px; padding: 18px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}
.stat-icon {
  width: 48px; height: 48px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 24px; margin-right: 14px;
}
.stat-num { font-size: 22px; font-weight: 600; color: #1f2d3d; }
.stat-label { font-size: 13px; color: #909399; margin-top: 2px; }

/* 功能导航 */
.nav-card { border-radius: 10px; }
.nav-header { display: flex; justify-content: space-between; align-items: center; }
.nav-tip { font-size: 12px; color: #909399; font-weight: normal; }
.module-item {
  border: 1px solid #ebeef5; border-radius: 10px; padding: 18px;
  text-align: center; cursor: pointer; transition: all .2s; height: 100%;
  box-sizing: border-box;
}
.module-item:hover { border-color: #409EFF; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(64,158,255,.15); }
.module-item.disabled { cursor: not-allowed; }
.module-item.disabled:hover { border-color: #ebeef5; transform: none; box-shadow: none; }
.module-icon {
  width: 52px; height: 52px; border-radius: 50%;
  margin: 0 auto 10px; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 24px;
}
.module-item.disabled .module-icon { background: #c0c4cc !important; }
.module-name { font-size: 15px; font-weight: 600; color: #1f2d3d; }
.module-item.disabled .module-name { color: #909399; }
.module-desc { font-size: 12px; color: #909399; margin-top: 4px; }

/* 分组标题 */
.group-block { margin-bottom: 8px; }
.group-block:last-child .el-row { margin-bottom: 0; }
.group-title {
  font-size: 13px; font-weight: 600; color: #606266;
  margin: 6px 0 12px; padding-left: 8px; border-left: 3px solid #409EFF;
}
</style>
