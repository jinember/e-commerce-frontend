<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-star-on"></i>品牌管理</span>
      </el-tab-pane>
    </el-tabs>

    <el-card class="box-card" style="margin-top:10px;">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="品牌ID:">
          <el-input placeholder="请输入品牌ID" v-model="searchForm.id" clearable @clear="doSearch" style="width:160px;"></el-input>
        </el-form-item>
        <el-form-item label="品牌名称:">
          <el-input placeholder="请输入品牌名称" v-model="searchForm.brandName" clearable @clear="doSearch" style="width:180px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="doReset">清空</el-button>
          <el-button type="primary" @click="doSearch">查询</el-button>
          <el-button type="primary" @click="showAddBox();">添加品牌</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="brandList" border style="width:100%">
        <el-table-column prop="id" label="编号" width="80"></el-table-column>
        <el-table-column prop="brandName" label="品牌名称" min-width="150"></el-table-column>
        <el-table-column prop="imgUrl" label="logo" width="125">
          <template slot-scope="scope">
            <el-popover placement="top-start" trigger="hover">
              <img :src="scope.row.imgUrl" alt="" height="120" />
              <img slot="reference" :src="scope.row.imgUrl" style="width:100px;height:45px;border:1px solid #CCC;">
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="showStatus" label="显示状态" width="80">
          <template slot-scope="scope">
            <el-tooltip :content="'状态值: '+ scope.row.showStatus" placement="top">
              <el-switch v-model="scope.row.showStatus" active-color="#13ce66" inactive-color="#909399"
                @change="statusChange(scope.row)" :active-value="1" :inactive-value="0">
              </el-switch>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="创建日期" min-width="220"></el-table-column>
        <el-table-column label="操作" width="240">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
            <el-button size="mini" @click="handleAssociate(scope.$index, scope.row)">关联</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background layout="prev, pager, next" :total="totalCount"
        :current-page="curPage" @current-change="reloadPage" style="margin-top:10px; float: left;">
      </el-pagination>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="60%" append-to-body
      style="padding: 0px 0px;">
      <el-form :model="brandForm" ref="brandFormRef" :rules="brandFormRules">
        <el-form-item label="品牌名称" prop="brandName" style="margin-top:0px;">
          <el-input v-model="brandForm.brandName"></el-input>
        </el-form-item>
        <el-form-item label="品牌logo" style="margin-top:5px;">
          <el-upload class="upload-demo" ref="upload" action="" :on-preview="handlePreview" :on-remove="handleRemove"
            :on-success="handleSuccess" :before-upload="beforeUpload" :auto-upload="false" :http-request="httpRequest"
            list-type="picture" :file-list="fileList">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
            <div slot="tip" class="el-upload_tip">只能上传 jpg/png 文件, 且不超过 500kb</div>
            <el-tag>{{tips}}</el-tag>
          </el-upload>
        </el-form-item>
        <el-form-item label="显示状态" prop="showStatus" style="margin-top:5px;">
          <el-switch v-model="brandForm.showStatus" active-color="#13ce66" inactive-color="#909399"></el-switch>
        </el-form-item>
        <el-form-item label="品牌介绍" prop="brandDesc" style="margin-top:5px;">
          <el-input type="textarea" :rows="3" placeholder="请输入品牌介绍" v-model="brandForm.brandDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showFormBox=false">取消</el-button>
        <el-button type="primary" :disabled="disableSave" @click="saveBrandData">确定</el-button>
      </span>
    </el-dialog>

    <!-- 品牌关联分类对话框 -->
    <el-dialog title="关联商品分类" :visible.sync="showAssocDlg" width="500px">
      <el-tree
        :data="categoryTree"
        show-checkbox
        node-key="id"
        :props="{ label: 'categoryName', children: 'children' }"
        ref="categoryTree"
        default-expand-all>
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAssocDlg=false">取消</el-button>
        <el-button type="primary" @click="saveAssoc">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { list, addBrand, updateBrand, uploadFile, deleteBrand, getBrandCategories, saveBrandCategories } from '@/api/pms_brand.js'
import { getCategoryList } from '@/api/pms_category.js'
import { pickForm } from '@/utils/common.js'

