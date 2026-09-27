<template>
  <div>
    <!-- 【1】页签 -->
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-tickets"></i>订单管理</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 【2】搜索区 -->
    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="订单编号:">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable style="width:170px;"></el-input>
        </el-form-item>
        <el-form-item label="用户:">
          <el-input v-model="searchForm.userName" placeholder="请输入用户名" clearable style="width:150px;"></el-input>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="待支付" :value="0"></el-option>
            <el-option label="已支付" :value="1"></el-option>
            <el-option label="已发货" :value="2"></el-option>
            <el-option label="已完成" :value="3"></el-option>
            <el-option label="退款中" :value="4"></el-option>
            <el-option label="已退款" :value="5"></el-option>
            <el-option label="已取消" :value="6"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 【3】订单列表 -->
    <el-card class="box-card" style="margin-top:10px;">
      <div style="margin-bottom:10px;">
        <el-button type="success" size="mini" :disabled="selected.length===0" @click="batchShip">批量发货</el-button>
        <el-button type="danger" size="mini" :disabled="selected.length===0" @click="batchCancel">批量取消</el-button>
        <el-button size="mini" @click="exportCsv">导出CSV</el-button>
        <span v-if="selected.length" style="margin-left:10px;color:#909399;">已选 {{ selected.length }} 项</span>
      </div>
      <el-table :data="orderList" border height="450" style="width:100%;" @selection-change="onSelect">
        <el-table-column type="selection" width="40"></el-table-column>
        <el-table-column prop="orderNo" label="订单编号" width="150"></el-table-column>
        <el-table-column prop="userName" label="用户" width="90"></el-table-column>
        <el-table-column prop="goodsName" label="商品" min-width="180"></el-table-column>
        <el-table-column prop="skuName" label="SKU" width="150"></el-table-column>
        <el-table-column prop="price" label="单价" width="80"></el-table-column>
        <el-table-column prop="count" label="数量" width="60"></el-table-column>
        <el-table-column prop="totalPrice" label="总价" width="90"></el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="statusType(scope.row.status)">{{statusText(scope.row.status)}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="下单时间" min-width="160"></el-table-column>
        <el-table-column label="操作" width="220">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="openDetail(scope.row)">详情</el-button>
            <el-button size="mini" type="primary" v-if="scope.row.status==1" @click="changeStatus(scope.row, 2)">发货</el-button>
            <el-button size="mini" type="success" v-if="scope.row.status==2" @click="changeStatus(scope.row, 3)">完成</el-button>
            <el-button size="mini" type="danger" v-if="scope.row.status==0" @click="changeStatus(scope.row, 6)">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" :page-size="pageSize" @current-change="reloadPage" style="margin-top:10px; float: left;"></el-pagination>
    </el-card>

    <!-- 【4】订单详情弹窗 -->
    <el-dialog title="订单详情" :visible.sync="detailVisible" width="720px">
      <div v-if="detail.id">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="订单编号">{{ detail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusType(detail.status)">{{ statusText(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户">{{ detail.userName }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ detail.createDate }}</el-descriptions-item>
          <el-descriptions-item label="商品">{{ detail.goodsName }}</el-descriptions-item>
          <el-descriptions-item label="SKU">{{ detail.skuName }}</el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ detail.price }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ detail.count }}</el-descriptions-item>
          <el-descriptions-item label="总价">¥{{ detail.totalPrice }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ detail.receiver }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detail.phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ detail.address }}</el-descriptions-item>
        </el-descriptions>

        <!-- 状态手动更正 -->
        <div style="margin-top:15px;">
          <span style="margin-right:10px;">状态更正：</span>
          <el-select v-model="editStatus" size="small" style="width:140px;">
            <el-option label="待支付" :value="0"></el-option>
            <el-option label="已支付" :value="1"></el-option>
            <el-option label="已发货" :value="2"></el-option>
            <el-option label="已完成" :value="3"></el-option>
            <el-option label="退款中" :value="4"></el-option>
            <el-option label="已退款" :value="5"></el-option>
            <el-option label="已取消" :value="6"></el-option>
          </el-select>
          <el-button size="small" type="primary" style="margin-left:10px;" @click="saveStatus">保存状态</el-button>
        </div>

        <!-- 备注 -->
        <div style="margin-top:15px;">
          <span style="margin-right:10px;">订单备注：</span>
          <el-input v-model="editRemark" size="small" style="width:420px;" placeholder="请输入备注"></el-input>
          <el-button size="small" style="margin-left:10px;" @click="saveRemark">保存备注</el-button>
        </div>

        <!-- 支付信息 -->
        <div style="margin-top:18px;font-weight:bold;">支付信息</div>
        <el-table :data="payList" border size="small" style="margin-top:8px;" v-if="payList.length">
          <el-table-column prop="payType" label="支付方式"></el-table-column>
          <el-table-column prop="payAmount" label="金额"></el-table-column>
          <el-table-column prop="payTime" label="支付时间"></el-table-column>
          <el-table-column label="状态"><template slot-scope="s">{{ s.row.payStatus===1?'已支付':'待支付' }}</template></el-table-column>
          <el-table-column prop="transactionNo" label="交易号"></el-table-column>
        </el-table>
        <div v-else style="color:#909399;margin-top:8px;">暂无支付记录</div>

        <!-- 物流信息 -->
        <div style="margin-top:18px;font-weight:bold;">物流信息</div>
        <el-table :data="logList" border size="small" style="margin-top:8px;" v-if="logList.length">
          <el-table-column prop="company" label="物流公司"></el-table-column>
          <el-table-column prop="trackingNo" label="运单号"></el-table-column>
          <el-table-column prop="shipTime" label="发货时间"></el-table-column>
          <el-table-column prop="receiveTime" label="签收时间"></el-table-column>
        </el-table>
        <div v-else style="color:#909399;margin-top:8px;">暂无物流信息</div>

        <!-- 操作日志 -->
        <div style="margin-top:18px;font-weight:bold;">操作日志</div>
        <el-timeline v-if="opList.length" style="margin-top:10px;">
          <el-timeline-item v-for="log in opList" :key="log.id"
            :timestamp="log.createTime" placement="top">
            <b>{{ log.operator }}</b> {{ log.opType }}：{{ log.remark }}
          </el-timeline-item>
        </el-timeline>
        <div v-else style="color:#909399;margin-top:8px;">暂无操作记录</div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrderList, updateOrderStatus, getOrderDetail, getOrderPayment, getOrderLogistics, saveRemark, batchStatus, getOrderOpLog } from '@/api/pms_order.js'
