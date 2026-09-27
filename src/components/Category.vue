<template>
  <div class="category-page">
	<!-- 【D01:START】这是页签栏 -->
	<el-tabs type="border-card" class="cat-tabs">
	  <el-tab-pane>
		<span slot="label"><i class="el-icon-menu"></i>分类列表</span>		
	  </el-tab-pane>
	</el-tabs>
    <!-- 【D01:END】 -->
  
	<el-row :gutter="24" class="cat-row">	  
	  <el-col :span="7" class="cat-col">	  
		<!-- 【D02:START】左边的卡片 -->
		<el-card class="box-card">
		
		  <div slot="header" class="clearfix">
			  <span>请选择分类</span>
		  </div>

		  <!-- 树形菜单区域 [START]-->
			<el-tree
				:data="categoryList"
				node-key="id"
				default-expand-all
				@node-click="handleNodeClick"
				:expand-on-click-node="false">
				<span class="custom-tree-node" slot-scope="{ node, data }">
				
					<span>{{ data.categoryName }}</span>
					<span>
					  <el-button
						type="text"
						size="small"
						v-if="data.level<3"
						@click.stop
						@click="()=>append(data)">
						添加
					  </el-button>
					  <!--
						<el-button
							type="text"
							size="small"
							@click="()=>edit( data )">
							编辑
						  </el-button>
					  -->
					  <el-button
						type="text"
						size="small"
						v-if="data.isLeap==true"
						@click.stop
						@click="()=>associate(node, data)">
						设置关联
					  </el-button>			  
					  <el-button
						type="text"
						size="small"
						v-if="data.isLeap==true"
						@click.stop
						@click="()=>remove(node, data)">
						删除
					  </el-button>
					</span>
				</span>
			</el-tree>

		</el-card>
		<!-- 【D02:END】 -->
	  </el-col>	 
	  
  <el-col :span="17" class="cat-col">
  
	<el-card class="box-card" v-show="opType!='brandList'">
			<!-- 【D03:START】【el-form】栅格布局+label-width，去掉float -->
			<el-form
				:model="categoryForm" :rules="categoryRules"
				ref="cateFormRef" label-width="90px">
				  <div style="margin-bottom:12px;">{{formTitle}}</div>
				  <el-row :gutter="16">
					<el-col :span="6">
						<el-form-item label="类别名称" prop="categoryName">
							<el-input v-model="categoryForm.categoryName"
								:disabled="opType!='edit' && opType!='add'"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="5">
						<el-form-item label="父节点ID" prop="parentId">
							<el-input v-model="categoryForm.parentId" readonly
								:disabled="opType!='edit' && opType!='add'"></el-input>
							<input type="hidden" :value="categoryForm.pIds" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="显示状态" prop="showStatus">
							<el-switch
								v-model="categoryForm.showStatus"
								active-color="green"
								inactive-color="#CCC"
								active-text="显示"
								inactive-text="隐藏"
								:disabled="opType!='edit' && opType!='add'" />
						</el-form-item>
					</el-col>
					<el-col :span="4">
						<el-form-item label="排序号" prop="sort">
							<el-input v-model="categoryForm.sort"
								:disabled="opType!='edit' && opType!='add'"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="3">
						<el-form-item label-width="0">
							 <el-button id="confirm" type="primary"
								@click="saveCategory" :disabled="opType!='edit' && opType!='add'">{{btnText}}</el-button>
						</el-form-item>
					</el-col>
				  </el-row>
			</el-form>
			<!-- 【D03:END】 -->
		</el-card>
		
		<el-card class="box-card" v-show="opType=='brandList'">
			<!-- 【D04:START】【品牌搜索】 -->
			<div style="line-height:22px;font-size:18px;">
				<label>当前分类:</label>
				<label id="topic">
					{{curSelect.categoryName}}
					( {{curSelect.categoryId}} )
				</label>
			</div>
			<div style="margin-top:10px">			
				<el-form :inline="true" 
					:model="searchForm" class="demo-form-inline">
					<el-form-item label="品牌ID:">
						<el-input style="width:100%;" placeholder="请输入品牌ID" 
						   v-model="searchForm.id" 
						   clearable @clear="doSearch"></el-input>
					</el-form-item>					   
					<el-form-item label="品牌名称:">				
						<el-input style="width:100%;" placeholder="请输入品牌名称" 
						   v-model="searchForm.brandName" 
						   clearable @clear="doSearch">
						   <el-button slot="append"
							 @click="doSearch">点击搜索</el-button>
						</el-input>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" 
							@click="submitSelection">
							提交关联</el-button>
					</el-form-item>
				</el-form>
				
			</div>
			<!-- 【D04:END】【品牌搜索】 -->
			
			<!-- 【D05:START】【el-table】 -->
				<el-table
					ref="brandTable"
					:data="brandList" height="410"
					:show-checkbox="true" style="width: 100%"
					:row-key="row=>row.id"
					@selection-change="handleSelectChange">
					<el-table-column type="selection"
					  prop="isAssociate"
					
					  width="55">
					</el-table-column>	
					<el-table-column
					  prop="id"
					  label="编号"
					  width="80">
					</el-table-column>
					<el-table-column
					  prop="brandName"
					  label="品牌名称" min-width="160">

					</el-table-column>
					<el-table-column	
						prop="imgUrl" label="logo" width="125">
						<template slot-scope="scope">
							<el-popover placement="top-start" title="" trigger="hover">
							  <img :src="scope.row.imgUrl" alt="" height="120" />
							  <img slot="reference" :src="scope.row.imgUrl" 
								style="width:100px;height:45px;border:1px solid #CCC;">
							</el-popover>
						</template>
					</el-table-column>
					<el-table-column
					  prop="createDate"
					  label="创建日期"
					  width="180">
					</el-table-column>
				</el-table>
			<!-- 【D04:END】 -->
			
			<!-- {3}这是分页条 -->
			<!-- 【D05:START】 -->
			<el-pagination
				  background
				  layout="prev, pager, next"
				  :total="totalCount"
				  :current-page="curPage"
				  @current-change="reloadPage"
				  style="margin-top:10px;" >
			</el-pagination>
			<!-- 【D05:END】 -->
		</el-card>

	  </el-col>
	</el-row>

  </div>
