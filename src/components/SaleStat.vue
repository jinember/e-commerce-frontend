<template>
  <div>
    <!-- 【1】【TABS|页签】【START】 -->
    <el-tabs type="border-card">
      <el-tab-pane>
         <span slot="label"><i class="el-icon-data-analysis"></i>销售统计</span>
      </el-tab-pane>
    </el-tabs>
    <!-- 【1】【TABS|页签】【END】 -->

    <!-- 【2】【汇总卡片】【START】 -->

    <el-row :gutter="20" style="margin-top:10px;">
      <el-col :span="8">
        <el-card>
          <div style="text-align:center;padding:20px 0;">
            <div style="color:#999;font-size:14px;">总销售额(元)</div>
            <div style="font-size:30px;font-weight:bold;color:#409EFF;margin-top:10px;">
              {{ total.totalSales }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div style="text-align:center;padding:20px 0;">
            <div style="color:#999;font-size:14px;">订单总数(单)</div>
            <div style="font-size:30px;font-weight:bold;color:#67C23A;margin-top:10px;">
              {{ total.orderCount }}
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div style="text-align:center;padding:20px 0;">
            <div style="color:#999;font-size:14px;">商品销量(件)</div>
            <div style="font-size:30px;font-weight:bold;color:#E6A23C;margin-top:10px;">
              {{ total.totalCount }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 【2】【汇总卡片】【END】 -->

    <el-row :gutter="20" style="margin-top:10px;">
      <!-- 【3】【订单状态分布】【START】 -->
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>订单状态分布</span>
          </div>
          <el-table :data="statusRows" border height="450" style="width:100%;">
            <el-table-column prop="name" label="状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="statusType(scope.row.status)">
                  {{scope.row.name}}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="num" label="订单数" width="100"></el-table-column>
            <el-table-column label="占比">
              <template slot-scope="scope">
                <el-progress :percentage="scope.row.percent"
                  :stroke-width="14"></el-progress>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <!-- 【3】【订单状态分布】【END】 -->

      <!-- 【4】【商品销售额排行】【START】 -->
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>商品销售额排行</span>
          </div>
          <el-table :data="topGoods" border height="450" style="width:100%;">
            <el-table-column prop="goodsName" label="商品名称" width="160"></el-table-column>
            <el-table-column prop="cnt" label="销量" width="80"></el-table-column>
            <el-table-column prop="sales" label="销售额(元)" width="120"></el-table-column>
            <el-table-column label="占比">
              <template slot-scope="scope">
                <el-progress :percentage="goodsPercent(scope.row.sales)"
                  :stroke-width="14"></el-progress>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <!-- 【4】【商品销售额排行】【END】 -->
    </el-row>
  </div>
</template>

<script>
import { getSaleSummary, getTopGoods } from '@/api/pms_saleStat.js'

export default {
  name: 'SaleStat',
  data () {
    return {
      /* 1.汇总数据 */
      total:{
        totalSales: 0,
        orderCount: 0,
        totalCount: 0
      },
      /* 2.状态分布(处理后) */
      statusRows: [],
      /* 3.商品排行 */
      topGoods: []
    }
  },
  methods: {
    /* 【M1】加载汇总与排行 */
    loadData(){
      getSaleSummary().then(resp=>{
        this.total = resp.total || this.total;
        /* 处理状态分布 */
        let byStatus = resp.byStatus || [];
        let sum = byStatus.reduce((acc, s)=> acc + s.num, 0);
        this.statusRows = byStatus.map(s=>{
          return {
            status: s.status,
            name: this.statusText(s.status),
            num: s.num,
            percent: sum>0 ? Math.round(s.num*100/sum) : 0
          };
        });
      });
      getTopGoods().then(resp=>{
        this.topGoods = resp.data || [];
      });
    },
    /* 【M2】商品销售占比 */
    goodsPercent(sales){
      let totalSales = parseFloat(this.total.totalSales) || 0;
      if(totalSales<=0) return 0;
      return Math.round(parseFloat(sales)*100/totalSales);
    },
    /* 【M3】订单状态文案 */
    statusText(status){
      if(status==0) return '待支付';
      if(status==1) return '已支付';
      if(status==2) return '已发货';
      if(status==3) return '已完成';
      if(status==4) return '退款中';   /* 与 OrderController.statusName / 后台保持一致 */
      if(status==5) return '已退款';   /* 与 OrderController.statusName / 后台保持一致 */
      if(status==6) return '已取消';
      return '未知';
    },
    /* 【M4】状态标签颜色 */
    statusType(status){
      if(status==0) return 'warning';
      if(status==1) return 'primary';
      if(status==2) return 'success';
      if(status==3) return 'success';
      if(status==4) return 'danger';
      if(status==5) return 'info';
      if(status==6) return 'info';
      return 'info';
    }
  },
  created(){
    this.loadData();
  }
}
</script>
