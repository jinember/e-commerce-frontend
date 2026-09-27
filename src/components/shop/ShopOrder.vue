<template>
  <div class="shop-page">
    <!-- 顶部 -->
    <div class="shop-header">
      <span class="back" @click="$router.push({name:'shopList'})">&lt; 返回商城</span>
      <span class="title">我的订单</span>
      <span class="back" @click="load">刷新</span>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div v-for="o in list" :key="o.id" class="order-card">        <div class="o-head">
          <span class="o-no">订单号：{{ o.orderNo }}</span>
          <span class="o-status" :class="'st'+o.status">{{ statusText(o.status) }}
            <span v-if="o.refundStatus===2" class="refund-rejected">退款被拒绝</span>
          </span>
        </div>
        <div class="o-body">
          <div class="o-goods">
            <i class="el-icon-goods"></i>
            <div class="o-ginfo">
              <div class="o-gname">{{ o.goodsName }}</div>
              <div class="o-sku">{{ o.skuName }}</div>
            </div>
          </div>
          <div class="o-price">
            <div>¥ {{ o.price }} × {{ o.count }}</div>
            <div class="o-total">合计 ¥ {{ o.totalPrice }}</div>
          </div>
        </div>

        <!-- 物流信息 -->
        <div v-if="o.logistics" class="logistics-box">
          <div class="log-title">物流信息</div>
          <div class="log-row">快递公司：{{ o.logistics.company }}</div>
          <div class="log-row">运单号：{{ o.logistics.trackingNo }}</div>
          <div v-if="o.logistics.shipTime" class="log-row">发货时间：{{ o.logistics.shipTime }}</div>
          <div v-if="o.logistics.receiveTime" class="log-row">收货时间：{{ o.logistics.receiveTime }}</div>
        </div>

        <div class="o-foot">
          收货人：{{ o.receiver }} {{ o.phone }}<br/>{{ o.address }}
          <div class="o-actions">
            <!-- 待付款：去付款 -->
            <button v-if="o.status==0" class="primary-btn" @click="payOrder(o)">去付款</button>
            <!-- 已发货：确认收货 -->
            <button v-if="o.status==2" class="primary-btn" @click="confirmReceive(o)">确认收货</button>
            <!-- 已完成：评价 + 开发票 -->
            <button v-if="o.status==3" class="primary-btn" @click="openComment(o)">去评价</button>
            <button v-if="o.status==3" class="invoice-btn" @click="applyInvoice(o)">申请开发票</button>
            <!-- 已付款/已发货：申请退款；被拒绝过则显示"重新申请退款" -->
            <button v-if="o.status==1 || o.status==2" class="refund-btn" @click="applyRefund(o)">
              {{ o.refundStatus===2 ? '重新申请退款' : '申请退款' }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="list.length==0" class="empty">暂无订单</div>
    </div>
  </div>
</template>

<script>
import { myOrders } from "@/api/pms_shop.js"
import { list as logisticsList } from "@/api/pms_logistics.js"
import { add as addRefund } from "@/api/pms_refund.js"
import request from "@/network/request.js"
export default {
  name:"ShopOrder",
  data(){ return { list:[] } },
  created(){ this.load() },
  methods:{
    load(){
      let name = this.$route.params.userName || window.localStorage.getItem("shopNick") || "匿名";
      myOrders(name).then( resp=>{
        let orders = resp.data || [];
        orders.forEach( (o,i) => {
          logisticsList(1, 1, { orderId: o.id }).then( r=>{
            this.$set(this.list, i, Object.assign({}, o, { logistics: (r.data||[])[0] }));
          }).catch(()=>{
            this.$set(this.list, i, o);
          });
        });
        this.list = orders;
      });
    },
    statusText( s ){
      return {0:"待付款",1:"已付款",2:"已发货",3:"已完成",4:"退款中",5:"已退款"}[s] || "未知";
    },
    /* 去付款 */
    payOrder(o){
      request.post('/shop/payOrder/' + o.id).then(resp => {
        if (resp && resp.result === 'success') {
          this.$message.success("支付成功！");
          this.load();
        } else {
          this.$message.error((resp && resp.cause) || '支付失败');
        }
      }).catch(() => {});
    },
    /* 确认收货 */
    confirmReceive(o){
      request.post('/shop/confirmReceive/' + o.id).then(resp => {
        if (resp && resp.result === 'success') {
          this.$message.success("收货成功，积分已到账！");
          this.load();
        } else {
          this.$message.error((resp && resp.cause) || '操作失败');
        }
      }).catch(() => {});
    },
    /* 打开评价弹窗 */
    openComment(o){
      this.$prompt("请输入评价内容", "评价商品", {
        inputPlaceholder: "说说你的使用感受..."
      }).then(({value})=>{
        request.post('/shop/submitComment', {
          orderId: o.id, spuId: o.goodsId,
          content: value || "好评", rating: 5,
          memberId: parseInt(window.localStorage.getItem('shopMemberId') || '1')
        }).then(resp => {
          if (resp && resp.result === 'success') {
            this.$message.success("评价成功，获得50积分！");
          } else {
            this.$message.error((resp && resp.cause) || '评价失败');
          }
        }).catch(() => {});
      }).catch(()=>{});
    },
    /* 申请退款 */
    applyRefund(o){
      this.$prompt("请输入退款原因", "申请退款", {
        inputPlaceholder: "如：七天无理由"
      }).then(({value})=>{
        addRefund({
          orderId: o.id,
          reason: value || "七天无理由",
          amount: o.totalPrice
        }).then((resp)=>{
          if (resp && resp.result === 'failed') {
            this.$message.warning((resp && resp.cause) || '申请失败，请稍后再试');
            return;
          }
          /* 提交成功：立即把订单置为「退款中」，按钮消失，提示等待处理 */
          this.$set(o, 'status', 4);
          this.$message.success((resp && resp.msg) || "退款申请已提交，请等待处理");
          this.load();
        }).catch(()=>{
          this.$message.error("网络异常，申请失败");
        });
      }).catch(()=>{});
    },
    /* 申请开发票 */
    applyInvoice(o){
      this.$prompt("请输入发票抬头", "申请开发票", {
        inputPlaceholder: "如：个人/公司名称"
      }).then(({value})=>{
        request.post('/shop/applyInvoice', {
          orderId: o.id,
          type: 'personal',
          title: value || '个人',
          taxNo: '',
          amount: o.totalPrice
        }).then(resp => {
          if (resp && resp.result === 'success') {
            this.$message.success("发票申请已提交");
          } else {
            this.$message.error((resp && resp.cause) || '申请失败');
          }
        }).catch(() => {});
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
.order-list{ padding:20px; display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; }
.order-card{ background:#fff; border-radius:8px; padding:14px; box-shadow:0 1px 4px rgba(0,0,0,.04); }
.o-head{ display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:1px solid #f0f0f0; }
.o-no{ font-size:12px; color:#909399; }
.o-status{ font-size:12px; }
.st0{ color:#E6A23C; } .st1{ color:#409EFF; }
.st2{ color:#409EFF; } .st3{ color:#67C23A; } .st4{ color:#E6A23C; } .st5{ color:#909399; }
.refund-rejected{ display:inline-block; margin-left:6px; padding:1px 6px; border-radius:3px;
  background:#F56C6C; color:#fff; font-size:11px; line-height:1.6; }
.o-body{ display:flex; justify-content:space-between; padding:12px 0; }
.o-goods{ display:flex; }
.o-goods i{ font-size:40px; color:#c0c4cc; }
.o-ginfo{ margin-left:10px; }
.o-gname{ font-size:14px; color:#303133; }
.o-sku{ font-size:12px; color:#909399; margin-top:4px; }
.o-price{ text-align:right; font-size:13px; color:#606266; }
.o-total{ color:#F56C6C; font-weight:bold; margin-top:4px; }
.logistics-box{ background:#f8f9fb; border-radius:6px; padding:10px; margin:8px 0; }
.log-title{ font-size:13px; font-weight:bold; color:#303133; margin-bottom:6px; }
.log-row{ font-size:12px; color:#606266; line-height:1.8; }
.o-foot{ font-size:12px; color:#909399; padding-top:8px; border-top:1px solid #f0f0f0; line-height:1.6; }
.o-actions{ margin-top:8px; display:flex; gap:8px; flex-wrap:wrap; }
.primary-btn{ background:#409EFF; color:#fff; border:none; padding:4px 12px; border-radius:4px; font-size:12px; cursor:pointer; }
.primary-btn:active{ opacity:.85; }
.refund-btn{ background:#fff; color:#F56C6C; border:1px solid #F56C6C; padding:4px 12px; border-radius:4px; font-size:12px; cursor:pointer; }
.refund-btn:active{ opacity:.8; }
.invoice-btn{ background:#fff; color:#E6A23C; border:1px solid #E6A23C; padding:4px 12px; border-radius:4px; font-size:12px; cursor:pointer; }
.invoice-btn:active{ opacity:.8; }
.empty{ grid-column:1 / -1; text-align:center; color:#909399; padding:60px 0; }
</style>
