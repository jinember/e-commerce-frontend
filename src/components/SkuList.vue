<template>
  <div>
    <!-- 【1】【TABS|页签】【START】 -->
    <el-tabs type="border-card">
      <el-tab-pane>
         <span slot="label"><i class="el-icon-goods"></i>SKU列表</span>
      </el-tab-pane>
    </el-tabs>
    <!-- 【1】【TABS|页签】【END】 -->

    <!-- 【2】【搜索区】【START】 -->

    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="分类:">
          <el-select v-model="searchForm.categoryId"
            placeholder="请选择" clearable
            style="width:160px;">
            <el-option
              v-for="c in categoryList" :key="c.id"
              :label="c.categoryName" :value="c.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="品牌:">
          <el-select v-model="searchForm.brandId"
            placeholder="请选择" clearable
            style="width:160px;">
            <el-option
              v-for="b in brandList" :key="b.id"
              :label="b.brandName" :value="b.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格:">
          <el-input v-model="searchForm.priceMin"
            type="number" placeholder="最低价" clearable
            style="width:120px;"></el-input>
          <span style="margin:0 5px;">-</span>
          <el-input v-model="searchForm.priceMax"
            type="number" placeholder="最高价" clearable
            style="width:120px;"></el-input>
        </el-form-item>
        <el-form-item label="检索:">
          <el-input v-model="searchForm.skuName"
            placeholder="请输入商品名称"
            clearable style="width:160px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 【2】【搜索区】【END】 -->

    <!-- 【3】【SKU列表】【START】 -->
    <el-card class="box-card" style="margin-top:10px;">
      <div style="margin-bottom:10px;">
        <el-button size="small" type="danger" @click="doBatchDelete">批量删除</el-button>
        <span style="margin-left:10px;color:#999;">
          已选 {{multipleSelection.length}} 项</span>
      </div>
      <el-table :data="skuList" border height="450" style="width:100%;"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="skuId" label="SKU ID" width="80"></el-table-column>
        <el-table-column prop="skuName" label="名称" min-width="160"></el-table-column>
        <el-table-column label="默认图片" min-width="220">
          <template slot-scope="scope">
            <img v-if="scope.row.imgUrl" :src="scope.row.imgUrl"
              style="width:60px;height:60px;object-fit:cover;border:1px solid #CCC;">
            <span v-else style="color:#999;">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100"></el-table-column>
        <el-table-column prop="saleCount" label="销量" width="80"></el-table-column>
        <el-table-column label="操作" width="240">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="doEditPrice(scope.row)">编辑</el-button>
            <el-button size="mini" type="text"
              @click="doPreview(scope.row)">预览</el-button>
            <el-button size="mini" type="text"
              @click="doComment(scope.row)">评论</el-button>
            <el-button size="mini" type="text"
              @click="doDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页条 -->
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalCount"
        :current-page="curPage"
        @current-change="reloadPage"
        style="margin-top:10px; float: left;">
      </el-pagination>
    </el-card>
    <!-- 【3】【SKU列表】【END】 -->


    <!-- 【4】【图片预览对话框】【START】 -->
    <el-dialog title="图片预览" :visible.sync="showPreview" width="40%">
      <div style="text-align:center;">
        <img v-if="previewImg" :src="previewImg" style="max-width:100%;">
        <span v-else style="color:#999;">该SKU暂无默认图片</span>
      </div>
    </el-dialog>
    <!-- 【4】【图片预览对话框】【END】 -->

    <!-- 【4.5】【评论列表对话框】【START】 -->
    <el-dialog title="商品评论" :visible.sync="showCommentDlg" width="60%">
      <div v-if="commentList.length === 0" style="text-align:center; color:#999; padding:30px 0;">暂无评论</div>
      <div v-for="c in commentList" :key="c.id" style="padding:15px 0; border-bottom:1px solid #f5f5f5;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:14px; color:#606266;">用户{{ c.memberId }}（{{ c.nickname || '匿名用户' }}）</span>
          <span style="font-size:12px; color:#E6A23C;">{{ '★'.repeat(c.rating) }}{{ '☆'.repeat(5 - c.rating) }}</span>
        </div>
        <div style="font-size:14px; color:#303133; line-height:1.5;">{{ c.content }}</div>
        <div style="font-size:12px; color:#909399; margin-top:8px;">{{ c.createTime }}</div>
      </div>
    </el-dialog>
    <!-- 【4.5】【评论列表对话框】【END】 -->

    <!-- 【5】【编辑SKU对话框】【START】 -->
    <el-dialog :title="batchPrice ? '批量改价' : '编辑SKU'" :visible.sync="showPriceDlg" width="480px">
      <el-form label-width="80px">
        <el-form-item label="SKU ID">
          <span>{{ priceForm.skuId }}</span>
        </el-form-item>
        <el-form-item label="SKU名称">
          <el-input v-model="priceForm.skuName" placeholder="请输入SKU名称"></el-input>
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="priceForm.price" type="number" placeholder="请输入价格">
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="!batchPrice" label="默认图片">
          <label for="skuImgInput" style="border:1px dashed #d9d9d9;border-radius:6px;width:120px;height:120px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <img v-if="priceForm.defaultImage" :src="getImgUrl(priceForm.defaultImage)" style="width:100%;height:100%;object-fit:cover;">
            <i v-else class="el-icon-plus" style="font-size:36px;color:#8c939d;"></i>
          </label>
          <input type="file" id="skuImgInput" accept="image/*" style="display:none;" @change="onFileChange">
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showPriceDlg = false">取消</el-button>
        <el-button type="primary" @click="doSavePrice">确定</el-button>
      </div>
    </el-dialog>
    <!-- 【5】【编辑SKU对话框】【END】 -->
  </div>
