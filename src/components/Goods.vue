<template>
  <div>
    <!-- 【1】【TABS|页签】【START】 -->
    <el-tabs type="border-card">
      <el-tab-pane>
         <span slot="label"><i class="el-icon-goods"></i>商品列表</span>
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
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status"
            placeholder="请选择" clearable
            >
            <el-option label="默认" :value="0"></el-option>
            <el-option label="上架" :value="1"></el-option>
            <el-option label="下架" :value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="检索:">
          <el-input v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 【2】【搜索区】【END】 -->

    <!-- 【3】【商品列表】【START】 -->
    <el-card class="box-card" style="margin-top:10px;">
      <div style="margin-bottom:10px;">
        <el-button size="small" type="primary" @click="goAdd">新增商品</el-button>
        <el-button size="small" type="success"
          @click="batchSetStatus(1)">批量上架</el-button>
        <el-button size="small" type="danger"
          @click="batchSetStatus(2)">批量下架</el-button>
        <span style="margin-left:10px;color:#999;">
          已选 {{multipleSelection.length}} 项</span>
      </div>
      <el-table :data="spuList" border height="450" style="width:100%;"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="id" width="60"></el-table-column>
        <el-table-column prop="goodsName" label="名称" min-width="150"></el-table-column>
        <el-table-column prop="goodsDetails" label="描述" min-width="160" show-overflow-tooltip></el-table-column>
        <el-table-column prop="categoryName" label="分类" width="90"></el-table-column>
        <el-table-column prop="brandName" label="品牌" width="90"></el-table-column>
        <el-table-column prop="weight" label="重量" width="70"></el-table-column>
        <el-table-column label="上架状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="statusType(scope.row.status)">
              {{statusText(scope.row.status)}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="创建时间" width="170"></el-table-column>
        <el-table-column prop="updateDate" label="修改时间" width="170"></el-table-column>
        <el-table-column label="操作" width="240">
          <template slot-scope="scope">
            <el-button size="mini" type="success"
              @click="toggleStatus(scope.row)">
              {{scope.row.status==1 ? '下架' : '上架'}}
            </el-button>
            <el-button size="mini" type="primary"
              @click="goEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="warning"
              @click="goSku(scope.row)">规格</el-button>
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
    <!-- 【3】【商品列表】【END】 -->

    <!-- 编辑商品弹窗 -->
    <el-dialog title="编辑商品" :visible.sync="showEditDlg" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="商品ID">
          <span>{{ editForm.id }}</span>
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input v-model="editForm.goodsName" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="editForm.goodsDetails" type="textarea" :rows="3" placeholder="请输入商品描述"></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editForm.categoryId" placeholder="请选择分类" style="width:100%" @change="onEditCategoryChange">
            <el-option v-for="c in categoryList" :key="c.id" :label="c.categoryName" :value="c.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="editForm.brandId" placeholder="请选择品牌" style="width:100%">
            <el-option v-for="b in editBrandList" :key="b.value" :label="b.label" :value="b.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="重量">
          <el-input v-model="editForm.weight" placeholder="请输入重量(kg)"></el-input>
        </el-form-item>
        <el-form-item label="主图">
          <label for="goodsImgInput" style="border:1px dashed #d9d9d9;border-radius:6px;width:120px;height:120px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <img v-if="editImgUrl" :src="editImgUrl" style="width:100%;height:100%;object-fit:cover;">
            <i v-else class="el-icon-plus" style="font-size:36px;color:#8c939d;"></i>
          </label>
          <input type="file" id="goodsImgInput" accept="image/*" style="display:none;" @change="onEditImgChange">
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="showEditDlg=false">取消</el-button>
        <el-button type="primary" @click="saveEdit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getSpuList, setSpuStatus, updateGoods } from '@/api/pms_goods.js'
import { uploadImage } from '@/api/pms_publish.js'
import { getBrandOptions } from '@/api/pms_brand.js'
import { getCategoryList } from '@/api/pms_category.js'
import { list as listBrand } from '@/api/pms_brand.js'
import { pickForm } from '@/utils/common.js'

export default {
  name: 'Goods',
  data () {
    return {
      /* 1.搜索条件 */
      searchForm:{
        id:'',
        goodsName:'',
        categoryId:'',
        brandId:'',
        status:''
      },
      /* 2.下拉数据 */
      categoryList:[],
      brandList:[],
      /* 3.列表数据 */
      spuList:[],
      curPage:1,
      pageSize:10,
      totalCount:0,
      multipleSelection:[],
      /* 编辑弹窗 */
      showEditDlg:false,
      editForm:{ id:null, goodsName:'', goodsDetails:'', categoryId:'', brandId:'', weight:'', mainImage:'' },
      editImgUrl:'',
      editBrandList:[]
    }
  },
  methods: {
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
      getSpuList(this.curPage, this.pageSize, param)
      .then(resp=>{
        this.spuList = resp.data;
        this.totalCount = resp.total;
      });
    },
    /* 【M4】点击查询 */
    /* 【M-清空】重置筛选条件 */
    doReset(){
      this.searchForm = {};
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
    /* 【M6】上架/下架切换 */
    toggleStatus(row){
      let newStatus = (row.status==1) ? 2 : 1;
      setSpuStatus({id: row.id, status: newStatus})
      .then(resp=>{
        this.$message(newStatus==1 ? '商品已上架' : '商品已下架');
        let param = pickForm(this.searchForm);
        this.reloadList(param, this.curPage);
      });
    },
    /* 编辑商品(打开弹窗) */
    goEdit(row){
      this.editForm = {
        id: row.id,
        goodsName: row.goodsName,
        goodsDetails: row.goodsDetails,
        categoryId: row.categoryId || '',
        brandId: row.brandId || '',
        weight: row.weight || '',
        mainImage: row.mainImage || ''
      };
      let BASE = "http://localhost:8090/mall-sys";
      this.editImgUrl = row.mainImage ? (BASE + '/PublishGoods/showImg/goods/' + row.mainImage) : '';
      /* 打开编辑时，按分类加载品牌 */
      if(row.categoryId){
        getBrandOptions(row.categoryId).then(resp=>{
          this.editBrandList = resp.data || [];
        });
      }
      this.showEditDlg = true;
    },
    /* 编辑弹窗里分类变化，联动加载品牌 */
    onEditCategoryChange(cid){
      this.editForm.brandId = '';
      if(cid){
        getBrandOptions(cid).then(resp=>{
          this.editBrandList = resp.data || [];
        });
      } else {
        this.editBrandList = [];
      }
    },
    /* 编辑图片上传 */
    onEditImgChange(e){
      let file = e.target.files[0];
      if(!file) return;
      let FD = new FormData();
      FD.append("file", file);
      FD.append("type", 1);
      uploadImage(FD).then(resp=>{
        if(resp && resp.fileName){
          this.editForm.mainImage = resp.fileName;
          let BASE = "http://localhost:8090/mall-sys";
          this.editImgUrl = BASE + '/PublishGoods/showImg/goods/' + resp.fileName;
          this.$message.success("上传成功");
        }
      });
      e.target.value = '';
    },
    /* 保存编辑 */
    saveEdit(){
      updateGoods(this.editForm).then(()=>{
        this.$message.success('保存成功');
        this.showEditDlg = false;
        let param = pickForm(this.searchForm);
        this.reloadList(param, this.curPage);
      });
    },

    /* 【M7】查看规格(跳SKU管理页) */
    goSku(row){
      this.$router.push({
        name:'skuList',
        query:{ spuId: row.id }
      });
    },
    /* 【M7.2】新增商品(跳发布流程) */
    goAdd(){
      this.$router.push({ name:'publishBaseInfo' });
    },
    /* 【M8】状态文案 */
    statusText(status){
      if(status==1) return '上架';
      if(status==2) return '下架';
      return '默认';
    },
    /* 【M9】状态标签颜色 */
    statusType(status){
      if(status==1) return 'success';
      if(status==2) return 'danger';
      return 'info';
    },
    /* 【M10】勾选变化 */
    handleSelectionChange(items){
      this.multipleSelection = items;
    },
    /* 【M11】批量上架/下架 */
    batchSetStatus(status){
      if(this.multipleSelection.length == 0){
        this.$message.warning("请先勾选商品");
        return;
      }
      let tip = (status==1) ? '上架' : '下架';
      this.$confirm(
        `确认将选中的 ${this.multipleSelection.length} 个商品${tip}吗?`,
        "安全警告",
        { type:"warning" }
      ).then(()=>{
        let list = this.multipleSelection.map(s=>{
          return setSpuStatus({id: s.id, status: status});
        });
        Promise.all(list).then(resp=>{
          this.$message.success(`批量${tip}成功`);
          let param = pickForm(this.searchForm);
          this.reloadList(param, this.curPage);
        });
      }).catch(()=>{});
    }
  },
  created(){
    this.loadCategoryOptions();
    this.loadBrandOptions();
    this.reloadList({}, 1);
  }
}
</script>

<style scoped>
span.el-tree-node__label{ font-size:17px; }
</style>
