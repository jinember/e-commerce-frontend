<template>
    <div class="spec-param-page">
		<el-tabs type="border-card">
			<el-tab-pane>
				<span slot="label"><i class="el-icon-document"></i>规格参数</span>
				<el-row :gutter="24" class="spec-param-row" style="margin-top:20px;">
			<!-- 【左】分类树【START】 -->
			<el-col :span="5">
				<el-card class="box-card">
					<div slot="header" class="clearfix">
						<span>请选择分类</span>
					</div>
					<el-tree
						:data="categoryList"
						node-key="id"
						default-expand-all
						:expand-on-click-node="false"
						@node-click="handleNodeClick">
						<span class="custom-tree-node" slot-scope="{ data }">
							<span>{{ data.categoryName }}</span>
						</span>
					</el-tree>
				</el-card>
			</el-col>
			<!-- 【左】分类树【END】 -->

			<!-- 【右】属性列表【START】 -->
			<el-col :span="19">
				<el-card class="box-card">
					<!-- 搜索栏 -->
					<el-form :inline="true" :model="searchForm" class="demo-form-inline">
						<el-form-item label="属性名称:">
							<el-input style="width:100%;" placeholder="请输入属性名称"
								v-model="searchForm.attrName"
								clearable @clear="doSearch"></el-input>
						</el-form-item>
						<el-form-item label="所属分组:">
							<el-select v-model="searchForm.attrGroupId" placeholder="请选择"
								clearable style="width:140px;">
								<el-option v-for="g in groupOptions" :key="g.value"
									:label="g.label" :value="g.value"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="doSearch">查询</el-button>
							<el-button type="primary" @click="showAddBox">新增属性</el-button>
						</el-form-item>
					</el-form>

					<!-- 属性表格 -->
					<el-table :data="attrList" height="410" style="width: 100%">
						<el-table-column prop="id" label="编号" width="70"></el-table-column>
						<el-table-column prop="attrName" label="属性名称" min-width="150"></el-table-column>
						<el-table-column prop="attrTypeName" label="属性类型" width="100"></el-table-column>
						<el-table-column prop="groupName" label="所属分组" width="110"></el-table-column>
						<el-table-column prop="valueTypeName" label="值类型" width="90"></el-table-column>
						<el-table-column prop="attrValue" label="可选值" min-width="180"></el-table-column>
						<el-table-column label="状态" width="80">
							<template slot-scope="scope">
								<el-tag :type="scope.row.enable==1 ? 'success' : 'info'">
									{{ scope.row.enable==1 ? '启用' : '停用' }}
								</el-tag>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="150">
							<template slot-scope="scope">
								<el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
								<el-button size="mini" type="danger"
									@click="handleDelete(scope.row)">删除</el-button>
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
			</el-col>
			<!-- 【右】属性列表【END】 -->
		</el-row>
			</el-tab-pane>
		</el-tabs>

		<!-- 添加/编辑规格参数对话框【START】 -->
		<el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="50%"
			@close="onClose">
			<el-form :model="attrForm" :rules="attrRules" ref="attrFormRef"
				label-width="90px">
				<el-form-item label="属性名称" prop="attrName">
					<el-input v-model="attrForm.attrName"
						placeholder="输入规格参数名称"></el-input>
				</el-form-item>
				<el-form-item label="属性类型">
					<el-input value="规格参数" readonly></el-input>
				</el-form-item>
				<el-form-item label="值类型">
					<el-select v-model="attrForm.valueType" placeholder="请选择"
						style="width:200px;">
						<el-option label="单值" :value="1"></el-option>
						<el-option label="多值" :value="2"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="可选值">
					<!-- 单值: 直接输入 -->
					<el-input v-if="attrForm.valueType==1"
						v-model="attrForm.attrValue"
						placeholder="请输入可选值"></el-input>
					<!-- 多值: 标签式多选 -->
					<el-select v-else
						v-model="attrForm.valueArr"
						multiple filterable allow-create
						default-first-option
						placeholder="输入后回车添加多个可选值"
						style="width:100%;">
					</el-select>
				</el-form-item>
				<el-form-item label="所属分组">
					<el-select v-model="attrForm.attrGroupId" placeholder="请选择"
						style="width:200px;" clearable>
						<el-option v-for="g in groupOptions" :key="g.value"
							:label="g.label" :value="g.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="所属类别">
					<el-input :value="curCategory.categoryName || ''" readonly></el-input>
				</el-form-item>
				<el-form-item label="可否检索">
					<el-switch v-model="attrForm.searchEnable"
						active-color="#13ce66" inactive-color="#909399"
						:active-value="1" :inactive-value="0"></el-switch>
				</el-form-item>
				<el-form-item label="启用状态">
					<el-switch v-model="attrForm.enable"
						active-color="#13ce66" inactive-color="#909399"
						:active-value="1" :inactive-value="0"></el-switch>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="showFormBox=false">取消</el-button>
				<el-button type="primary" @click="saveAttrData">确定</el-button>
			</span>
		</el-dialog>
		<!-- 添加/编辑规格参数对话框【END】 -->
    </div>
