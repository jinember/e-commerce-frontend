<template>
  <div class="shop-page">
    <!-- 顶部 -->
    <div class="shop-header">
      <span class="back" @click="$router.push({name:'shopList'})">&lt; 返回</span>
      <span class="title">商品详情</span>
      <span class="back" @click="goOrder">我的订单</span>
    </div>

    <!-- 上部分：左图右信息 -->
    <div class="detail-top">
      <div class="detail-left">
        <!-- 商品主图 -->
        <div class="big-img">
          <img v-if="curImgUrl" :src="curImgUrl" class="big-real-img"/>
          <i v-else class="el-icon-goods"></i>
        </div>
      </div>

      <div class="detail-right">
        <!-- 价格与名称 -->
        <div class="info-card">
          <div class="price-row">
            <span class="price">¥ {{ unitPrice.toFixed(2) }}</span>
            <span v-if="promotion" class="old-price">¥ {{ (curSku.price||0).toFixed(2) }}</span>
            <span v-if="promotion" class="promo-tag">{{ promotion.type }}</span>
            <span class="sold">已售 {{ curSku.saleCount || 0 }}</span>
            <span class="sold">浏览 {{ spu.viewCount || 0 }}</span>
            <span class="sold">好评 {{ (spu.goodRate || 5).toFixed(1) }}分</span>
            <span class="fav-btn" @click="toggleFav">
              <i :class="isFav?'el-icon-star-on':'el-icon-star-off'"></i> {{ isFav?'已收藏':'收藏' }}
            </span>
          </div>
          <div v-if="promotion" class="promo-bar">
            <i class="el-icon-star-on"></i>
            {{ promotion.name }}　·　{{ (promotion.discount*10).toFixed(1) }}折
            <span class="promo-end">（{{ promotion.endTime }} 截止）</span>
          </div>
          <div class="g-name">{{ spu.goodsName }}</div>
          <div class="g-desc">{{ spu.goodsDetails }}</div>
        </div>

        <!-- 选择规格 -->
        <div class="spec-card">
          <div class="sec-title">选择规格</div>
          <div class="sku-list">
            <div v-for="(s,i) in skuList" :key="s.skuId"
                 class="sku-item" :class="{on: i==selIdx}"
                 @click="selIdx=i">
              {{ s.skuName }}
            </div>
          </div>
          <div class="qty-row">
            <span>数量</span>
            <div class="qty">
              <span @click="qty>1 && qty--">-</span>
              <span class="num">{{ qty }}</span>
              <span @click="qty++">+</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下部分：券/收货/评价 -->
    <div class="detail-bottom">

    <!-- 优惠券：选一张用在这一单 -->
    <div class="spec-card">
      <div class="sec-title">
        优惠券
        <span class="cp-more" @click="openCouponCenter">领券中心 &gt;</span>
      </div>
      <div v-if="coupons.length==0" class="no-comment">还没有可用优惠券</div>
      <div v-for="c in coupons" :key="c.recordId"
           class="cp-item" :class="{on: selCoupon && selCoupon.recordId==c.recordId}"
           @click="pickCoupon(c)">
        <div class="cp-left">
          <div class="cp-val">¥ {{ c.value }}</div>
          <div class="cp-limit">{{ c.minAmount>0 ? ('满'+c.minAmount+'可用') : '无门槛' }}</div>
        </div>
        <div class="cp-right">
          <div class="cp-name">{{ c.name }}</div>
          <div class="cp-end">{{ c.endTime }} 前有效</div>
        </div>
        <div class="cp-check">{{ selCoupon && selCoupon.recordId==c.recordId ? '已选' : '选择' }}</div>
      </div>
    </div>

    <!-- 收货信息 -->
    <div class="spec-card">
      <div class="sec-title">收货信息</div>
      <input v-model="form.receiver" placeholder="收货人姓名" class="ipt"/>
      <input v-model="form.phone" placeholder="联系电话" class="ipt"/>
      <input v-model="form.address" placeholder="收货地址" class="ipt"/>
    </div>

    <!-- 用户评价 -->
    <div class="spec-card">
      <div class="sec-title">用户评价 ({{ commentList.length }})</div>
      <div v-if="commentList.length==0" class="no-comment">暂无评价</div>
      <div v-for="c in commentList" :key="c.id" class="comment-item">
        <div class="c-head">
          <span class="c-user">用户{{ c.memberId }}</span>
          <span class="c-stars">{{ '★'.repeat(c.rating) }}{{ '☆'.repeat(5-c.rating) }}</span>
        </div>
        <div class="c-content">{{ c.content }}</div>
      </div>
    </div>
    </div><!-- /detail-bottom -->

    <!-- 底部下单栏 -->
    <div class="buy-bar">
      <div class="total">
        合计：<span>¥ {{ totalPrice.toFixed(2) }}</span>
        <div v-if="saveAmount>0" class="save-tip">
          活动立减 ¥{{ promoSave.toFixed(2) }}<template v-if="selCoupon"> · 券再减 ¥{{ couponSave.toFixed(2) }}</template>
        </div>
      </div>
      <button class="cart-btn" @click="addToCart">加入购物车</button>
      <button class="buy-btn" @click="submit">立即下单</button>
    </div>

    <!-- 领券中心弹窗 -->
    <div v-if="centerVisible" class="cp-mask" @click.self="centerVisible=false">
      <div class="cp-dialog">
        <div class="cp-d-head">
          领券中心
          <span class="cp-close" @click="centerVisible=false">×</span>
        </div>
        <div v-if="centerList.length==0" class="no-comment">暂无可领取的优惠券</div>
        <div v-for="c in centerList" :key="c.couponId" class="cp-item">
          <div class="cp-left">
            <div class="cp-val">¥ {{ c.value }}</div>
            <div class="cp-limit">{{ c.minAmount>0 ? ('满'+c.minAmount+'可用') : '无门槛' }}</div>
          </div>
          <div class="cp-right">
            <div class="cp-name">{{ c.name }}</div>
            <div class="cp-end">剩余 {{ c.remain }} 张 · {{ c.endTime }} 截止</div>
          </div>
          <div class="cp-check" :class="{got:c.owned}" @click="receiveOne(c)">
            {{ c.owned ? '已领取' : '领取' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { shopDetail, submitOrder, couponList, receiveCoupon, myCoupons } from "@/api/pms_shop.js"
import { list as commentList } from "@/api/pms_comment.js"
import { list as favList, add as addFav, remove as removeFav } from "@/api/pms_favorite.js"
import request from "@/network/request.js"
export default {
  name:"ShopDetail",
  data(){
    return {
      spu:{}, skuList:[], selIdx:0, qty:1,
      BASE:'http://localhost:8090/mall-sys',
      memberLevel:'普通会员', form:{ receiver:"", phone:"", address:"" },
      commentList:[], isFav:false, favId:null,
      /* 【营销联动】当前命中的活动 + 我的可用优惠券 */
      promotion:null, coupons:[], selCoupon:null, centerVisible:false, centerList:[]
    }
  },
  computed:{
    curSku(){ return this.skuList[this.selIdx] || {} },
    /* 单价：命中活动就用活动价（后端返回的 promoPrice），否则原价 */
    unitPrice(){
      let p = this.curSku.price || 0;
      if(this.promotion && this.curSku.promoPrice != null) p = this.curSku.promoPrice;
      return p;
    },
    goodsAmount(){ return this.unitPrice * this.qty },
    /* 活动省了多少 */
    promoSave(){
      if(!this.promotion) return 0;
      return Math.max(0, (this.curSku.price||0) - this.unitPrice) * this.qty;
    },
    /* 这张券在这单能不能用（达到门槛才算），实际减多少 */
    couponSave(){
      if(!this.selCoupon) return 0;
      let base = this.goodsAmount;
      if(this.selCoupon.minAmount && base < this.selCoupon.minAmount) return 0;
      return Math.min(base, this.selCoupon.value || 0);
    },
    saveAmount(){ return Math.round((this.promoSave + this.couponSave)*100)/100 },
    totalPrice(){ return Math.max(0, this.goodsAmount - this.couponSave) },
    curImgUrl(){
      /* 优先显示选中SKU的图，没有就显示SPU主图 */
      if(this.curSku.defaultImage){
        return this.BASE + '/PublishGoods/showImg/album/' + this.curSku.defaultImage;
      }
      if(this.spu.mainImage){
        return this.BASE + '/PublishGoods/showImg/goods/' + this.spu.mainImage;
      }
      return '';
    }
  },
  created(){
    let spuId = this.$route.params.spuId;
    let mid = window.localStorage.getItem('shopMemberId') || '1';
    shopDetail(spuId + '?memberId=' + mid).then( resp=>{
      let d = resp.data || {};
      this.spu = d.spu || {};
      this.skuList = d.skuList || [];
      this.promotion = d.promotion || null;   /* 【营销联动】命中的活动 */
    });
    this.loadMyCoupons();
    this.form.receiver = window.localStorage.getItem('shopNick') || '';
      this.form.phone = window.localStorage.getItem('shopPhone') || '';
      this.memberLevel = window.localStorage.getItem('shopLevel') || '普通会员';
    this.loadComments(spuId);
    this.checkFav(spuId);
  },
  methods:{
    loadComments(spuId){
      commentList(1, 10, { spuId: spuId }).then( resp=>{
        this.commentList = resp.data || [];
      }).catch(()=>{});
    },
    myMid(){ return parseInt(window.localStorage.getItem('shopMemberId') || '1'); },
    /* 我的未使用优惠券 */
    loadMyCoupons(){
      myCoupons(this.myMid()).then( resp=>{
        this.coupons = resp.data || [];
      }).catch(()=>{ this.coupons = []; });
    },
    pickCoupon(c){
      /* 再点一次等于取消选择 */
      if(this.selCoupon && this.selCoupon.recordId==c.recordId){ this.selCoupon = null; return; }
      if(c.minAmount && this.goodsAmount < c.minAmount){
        this.$message.warning('订单金额未满 ' + c.minAmount + ' 元，暂不可用');
        return;
      }
      this.selCoupon = c;
    },
    /* 领券中心 */
    openCouponCenter(){
      this.centerVisible = true;
      couponList(this.myMid()).then( resp=>{
        this.centerList = resp.data || [];
      }).catch(()=>{ this.centerList = []; });
    },
    receiveOne(c){
      receiveCoupon({ memberId:this.myMid(), couponId:c.couponId }).then(()=>{
        this.$message.success('领取成功');
        c.owned = true; c.remain = Math.max(0,(c.remain||1)-1);
        this.loadMyCoupons();
      }).catch(()=>{ /* 错误信息由响应拦截器统一提示 */ });
    },
    checkFav(spuId){
      let mid = parseInt(window.localStorage.getItem('shopMemberId') || '1');
      favList(1, 10, { memberId: mid, spuId: spuId }).then( resp=>{
        let list = resp.data || [];
        this.isFav = list.length > 0;
        if(list.length > 0) this.favId = list[0].id;
      }).catch(()=>{});
    },
    toggleFav(){
      let mid = parseInt(window.localStorage.getItem('shopMemberId') || '1');
      let spuId = parseInt(this.$route.params.spuId);
      if(this.isFav){
        /* 取消收藏：直接调后端按memberId+spuId删 */
        request.delete('/Favorite/cancel', { params: { memberId: mid, spuId: spuId } })
          .then(() => {
            this.isFav = false;
            this.favId = null;
            this.$message.success("已取消收藏");
          }).catch(() => {});
      } else {
        /* 添加收藏 */
        addFav({ memberId: mid, spuId: spuId }).then(()=>{
          this.$message.success("收藏成功");
          this.isFav = true;
          /* 记录收藏行为 */
          request.post('/shop/favoriteLog', { spuId: spuId, memberId: mid })
            .catch(() => {});
        }).catch(()=>{});
      }
    },
    submit(){
      if( !this.form.receiver || !this.form.phone || !this.form.address ){
        this.$message.warning("请填写完整收货信息"); return;
      }
      if( !this.curSku.skuId ){
        this.$message.warning("请选择规格"); return;
      }
      /* 【营销联动】把用到的券写进 remark，后端据此抵扣并核销领券记录 */
      let remark = '';
      if(this.selCoupon) remark = 'coupon:' + this.selCoupon.couponId;
      let order = {
        skuId: this.curSku.skuId,
        count: this.qty,
        userName: this.form.receiver,
        memberId: this.myMid(),
        receiver: this.form.receiver,
        phone: this.form.phone,
        address: this.form.address,
        memberLevel: this.memberLevel,
        remark: remark
      };
      submitOrder(order).then( resp=>{
        this.$message.success("下单成功！已优惠 ¥" + this.saveAmount.toFixed(2));
        window.localStorage.setItem("shopUser", this.form.receiver);
        this.$router.push({ name:"shopOrder", params:{ userName:this.form.receiver } });
      });
    },
    addToCart(){
      if( !this.curSku.skuId ){
        this.$message.warning("请选择规格"); return;
      }
      request.post('/shop/addToCart', {
        spuId: parseInt(this.$route.params.spuId), skuId: this.curSku.skuId,
        quantity: this.qty,
        memberId: parseInt(window.localStorage.getItem('shopMemberId') || '1')
      }).then(resp => {
        if (resp && resp.result === 'success') this.$message.success("已加入购物车");
        else this.$message.error((resp && resp.cause) || '加入购物车失败');
      }).catch(() => {});
    },
    goOrder(){
      this.$router.push({ name:"shopOrder", params:{ userName:this.form.receiver||"张三" } });
    }
  }
}
</script>

<style scoped>
.shop-page{ max-width:1200px; margin:0 auto; min-height:100vh; background:#f5f5f5; padding-bottom:70px; }
.shop-header{ height:50px; background:#2b2f38; color:#fff; display:flex; align-items:center; justify-content:space-between; padding:0 20px; position:sticky; top:0; z-index:10; }
.shop-header .title{ font-size:18px; font-weight:bold; }
.shop-header .back{ font-size:13px; cursor:pointer; width:80px; }
.detail-top{ display:flex; gap:20px; padding:20px 20px 0; align-items:flex-start; }
.detail-left{ flex:1; min-width:0; }
.big-real-img{ width:100%; height:100%; object-fit:cover; }
.big-img{ height:400px; background:#fff; display:flex; align-items:center; justify-content:center; color:#c0c4cc; font-size:80px; border-radius:10px; }
.detail-right{ width:440px; flex-shrink:0; }
.info-card{ background:#fff; padding:16px; border-radius:10px; margin-bottom:12px; }
.price-row{ display:flex; align-items:baseline; flex-wrap:wrap; }
.price{ color:#F56C6C; font-size:28px; font-weight:bold; }
.sold{ margin-left:12px; color:#909399; font-size:12px; }
.fav-btn{ margin-left:auto; font-size:13px; color:#E6A23C; cursor:pointer; }
.g-name{ font-size:18px; color:#303133; margin-top:10px; font-weight:500; }
.g-desc{ font-size:13px; color:#909399; margin-top:6px; line-height:1.6; }
.spec-card{ background:#fff; padding:16px; border-radius:10px; margin-bottom:12px; }
.sec-title{ font-size:15px; color:#303133; font-weight:bold; margin-bottom:12px; }
.sku-list{ display:flex; flex-wrap:wrap; }
.sku-item{ padding:8px 14px; background:#f4f4f5; border-radius:4px; font-size:13px; color:#606266; margin:0 10px 10px 0; cursor:pointer; }
.sku-item.on{ background:#ecf5ff; color:#409EFF; border:1px solid #409EFF; }
.qty-row{ display:flex; align-items:center; margin-top:12px; }
.qty-row > span{ font-size:14px; color:#606266; margin-right:15px; }
.qty{ display:flex; align-items:center; border:1px solid #dcdfe6; border-radius:4px; }
.qty span{ padding:6px 14px; cursor:pointer; }
.qty .num{ border-left:1px solid #dcdfe6; border-right:1px solid #dcdfe6; }
.detail-bottom{ padding:0 20px; }
.ipt{ width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid #dcdfe6; border-radius:4px; margin-bottom:10px; font-size:14px; outline:none; }
.ipt:focus{ border-color:#409EFF; }
.no-comment{ color:#909399; font-size:13px; text-align:center; padding:12px 0; }
.comment-item{ padding:12px 0; border-bottom:1px solid #f5f5f5; }
.comment-item:last-child{ border-bottom:none; }
.c-head{ display:flex; justify-content:space-between; }
.c-user{ font-size:13px; color:#606266; }
.c-stars{ font-size:12px; color:#E6A23C; }
.c-content{ font-size:13px; color:#303133; margin-top:6px; line-height:1.5; }
.buy-bar{ height:60px; background:#fff; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-shadow:0 -2px 8px rgba(0,0,0,.1); position:fixed; left:50%; transform:translateX(-50%); bottom:0; width:100%; max-width:1200px; border-radius:10px 10px 0 0; }
.total{ font-size:14px; color:#303133; }
.total span{ color:#F56C6C; font-size:22px; font-weight:bold; }
.buy-btn{ background:#F56C6C; color:#fff; border:none; padding:12px 36px; border-radius:24px; font-size:15px; cursor:pointer; }
.buy-btn:active{ opacity:.85; }
.cart-btn{ background:#E6A23C; color:#fff; border:none; padding:12px 24px; border-radius:24px; font-size:14px; cursor:pointer; margin-right:10px; }
.cart-btn:active{ opacity:.85; }
/* ===== 【营销联动】活动标签与优惠券 ===== */
.old-price{ margin-left:8px; color:#C0C4CC; font-size:14px; text-decoration:line-through; }
.promo-tag{ margin-left:8px; background:#F56C6C; color:#fff; font-size:12px; padding:2px 8px; border-radius:3px; }
.promo-bar{ margin-top:12px; background:#FEF0F0; color:#F56C6C; font-size:13px; padding:10px 12px; border-radius:4px; line-height:1.5; }
.promo-end{ color:#E6A23C; }
.cp-more{ float:right; color:#409EFF; font-size:12px; cursor:pointer; font-weight:normal; }
.cp-item{ display:flex; align-items:center; background:#FFFBF2; border:1px solid #F3E0C0; border-radius:6px; padding:12px; margin-bottom:10px; cursor:pointer; }
.cp-item.on{ border-color:#F56C6C; background:#FFF2F2; }
.cp-left{ width:100px; text-align:center; border-right:1px dashed #E0D2BA; }
.cp-val{ color:#F56C6C; font-size:24px; font-weight:bold; }
.cp-limit{ color:#909399; font-size:12px; margin-top:2px; }
.cp-right{ flex:1; padding-left:14px; }
.cp-name{ font-size:14px; color:#303133; }
.cp-end{ font-size:12px; color:#909399; margin-top:4px; }
.cp-check{ color:#409EFF; font-size:13px; }
.cp-check.got{ color:#C0C4CC; }
.save-tip{ font-size:12px; color:#67C23A; margin-top:2px; }
.cp-mask{ position:fixed; left:0; top:0; right:0; bottom:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:999; }
.cp-dialog{ width:420px; max-height:70vh; overflow:auto; background:#fff; border-radius:8px; padding:16px; }
.cp-d-head{ font-size:16px; font-weight:bold; color:#303133; margin-bottom:12px; }
.cp-close{ float:right; font-size:20px; color:#909399; cursor:pointer; }
</style>