</template>

<script>
import { 
	getCategoryList, associateBrand,
	addCategory, updateCategory,
	deleteCategory
} from '@/api/pms_category.js'
import { pickForm, formatDate } from '@/utils/common.js'
import { listByCategory } from '@/api/pms_brand.js'

export default {
  name: 'Category',
  data () {
    return {
		/* 1.Brand 品牌列表的分页参数 */
		curPage: 1,
		pageSize: 10,
		totalCount: 0,
		brandList: [],
		searchForm:{
			id:'',
			categoryId:'',
			brandName:''
		},
		
		/* 2.Category 类别树形相关参数 */
		categoryList:[],
		defaultProps:{
			children: 'children',
			label: 'categoryName'
		},
		curSelect:{},   /* 当前选择 */
		
		/* 3.类别表单 */	
		categoryForm:{
			id:'',
			categoryName:'',
			parentId:'',
			pIds:'',
			showStatus:'',
			sort:'',
			icons:'icons'
		},
		showForm:false,
		showBrand:false,
		categoryRules:{},
		opType:'',
		formTitle:'编辑类别',
		btnText:'保存修改',
		
		/* 4.其它数据 */
		selectItems:[],  /*记住这里有 s */		
	}
  },    /* DATA-END */
  
  methods:{
	/* 【M0】加载类别树形列表。 */
	loadCategoryTree(){
		getCategoryList()
		.then(
			resp=>{
				this.categoryList = resp.data;
				/* 标记叶子节点(isLeap)，删除按钮只对叶子显示 */
				this.setLeap(this.categoryList, 1);
			});
	},

	/* 【M1】setLeap 【---】*/
	setLeap(childList, level){
		childList.forEach(
			(D)=>{
				D.level = level;
				console.log("[FOREACH]【%s】【%s】", 
					D.categoryName, D.level );
				let children = D.children;
				if( !children || children.length==0 ){
					D.isLeap = true;
				}else{
					D.isLeap = false;
					this.setLeap( children, level+1 );
				}
			}
		);
	},
  
	/* 【M1】类别【节点】点击==>【触发方法】 */
	handleNodeClick(row, node, component){
		let pName = (node && node.parent && node.parent.level > 0)
			? node.parent.data.categoryName : '无';
		let cName = row.categoryName;
		this.opType = "edit"; /* 操作类型. */
		this.btnText = "保存修改";
		this.formTitle = `编辑类别【${cName}】【父节点: ${pName}】`;
		this.categoryForm = {...row};
		/* 1.设置类别的显示状态(适配 UI 界面) */
		let status = (row.showStatus===1)? true : false;
		this.categoryForm.showStatus = status;
	},

	/* 【M2】追加子节点
	   【1级，2级节点允许添加】 */
	append( data ){
		let cName = data.categoryName;
		this.opType = "add"; /* 操作类型:add. */
		this.btnText = "确认添加";
		this.formTitle = `添加子类别【${cName}】`;
		this.categoryForm = {parentId: data.id};
	},

	/* 【M2.5】保存类别：opType=add 走新增，edit 走更新 */
	saveCategory(){
		if(!this.categoryForm.categoryName){
			this.$message.warning('请填写类别名称');
			return;
		}
		let form = Object.assign({}, this.categoryForm);
		form.showStatus = form.showStatus ? 1 : 0;
		let req = (this.opType === 'add') ? addCategory(form) : updateCategory(form);
		req.then(()=>{
			this.$message.success(this.opType === 'add' ? '添加成功' : '修改成功');
			this.loadCategoryTree();
		}).catch(()=>{});
	},
	/*【M3】编辑类别节点【----】 */
	edit( data ){
		console.log( data );
	},
	
	/* 【M4】移除类别节点 */
	remove(node, data) {
		let id = data.id;
		let categoryName = data.categoryName;
		this.$confirm(
			`确认要删除【${categoryName}】节点吗?`,
			"安全警告",
			{ type:"warning" }
		).then(()=>{
			/* 1.调用API删除分类. */
			deleteCategory(id)
			.then(
				resp=>{
					this.$message.success(`删除【${categoryName}】成功。`);
					/* 重新加载树形列表. */
					this.loadCategoryTree();
				}
			).catch(()=>{
				this.$message.error('删除失败：该分类可能已被商品或品牌关联');
			});
		}).catch(()=>{});
	},
	
	/* 【M5】重加载页 */
	reloadPage( page ) {
		let categoryId = this.curSelect.categoryId;
		/* 1.查询品牌列表【带关联标记】*/
		this.queryList(categoryId, page);
	},

	/* 【M6】复选框的变化处理代码 */
	handleSelectChange( items ){
		this.selectItems = items;
	},

	/* 【M7】关联品牌 */
	associate(node, data){
		/* 1.操作类型:查询品牌列表. */
		this.opType = "brandList";
		/* 2.保存当前选中的类别信息. */
		this.curSelect = {
			categoryId: data.id,
			categoryName: data.categoryName
		};
		/* 3.执行品牌查询. */
		this.queryList(data.id, 1);
	},
	
	/*【M8】搜索品牌列表(带关联标记的) */
    doSearch(){
		let cID = this.curSelect.categoryId;
		this.queryList(cID, 1);
	},

	/*【M9】查询列表。【图片M5/M7/M8均调用queryList, 补最小实现; 无图, 可替换】*/
	queryList(categoryId, page){
		/* 1.设置当前页. */
		this.curPage = page;
		/* 2.把分类ID放入搜索条件. */
		this.searchForm.categoryId = categoryId;
		/* 3.抓取非空数据. */
		let param = pickForm(this.searchForm);
		/* 4.调用API查询品牌列表(带关联标记). */
		listByCategory(this.curPage, this.pageSize, param)
		.then(resp=>{
			/* 5.把 logo 文件名拼成可访问的图片地址 */
			let BASE = "http://localhost:8090/mall-sys";
			let list = resp.data.map(br=>{
				br.imgUrl = br.logoName
					? `${BASE}/Brand/showImg/${br.logoName}` : '';
				return br;
			});
			this.brandList = list;
			this.totalCount = resp.total;
			this.totalCount = resp.total;
			this.$nextTick(()=>{
				list.forEach(br=>{
					if(br.isAssociate == 1){
						this.$refs.brandTable.toggleRowSelection(br, true);
					}
				});
			});
		});
	},
	
	/*【M10】processList()【TODO】*/
	/* --请填入代码 -- */
	
	/*【M11】提交选择。*/
	submitSelection(){
		let curCategoryId = this.curSelect.categoryId;
		let curCategoryName = this.curSelect.categoryName;
		let checkedIds = this.selectItems.map(br=>br.id);
		let oldIds = this.brandList.filter(br=>br.isAssociate==1).map(br=>br.id);
		let newIds = checkedIds.filter(id=>!oldIds.includes(id));
		let brands = this.brandList.filter(br=>newIds.includes(br.id));
		let deleteIds = oldIds.filter(id=>!checkedIds.includes(id));
		associateBrand({
			categoryId: curCategoryId,
			categoryName: curCategoryName,
			deleteIds: deleteIds,
			brands: brands
		}).then(resp=>{
			this.$message.success('关联成功');
			this.queryList(curCategoryId, this.curPage);
		});
	},
	/*【M12】提交选择。【TODO】*/
	/* --请填入代码 -- */
	
	/*【M13】保存类别。【TODO】*/
	/* --请填入代码 -- */
	
	/*【M14】添加类别的操作方法。【TODO】*/
	/* --请填入代码 -- */
	
	/*【M15】doUpdateCategory。【TODO】*/
	/* --请填入代码 -- */

	/*【M16】设置表格行选中方法。【TODO】*/
	/* --请填入代码 -- */
	
	/*【M17】加载类别的树形列表。【TODO】*/
	/* --请填入代码 -- */
	
	/*【M18】设置父类别的名称。【TODO】*/
	/* --请填入代码 -- */
	
  },  /* 方法区 [结束] */
  
  //{ps}当 Vue 实例创建完成执行以下内容
  //    [生命周期-勾子函数]
  created(){
	 //1.加载类别的树形列表。
	 this.loadCategoryTree();
  }
}  /* VUE 声明块 [结束]  */
</script>

<style scoped>
span.el-tree-node__label{ font-size:17px; }
#confirm span{ color:white; }
#topic{
	margin-right:25px;
	font-weight:bold
}

/* ===== 页面高度锁定：整页不滚动，只有卡片内部滚动 ===== */
.category-page{
	height: calc(100vh - 90px);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
}
.category-page .cat-tabs{ flex-shrink: 0; }
.category-page .cat-row{
	flex: 1;
	min-height: 0;
	display: flex;
	align-items: stretch;
}
.category-page .cat-col{
	height: 100%;
	display: flex;
	flex-direction: column;
}
.category-page .cat-col .box-card{
	height: 100%;
	width: 100%;
	margin-bottom: 0;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}
.category-page .cat-col >>> .custom-tree-node{ white-space: nowrap; }
</style>

<!-- 非 scoped：穿透 el-card 内部，强制 body 可滚动 -->
<style>
.category-page .el-card{
	display: flex !important;
	flex-direction: column;
}
.category-page .el-card__header{
	flex-shrink: 0;
}
.category-page .el-card__body{
	flex: 1;
	height: 0;
	min-height: 0;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>