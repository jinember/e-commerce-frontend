import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/components/Dashboard'
import User from '@/components/User'
import Dept from '@/components/Dept'
import Brand from '@/components/Brand'
import Category from '@/components/Category'
import AttrGroup from '@/components/AttrGroup'
import SpecParam from '@/components/SpecParam'
import SaleAttr from '@/components/SaleAttr'
import PublishBaseInfo from '@/components/PublishBaseInfo'
import SetGoodsAttr from '@/components/SetGoodsAttr'
import SetGoodsSale from '@/components/SetGoodsSale'
import SetGoodsSku from '@/components/SetGoodsSku'
import SetGoodsDone from '@/components/SetGoodsDone'
import SetSKU from '@/components/SetSKU'
import Goods from '@/components/Goods'
import SkuList from '@/components/SkuList'
import OrderManage from '@/components/OrderManage'
import SaleStat from '@/components/SaleStat'
import Home from '@/components/Home'
import Member from '@/components/Member'
import Stock from '@/components/Stock'
import Ad from '@/components/Ad'
import Role from '@/components/Role'
import Login from '@/components/Login'
import Payment from '@/components/Payment'
import Logistics from '@/components/Logistics'
import Refund from '@/components/Refund'
import Cart from '@/components/Cart'
import UserBehavior from '@/components/UserBehavior'
import Favorite from '@/components/Favorite'
import Comment from '@/components/Comment'
import PointLog from '@/components/PointLog'
import Coupon from '@/components/Coupon'
import Promotion from '@/components/Promotion'
import StockLog from '@/components/StockLog'
import Supplier from '@/components/Supplier'
import ShopList from '@/components/shop/ShopList'
import ShopDetail from '@/components/shop/ShopDetail'
import ShopOrder from '@/components/shop/ShopOrder'
import ShopMessage from '@/components/shop/ShopMessage'
import ShopRegister from '@/components/shop/ShopRegister'
import ShopLogin from '@/components/shop/ShopLogin'
import ShopProfile from '@/components/shop/ShopProfile'
import Address from '@/components/Address'
import SignIn from '@/components/SignIn'
import Message from '@/components/Message'
import Ticket from '@/components/Ticket'
import BrowseHistory from '@/components/BrowseHistory'
import Invoice from '@/components/Invoice'
import ChatSession from '@/components/ChatSession'
import AnalysisFunnel from '@/components/AnalysisFunnel'
import AnalysisOrder from '@/components/AnalysisOrder'
import AnalysisComment from '@/components/AnalysisComment'
import AnalysisChat from '@/components/AnalysisChat'
import AnalysisMember from '@/components/AnalysisMember'
import AnalysisRegion from '@/components/AnalysisRegion'
import AnalysisProduct from '@/components/AnalysisProduct'
import EtlJobLog from '@/components/EtlJobLog'
import AnalysisHourly from '@/components/AnalysisHourly'
import AnalysisBehavior from '@/components/AnalysisBehavior'
import AnalysisOrderLoss from '@/components/AnalysisOrderLoss'
import AnalysisRating from '@/components/AnalysisRating'
import AnalysisChatQuality from '@/components/AnalysisChatQuality'
import AnalysisHourlyAll from '@/components/AnalysisHourlyAll'
import AnalysisProfile from '@/components/AnalysisProfile'
import AnalysisCleanCompare from '@/components/AnalysisCleanCompare'


Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/login', name: 'login', component: Login },
    { path: '/home', name: 'home', component: Home },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },	
    {
      path: '/user',
      name: 'user',
      component: User
    },
    {
      path: '/dept',
      name: 'dept',
      component: Dept
    },
    {
      path: '/brand',
      name: 'Brand',
      component: Brand
    },
    {
      path: '/category',
      name: 'Category',
      component: Category
    },
    {
      path: '/attrGroup',
      name: 'attrGroup',
      component: AttrGroup
    },
    {
      path: '/goodsAttr',
      name: 'goodsAttr',
      component: SpecParam
    },
    {
      path: '/saleAttr',
      name: 'saleAttr',
      component: SaleAttr
    },
    {
      path: '/publishBaseInfo',
      name: 'publishBaseInfo',
      component: PublishBaseInfo
    },
    {
      path: '/setGoodsAttr/:categoryId',
      name: 'setGoodsAttr',
      component: SetGoodsAttr
    },
	{
      path: '/setGoodsSale/:categoryId',
      name: 'setGoodsSale',
      component: SetGoodsSale
    },
    {
      path: '/setGoodsSku/:categoryId',
      name: 'setGoodsSku',
      component: SetGoodsSku
    },
    {
      path: '/setGoodsDone/:categoryId',
      name: 'setGoodsDone',
      component: SetGoodsDone
    },	{
      path: '/goods',
      name: 'goods',
      component: Goods
    },
    {
      path: '/skuList',
      name: 'skuList',
      component: SkuList
    },
    {
      path: '/setSKU',
      name: 'setSKU',
      component: SetSKU
    },
    {
      path: '/order',
      name: 'order',
      component: OrderManage
    },
    {
      path: '/saleStat',
      name: 'saleStat',
      component: SaleStat
    },
    {
      path: '/member',
      name: 'member',
      component: Member
    },
    {
      path: '/stock',
      name: 'stock',
      component: Stock
    },
    {
      path: '/ad',
      name: 'ad',
      component: Ad
    },
    {
      path: '/role',
      name: 'role',
      component: Role
    },

    { path: '/shop', name: 'shopList', component: ShopList },
    { path: '/shopRegister', name: 'shopRegister', component: ShopRegister },
    { path: '/shopLogin', name: 'shopLogin', component: ShopLogin },
    { path: '/shopProfile', name: 'shopProfile', component: ShopProfile },
    { path: '/shopDetail/:spuId', name: 'shopDetail', component: ShopDetail },
    { path: '/shopOrder/:userName', name: 'shopOrder', component: ShopOrder },
    { path: '/shopMessage', name: 'shopMessage', component: ShopMessage },
    { path: '/payment', name: 'payment', component: Payment },
    { path: '/logistics', name: 'logistics', component: Logistics },
    { path: '/refund', name: 'refund', component: Refund },
    { path: '/cart', name: 'cart', component: Cart },
    { path: '/userBehavior', name: 'userBehavior', component: UserBehavior },
    { path: '/favorite', name: 'favorite', component: Favorite },
    { path: '/comment', name: 'comment', component: Comment },
    { path: '/pointLog', name: 'pointLog', component: PointLog },
    { path: '/coupon', name: 'coupon', component: Coupon },
    { path: '/promotion', name: 'promotion', component: Promotion },
    { path: '/stockLog', name: 'stockLog', component: StockLog },
    { path: '/supplier', name: 'supplier', component: Supplier },
    { path: '/address', name: 'address', component: Address },
    { path: '/signIn', name: 'signIn', component: SignIn },
    { path: '/message', name: 'message', component: Message },
    { path: '/ticket', name: 'ticket', component: Ticket },
    { path: '/browseHistory', name: 'browseHistory', component: BrowseHistory },
    { path: '/invoice', name: 'invoice', component: Invoice },
    { path: '/chatSession', name: 'chatSession', component: ChatSession },
    { path: '/analysisFunnel', name: 'analysisFunnel', component: AnalysisFunnel },
    { path: '/analysisOrder', name: 'analysisOrder', component: AnalysisOrder },
    { path: '/analysisComment', name: 'analysisComment', component: AnalysisComment },
    { path: '/analysisChat', name: 'analysisChat', component: AnalysisChat },
    { path: '/analysisMember', name: 'analysisMember', component: AnalysisMember },
    { path: '/analysisRegion', name: 'analysisRegion', component: AnalysisRegion },
    { path: '/analysisProduct', name: 'analysisProduct', component: AnalysisProduct },
    { path: '/etlJobLog', name: 'etlJobLog', component: EtlJobLog },
    { path: '/analysisHourly', name: 'analysisHourly', component: AnalysisHourly },
    { path: '/analysisBehavior', name: 'analysisBehavior', component: AnalysisBehavior },
    { path: '/analysisOrderLoss', name: 'analysisOrderLoss', component: AnalysisOrderLoss },
    { path: '/analysisRating', name: 'analysisRating', component: AnalysisRating },
    { path: '/analysisChatQuality', name: 'analysisChatQuality', component: AnalysisChatQuality },
    { path: '/analysisHourlyAll', name: 'analysisHourlyAll', component: AnalysisHourlyAll },
    { path: '/analysisProfile', name: 'analysisProfile', component: AnalysisProfile },
    // 清洗前后 A/B 对比：按约定不新开侧边栏菜单，挂在「ETL 执行日志」页的 Tab 里；
    // 这条独立路由只作 URL 深链（截图/演示直接访问用）
    { path: '/analysisCleanCompare', name: 'analysisCleanCompare', component: AnalysisCleanCompare },
  ]
})
export default router

/* 路由守卫：未登录跳登录页 */
router.beforeEach((to, from, next)=>{
  let token = window.sessionStorage.getItem('adminToken');
  if(to.name === 'login'){ next(); }
  else if(!token){ next({ name:'login' }); }
  else{ next(); }
});