export default {
  name: 'brandlist',
  data(){
    return {
      searchForm:{ id:'', brandName:'' },
      showFormBox:false,
      opMode:'add',
      dialogTitle:'添加品牌',
      brandFormRules:{
        brandName:[
          {required:true, message:'请输入品牌名称',trigger:'blur'},
          {min:2, max:15, message:'品牌名称长度:(2-15)',trigger:'blur'}
        ],
        brandDesc:[
          {required:true, message:'请输入品牌描述',trigger:'blur'}
        ]
      },
      brandForm:{
        brandName:'', logoName:'', status:false, showStatus:'', info:'', brandDesc:''
      },
      tips:'请上传图片(否则无法提交)',
      disableSave: true,
      brandList:[],
      curPage:1,
      pageSize:10,
      totalCount:0,
      fileList:[],
      imgUrl:'',
      /* 关联分类对话框 */
      showAssocDlg:false,
      currentBrandId:null,
      categoryTree:[]
    }
  },
  methods:{
    getBrandList(searchForm, page){
      let BASE = "http://localhost:8090/mall-sys";
      this.curPage = page;
      list(this.curPage, this.pageSize, searchForm).then(resp=>{
        this.brandList = resp.data;
        this.brandList.forEach(br=>{ br.imgUrl = BASE + "/Brand/showImg/" + br.logoName; });
        this.totalCount = resp.total;
      });
    },
    doReset(){ this.searchForm = {}; this.doSearch(); },
    doSearch(){
      let id = this.searchForm.id;
      if(id!="" && !/^\d+$/.test(id)){ this.$message("你输入的 ID 只允许是数字。"); return; }
      this.getBrandList(pickForm(this.searchForm), 1);
    },
    reloadPage(newPage){ this.getBrandList(pickForm(this.searchForm), newPage); },
    handleClose(){ },
    onClose(){ },
    showAddBox(){
      this.opMode = "add";
      this.dialogTitle = "添加新品牌";
      this.showFormBox = true;
      this.brandForm = {};
      this.disableSave = true;
    },
    saveBrandData(){
      if(this.opMode=="add"){ this.doAddBrand(); } else { this.doUpdateBrand(); }
    },
    doAddBrand(){
      let bdName = this.brandForm.brandName;
      this.brandForm.showStatus = (this.brandForm.showStatus===true) ? 1 : 0;
      addBrand(this.brandForm).then(()=>{ this.onSaveSuccess("添加", bdName); });
    },
    onSaveSuccess(opType, bdName){
      this.$message(opType + "【" + bdName + "】品牌成功！");
      this.showFormBox = false;
      this.searchForm.id = "";
      this.searchForm.brandName = "";
      this.getBrandList(pickForm(this.searchForm), 1);
    },
    handleEdit(index, row){
      this.opMode = "edit";
      this.dialogTitle = "修改 " + row.brandName + " 品牌";
      this.showFormBox = true;
      this.brandForm = Object.assign({}, row);
      /* 编辑模式：如果原来有logo，就允许直接保存，不用重新上传 */
      this.disableSave = false;
      this.tips = row.logoName ? "如需更换logo请上传新图片" : "请上传品牌logo";
      this.brandForm.showStatus = (this.brandForm.showStatus==1) ? true : false;
    },
    doUpdateBrand(){
      let bdName = this.brandForm.brandName;
      this.brandForm.showStatus = (this.brandForm.showStatus===true) ? 1 : 0;
      updateBrand(this.brandForm).then(()=>{ this.onSaveSuccess("更新", bdName); });
    },
    handleDelete(index, row){
      let brandName = row.brandName;
      this.$confirm("确认要删除【" + brandName + "】品牌吗?", "安全警告", {type:"warning"})
        .then(()=>{ this.confirmDelete(row.id, brandName); })
        .catch(()=>{});
    },
    confirmDelete(id, brandName){
      deleteBrand(id).then(()=>{
        this.$message("删除【" + brandName + "】品牌成功。");
        this.getBrandList(pickForm(this.searchForm), 1);
      });
    },
    handlePreview(){ },
    handleRemove(row){},
    handleSuccess(){ },
    handleAssociate(index, row){
      this.currentBrandId = row.id;
      this.showAssocDlg = true;
      /* 加载分类树 */
      getCategoryList().then(resp=>{
        this.categoryTree = resp.data;
        /* 查询当前品牌已关联的分类 */
        getBrandCategories(row.id).then(r=>{
          let checkedIds = r.data || [];
          this.$nextTick(()=>{
            this.$refs.categoryTree.setCheckedKeys(checkedIds);
          });
        });
      });
    },
    saveAssoc(){
      let checkedNodes = this.$refs.categoryTree.getCheckedNodes(true);
      let categoryIds = checkedNodes.map(n=>n.id);
      saveBrandCategories({ brandId: this.currentBrandId, categoryIds: categoryIds }).then(()=>{
        this.$message.success('关联分类保存成功');
        this.showAssocDlg = false;
      });
    },
    beforeUpload(file){
      if(file.size/1024/1024 > 2){ this.$message("上传的文件不能 2 MB."); return false; }
      return true;
    },
    httpRequest(param){
      let FD = new FormData();
      FD.append("file", param.file);
      FD.append("userId", "100");
      uploadFile(FD).then(resp=>{
        this.tips = "图片已经上传(现在可以提交)";
        this.$message("图片上传成功。");
        this.disableSave = false;
        this.brandForm.logoName = resp.fileName;
      });
    },
    submitUpload(){ this.$refs.upload.submit(); }
  },
  mounted(){ this.doSearch(); }
}
</script>

<style scoped>
.el-button span { color:white; }
.el-card .el-dialog__body{ padding-top:0px; }
</style>