import { pickForm } from '@/utils/common.js'

export default {
  name: 'OrderManage',
  data () {
    return {
      searchForm: { orderNo:'', userName:'', status:'' },
      orderList: [],
      curPage: 1, pageSize: 10, totalCount: 0,
      selected: [],
      detailVisible: false,
      detail: {}, editStatus: 0, editRemark: '',
      payList: [], logList: [], opList: []
    }
  },
  methods: {
    reloadList(param, page){
      this.curPage = page;
      getOrderList(this.curPage, this.pageSize, param).then(resp=>{
        this.orderList = resp.data; this.totalCount = resp.total;
      });
    },
    doReset(){ this.searchForm = {}; this.onSearch(); },
    onSearch(){ this.reloadList(pickForm(this.searchForm), 1); },
    reloadPage(newPage){ this.reloadList(pickForm(this.searchForm), newPage); },
    onSelect(rows){ this.selected = rows; },

    changeStatus(row, status){
      let tip = this.statusText(status);
      this.$confirm(`确认将该订单${tip}吗?`, "操作确认", { type:"warning" })
        .then(()=>{
          updateOrderStatus({ id: row.id, status: status }).then(()=>{
            this.$message.success(`订单已${tip}`);
            this.reloadList(pickForm(this.searchForm), this.curPage);
          });
        }).catch(()=>{});
    },

    /* 批量发货(仅对已支付订单生效) */
    batchShip(){
      let ids = this.selected.filter(r=>r.status===1).map(r=>r.id);
      if(ids.length===0){ this.$message.warning("请先勾选「已支付」状态的订单"); return; }
      this.$confirm(`确认将选中的 ${ids.length} 个订单发货吗?`, "批量操作", { type:"warning" })
        .then(()=>{ batchStatus(ids, 2).then(()=>{ this.$message.success("批量发货成功"); this.reloadList(pickForm(this.searchForm), this.curPage); }); })
        .catch(()=>{});
    },
    /* 批量取消 */
    batchCancel(){
      let ids = this.selected.map(r=>r.id);
      this.$confirm(`确认将选中的 ${ids.length} 个订单取消吗?`, "批量操作", { type:"warning" })
        .then(()=>{ batchStatus(ids, 4).then(()=>{ this.$message.success("批量取消成功"); this.reloadList(pickForm(this.searchForm), this.curPage); }); })
        .catch(()=>{});
    },

    /* 订单详情 */
    openDetail(row){
      this.detailVisible = true;
      this.detail = {}; this.payList = []; this.logList = []; this.opList = [];
      getOrderDetail(row.id).then(resp=>{
        this.detail = resp.data || {};
        this.editStatus = this.detail.status;
        this.editRemark = this.detail.remark || '';
      });
      getOrderPayment(row.id).then(resp=>{ this.payList = resp.data || []; });
      getOrderLogistics(row.id).then(resp=>{ this.logList = resp.data || []; });
      getOrderOpLog(row.id).then(resp=>{ this.opList = resp.data || []; });
    },
    saveStatus(){
      updateOrderStatus({ id: this.detail.id, status: this.editStatus }).then(()=>{
        this.$message.success("状态已更新");
        this.detail.status = this.editStatus;
        getOrderOpLog(this.detail.id).then(resp=>{ this.opList = resp.data || []; });
        this.reloadList(pickForm(this.searchForm), this.curPage);
      });
    },
    saveRemark(){
      saveRemark({ id: this.detail.id, remark: this.editRemark }).then(()=>{
        this.$message.success("备注已保存");
        this.detail.remark = this.editRemark;
        getOrderOpLog(this.detail.id).then(resp=>{ this.opList = resp.data || []; });
      });
    },

    /* 导出CSV */
    exportCsv(){
      let head = ["订单编号","用户","商品","SKU","单价","数量","总价","状态","下单时间"];
      let rows = this.orderList.map(o=>[
        o.orderNo, o.userName, o.goodsName, o.skuName, o.price, o.count, o.totalPrice, this.statusText(o.status), o.createDate
      ]);
      let csv = "\uFEFF" + head.join(",") + "\n" + rows.map(r=>r.join(",")).join("\n");
      let blob = new Blob([csv], { type:"text/csv;charset=utf8;" });
      let a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "订单列表.csv";
      a.click();
    },

    statusText(status){
      if(status==0) return '待支付';
      if(status==1) return '已支付';
      if(status==2) return '已发货';
      if(status==3) return '已完成';
      if(status==4) return '退款中';
      if(status==5) return '已退款';
      if(status==6) return '已取消';
      return '未知';
    },
    statusType(status){
      if(status==0) return 'warning';
      if(status==1) return 'primary';
      if(status==2) return 'success';
      if(status==3) return 'success';
      if(status==4) return 'warning';
      if(status==5) return 'danger';
      if(status==6) return 'info';
      return 'info';
    }
  },
  created(){ this.reloadList({}, 1); }
}
</script>

<style scoped>
.el-button span { color:#fff; }
</style>