</template>

<script>
import { getCategoryList } from '@/api/pms_category.js'
import { optionsByCategory } from '@/api/pms_attrGroup.js'
import { listAttr, addAttr, updateAttr, deleteAttr } from '@/api/pms_goodsAttr.js'

export default {
  name: 'SpecParam',
  data () {
    return {
		/* 1.属性类型: 1=基本属性(规格参数) */
		ATTR_TYPE: 1,

		/* 2.左侧分类树 */
		categoryList: [],
		curCategory: {},

		/* 3.搜索+分页 */
		searchForm: { attrName:'', attrGroupId:null },
		groupOptions: [],      /* 所属分组下拉 */
		attrList: [],
		curPage: 1,
		pageSize: 10,
		totalCount: 0,

		/* 4.添加/编辑对话框 */
		showFormBox: false,
		opMode: 'add',
		dialogTitle: '添加规格参数',
		attrForm: {
			attrName:'', valueType:1, attrValue:'', valueArr:[],
			attrGroupId:null, searchEnable:1, enable:1
		},
		attrRules: {
			attrName: [
				{ required: true, message: '请输入属性名称', trigger: 'blur' }
			]
		}
    }
  },

  methods: {
	/*【M1】加载分类树 */
	loadCategoryTree(){
		getCategoryList()
		.then(
			resp=>{
				this.categoryList = resp.data;
			});
	},

	/*【M2】点击分类节点 */
	handleNodeClick( row ){
		this.curCategory = row;
		this.searchForm.attrName = '';
		this.searchForm.attrGroupId = null;
		/* 加载该类别下的分组下拉。 */
		this.loadGroupOptions( row.id );
		this.getAttrList( 1 );
	},

	/*【M3】加载所属分组下拉 */
	loadGroupOptions( categoryId ){
		optionsByCategory( categoryId )
		.then(
			resp=>{
				this.groupOptions = resp.data || [];
			});
	},

	/*【M4】查询属性列表 */
	getAttrList( page ){
		let categoryId = this.curCategory.id;
		if( !categoryId ){
			this.$message.warning('请先在左侧选择一个分类');
			return;
		}
		this.curPage = page;
		let param = {
			categoryId: categoryId,
			attrType: this.ATTR_TYPE,
			attrName: this.searchForm.attrName,
			attrGroupId: this.searchForm.attrGroupId
		};
		listAttr( this.curPage, this.pageSize, param )
		.then(
			resp=>{
				this.attrList = resp.data;
				this.totalCount = resp.total;
			});
	},

	/*【M5】搜索 */
	doSearch(){
		this.getAttrList( 1 );
	},

	/*【M6】分页 */
	reloadPage( newPage ){
		this.getAttrList( newPage );
	},

	/*【M7】显示新增对话框 */
	showAddBox(){
		this.opMode = "add";
		this.dialogTitle = `添加规格参数【所属类别: ${this.curCategory.categoryName || ''}】`;
		this.attrForm = {
			attrName:'', valueType:1, attrValue:'', valueArr:[],
			attrGroupId:null, searchEnable:1, enable:1
		};
		this.showFormBox = true;
	},

	/*【M8】编辑 */
	handleEdit( row ){
		this.opMode = "edit";
		this.dialogTitle = `修改规格参数【${row.attrName}】`;
		this.attrForm = {
			id: row.id,
			attrName: row.attrName,
			valueType: row.valueType,
			attrValue: row.attrValue,
			attrGroupId: row.attrGroupId,
			categoryId: row.categoryId,
			searchEnable: row.searchEnable,
			enable: row.enable,
			/* 多值时拆成数组给多选组件用。 */
			valueArr: (row.valueType==2 && row.attrValue)
				? row.attrValue.split(/[;；]/)
				: []
		};
		this.showFormBox = true;
	},

	/*【M9】保存(新增/修改) */
	saveAttrData(){
		this.$refs.attrFormRef.validate(
			valid=>{
				if( !valid ) return;
				/* 1.多值时把数组拼成"分号"字符串提交。 */
				if( this.attrForm.valueType==2 ){
					this.attrForm.attrValue =
						(this.attrForm.valueArr || []).join(";");
				}
				this.attrForm.categoryId = this.curCategory.id;
				this.attrForm.attrType = this.ATTR_TYPE;
				if( this.opMode=="add" ){
					addAttr( this.attrForm )
					.then(
						resp=>{
							this.onSaveSuccess("添加");
						});
				}else{
					updateAttr( this.attrForm )
					.then(
						resp=>{
							this.onSaveSuccess("修改");
						});
				}
			});
	},

	/*【M10】保存成功 */
	onSaveSuccess( opType ){
		this.$message(`${opType}【${this.attrForm.attrName}】属性成功。`);
		this.showFormBox = false;
		this.getAttrList( 1 );
	},

	/*【M11】删除属性 */
	handleDelete( row ){
		let name = row.attrName;
		this.$confirm(`确认要删除【${name}】属性吗?`, "安全警告",
			{ type:"warning" })
		.then(()=>{
			deleteAttr( row.id )
			.then(
				resp=>{
					this.$message(`删除【${name}】属性成功。`);
					this.getAttrList( 1 );
				});
		}).catch(()=>{});
	},

	/*【M12】关闭对话框复位 */
	onClose(){
		this.attrForm = {};
		this.$refs.attrFormRef && this.$refs.attrFormRef.clearValidate();
	}
  },

  created(){
	 this.loadCategoryTree();
  }
}
</script>

<style scoped>
span.el-tree-node__label{ font-size:17px; }

.spec-param-page{
	height: calc(100vh - 90px);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
}
.spec-param-page > .el-tabs{
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.spec-param-page .spec-param-row{
	flex: 1;
	min-height: 0;
	display: flex !important;
	align-items: stretch;
}
.spec-param-page .spec-param-row > .el-col{
	height: 100%; float: none !important; display: flex !important;
	flex-direction: column;
}
</style>

<style>
.spec-param-page > .el-tabs .el-tabs__content{
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.spec-param-page > .el-tabs .el-tab-pane{
    height: 100%;
    display: flex;
    flex-direction: column;
}
.spec-param-page .el-card{
	height: 100%;
	width: 100%;
	margin-bottom: 0;
	display: flex !important;
	flex-direction: column;
	box-sizing: border-box;
}
.spec-param-page .el-card__header{ flex-shrink: 0; }
.spec-param-page .el-card__body{
	flex: 1;
	height: 0;
	min-height: 0;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