</template>

<script>
import { getSkuList, updateSku, updateSkuPrice, batchUpdateSkuPrice, batchDeleteSku, deleteSkuByIds, uploadSkuImg } from '@/api/pms_sku.js'
import { getCategoryList } from '@/api/pms_category.js'
import { list as listBrand } from '@/api/pms_brand.js'
import { list as listComment } from '@/api/pms_comment.js'
import { pickForm } from '@/utils/common.js'

export default {
  name: 'SkuList',
  data () {
    return {
      /* 1.搜索条件 */
      searchForm:{
        skuId:'',
        spuId:'',
        skuName:'',
        categoryId:'',
        brandId:'',
        priceMin:'',
        priceMax:''
      },
      /* 2.下拉数据 */
      categoryList:[],
      brandList:[],
      /* 3.列表数据 */
      skuList:[],
      curPage:1,
      pageSize:10,
      totalCount:0,
      /* 4.预览 */
      showPreview:false,
      previewImg:'',
      /* 5.批量勾选 */
      multipleSelection:[],
      /* 6.改价格 */
      showPriceDlg:false,
      batchPrice:false,
      priceForm:{ skuId:null, skuName:'', price:'', defaultImage:'' },
      /* 7.评论弹窗 */
      showCommentDlg:false,
      commentList:[]
    }
  },
  methods: {
    /* 图片预览地址 */
    getImgUrl(name){
      return name ? `http://localhost:8090/mall-sys/PublishGoods/showImg/album/${name}` : '';
    },
    /* 【M1】加载分类下拉(树拍平成列表) */
    loadCategoryOptions(){
      getCategoryList().then(resp=>{
        let list = [];
        let flat = (nodes)=>{
          nodes.forEach(n=>{
            list.push({id:n.id, categoryName:n.categoryName});
            if(n.children && n.children.length>0) flat(n.children);
          });
        };
        flat(resp.data);
        this.categoryList = list;
      });
    },
    /* 【M2】加载品牌下拉 */
    loadBrandOptions(){
      listBrand(1, 100, {}).then(resp=>{
        this.brandList = resp.data;
      });
    },
    /* 【M3】查询列表 */
    reloadList(param, page){
      this.curPage = page;
      getSkuList(this.curPage, this.pageSize, param)
      .then(resp=>{
        /* 把默认图片文件名拼成可访问的图片地址 */
        let BASE = "http://localhost:8090/mall-sys";
        let list = resp.data.map(s=>{
          s.imgUrl = s.defaultImage
            ? `${BASE}/PublishGoods/showImg/album/${s.defaultImage}` : '';
          return s;
        });
        this.skuList = list;
        this.totalCount = resp.total;
      });
    },
    /* 【M4】点击查询 */
    /* 【M-清空】重置筛选条件(保留spuId) */
    doReset(){
      this.searchForm = { skuId:'', spuId: this.searchForm.spuId, skuName:'', categoryId:'', brandId:'', priceMin:'', priceMax:'' };
      this.onSearch();
    },
    onSearch(){
      let param = pickForm(this.searchForm);
      this.reloadList(param, 1);
    },
    /* 【M5】分页 */
    reloadPage(newPage){
      let param = pickForm(this.searchForm);
      this.reloadList(param, newPage);
    },
    /* 【M6】预览 */
    doPreview(row){
      this.previewImg = row.imgUrl || '';
      this.showPreview = true;
    },
    /* 【M7】评论 */
    doComment(row){
      this.showCommentDlg = true;
      this.commentList = [];
      listComment(1, 100, { spuId: row.spuId }).then(resp=>{
        this.commentList = resp.data || [];
      }).catch(()=>{});
    },
    /* 【M8】勾选变化 */
    handleSelectionChange(items){
      this.multipleSelection = items;
    },
    /* 【M9】单个编辑 */
    doEditPrice(row){
      this.batchPrice = false;
      this.priceForm = {
        skuId: row.skuId,
        skuName: row.skuName,
        price: row.price,
        defaultImage: row.defaultImage || ''
      };
      this.showPriceDlg = true;
    },
    /* 图片上传成功回调 */
    onImgUploadSuccess(resp){
      if(resp.data && resp.data.fileName){
        this.priceForm.defaultImage = resp.data.fileName;
      }
    },
    /* 选择文件后上传 */
    onFileChange(e){
      const file = e.target.files[0];
      if(!file) return;
      const FD = new FormData();
      FD.append("file", file);
      uploadSkuImg(FD).then(resp=>{
        if(resp.fileName){
          this.priceForm.defaultImage = resp.fileName;
          this.$message.success("上传成功");
        }
      });
    },
    /* 【M10】批量改价 */
    openBatchPrice(){
      if(this.multipleSelection.length === 0){
        this.$message.warning('请先勾选SKU');
        return;
      }
      this.batchPrice = true;
      this.priceForm = { skuId:null, skuName:'', price:'' };
      this.showPriceDlg = true;
    },
    /* 【M11】保存 */
    doSavePrice(){
      let price = Number(this.priceForm.price);
      if(!price || price <= 0){
        this.$message.warning('请输入大于0的价格');
        return;
      }
      if(this.batchPrice){
        let ids = this.multipleSelection.map(s=>s.skuId);
        batchUpdateSkuPrice(ids, price).then(()=>{
          this.$message.success('批量改价成功');
          this.showPriceDlg = false;
          this.reloadList(pickForm(this.searchForm), this.curPage);
        });
      } else {
        updateSku({
          skuId: this.priceForm.skuId,
          skuName: this.priceForm.skuName,
          price: price,
          defaultImage: this.priceForm.defaultImage
        }).then(()=>{
          this.$message.success('保存成功');
          this.showPriceDlg = false;
          this.reloadList(pickForm(this.searchForm), this.curPage);
        });
      }
    },
    /* 【M12】单个删除 */
    doDelete(row){
      this.$confirm(`确认删除SKU【${row.skuName}】吗？`, '提示', {type:'warning'}).then(()=>{
        deleteSkuByIds([row.skuId]).then(()=>{
          this.$message.success('删除成功');
          this.reloadList(pickForm(this.searchForm), this.curPage);
        });
      }).catch(()=>{});
    },
    /* 【M13】批量删除 */
    doBatchDelete(){
      if(this.multipleSelection.length === 0){
        this.$message.warning('请先勾选SKU');
        return;
      }
      this.$confirm(`确认删除选中的 ${this.multipleSelection.length} 个SKU吗？`, '提示', {type:'warning'}).then(()=>{
        let ids = this.multipleSelection.map(s=>s.skuId);
        batchDeleteSku(ids).then(()=>{
          this.$message.success('批量删除成功');
          this.reloadList(pickForm(this.searchForm), this.curPage);
        });
      }).catch(()=>{});
    }
  },
  created(){
    /* 从商品管理页"规格"跳转时，按 spuId 过滤 */
    let spuId = this.$route.query.spuId;
    if(spuId){
      this.searchForm.spuId = spuId;
    }
    this.loadCategoryOptions();
    this.loadBrandOptions();
    this.reloadList(pickForm(this.searchForm), 1);
  }
}
</script>

<style scoped>
span.el-tree-node__label{ font-size:17px; }
::v-deep .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9 !important;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px !important;
  height: 120px !important;
}
::v-deep .avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
::v-deep .avatar-uploader-icon {
  font-size: 36px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}
</style>
