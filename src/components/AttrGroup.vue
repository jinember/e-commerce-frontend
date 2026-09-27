<template>
    <div class="attr-group-page">
		<!-- 【顶部】属性分组 tabs -->
		<el-tabs type="border-card" v-model="activeTab">
			<!-- 【tab1】属性分组: 分类树 + 分组列表【START】 -->
			<el-tab-pane name="groupList">
				<span slot="label"><i class="el-icon-collection"></i>属性分组</span>
				<el-row :gutter="24" class="attr-group-row" style="margin-top:20px;">
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

					<!-- 【右】分组列表【START】 -->
					<el-col :span="19">
						<el-card class="box-card">
							<!-- 搜索栏 -->
							<el-form :inline="true" :model="searchForm" class="demo-form-inline">
								<el-form-item label="分组名称:">
									<el-input style="width:100%;" placeholder="请输入分组名称"
										v-model="searchForm.groupName"
										clearable @clear="doSearch"></el-input>
								</el-form-item>
								<el-form-item>
									<el-button type="primary" @click="doReset">清空</el-button>
									<el-button type="primary" @click="doSearch">查询</el-button>
									<el-button type="primary" @click="showAddBox">新增分组</el-button>
								</el-form-item>
							</el-form>

							<!-- 分组表格 -->
							<el-table :data="groupList" height="410" style="width: 100%">
								<el-table-column prop="id" label="编号" width="80"></el-table-column>
								<el-table-column prop="groupName" label="分组名称" min-width="150"></el-table-column>
								<el-table-column prop="categoryId" label="类别ID" width="90"></el-table-column>
								<el-table-column prop="descript" label="分组描述" min-width="180"></el-table-column>
								<el-table-column prop="icons" label="图标" width="100"></el-table-column>
								<el-table-column prop="sort" label="排序" width="80"></el-table-column>
								<el-table-column label="操作" width="160">
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
					<!-- 【右】分组列表【END】 -->
				</el-row>
				</el-tab-pane>
		</el-tabs>

		<!-- 添加/编辑属性分组对话框【START】 -->
		<el-dialog :title="dialogTitle" :visible.sync="showFormBox" width="50%"
			@close="onClose">
			<el-form :model="groupForm" :rules="groupRules" ref="groupFormRef"
				label-width="90px">
				<el-form-item label="分组名称" prop="groupName">
					<el-input v-model="groupForm.groupName"></el-input>
				</el-form-item>
				<el-form-item label="所属类别">
					<el-input :value="curCategory.categoryName || ''" readonly></el-input>
				</el-form-item>
				<el-form-item label="分组描述">
					<el-input type="textarea" :rows="3" v-model="groupForm.descript"></el-input>
				</el-form-item>
				<el-form-item label="分组图标">
					<el-input v-model="groupForm.icons"></el-input>
				</el-form-item>
				<el-form-item label="分组排序" prop="sort">
					<el-input-number v-model="groupForm.sort" :min="0"></el-input-number>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="showFormBox=false">取消</el-button>
				<el-button type="primary" @click="saveGroupData">确定</el-button>
			</span>
		</el-dialog>
		<!-- 添加/编辑属性分组对话框【END】 -->
    </div>
</template>

<script>
import { getCategoryList } from '@/api/pms_category.js'
import {
	listAttrGroup, addAttrGroup, updateAttrGroup, deleteAttrGroup
} from '@/api/pms_attrGroup.js'

export default {
  name: 'AttrGroup',
  data () {
    return {
		/* 1.当前激活的标签页 */
		activeTab: 'groupList',

		/* 2.左侧分类树 */
		categoryList: [],
		curCategory: {},       /* 当前选中的三级分类 */

		/* 3.【添加属性分组】tab 表单 */
		addTabForm: {
			groupName:'', descript:'', icons:'', sort:0
		},

		/* 4.搜索+分页 */
		searchForm: { groupName: '' },
		groupList: [],
		curPage: 1,
		pageSize: 10,
		totalCount: 0,

		/* 5.添加/编辑对话框 */
		showFormBox: false,
		opMode: 'add',
		dialogTitle: '添加属性分组',
		groupForm: {},
		groupRules: {
			groupName: [
				{ required: true, message: '请输入分组名称', trigger: 'blur' }
			],
			sort: [
				{ required: true, message: '请输入分组排序', trigger: 'blur' }
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

	/*【M2】点击分类节点: 选中三级类别, 加载其分组 */
	handleNodeClick( row ){
		this.curCategory = row;
		this.addTabForm.categoryId = row.id;   /* tab 表单同步 */
		this.searchForm.groupName = '';
		this.getGroupList( 1 );
	},

	/*【M3】查询分组列表 */
	getGroupList( page ){
		let categoryId = this.curCategory.id;
		if( !categoryId ){
			this.$message.warning('请先在左侧选择一个分类');
			return;
		}
		this.curPage = page;
		listAttrGroup( this.curPage, this.pageSize, categoryId )
		.then(
			resp=>{
				this.groupList = resp.data;
				this.totalCount = resp.total;
			});
	},

	/*【M4】搜索 */
	    /* 【M-清空】重置筛选条件 */
    doReset(){
      this.searchForm = {};
      this.doSearch();
    },
    doSearch(){
		this.getGroupList( 1 );
	},

	/*【M5】分页 */
	reloadPage( newPage ){
		this.getGroupList( newPage );
	},

	/*【M6】显示新增分组对话框 */
	showAddBox(){
		this.opMode = "add";
		this.dialogTitle = `添加属性分组【所在类别: ${this.curCategory.categoryName || ''}】`;
		this.groupForm = { categoryId: this.curCategory.id, sort: 0 };
		this.showFormBox = true;
	},

	/*【M7】编辑分组 */
	handleEdit( row ){
		this.opMode = "edit";
		this.dialogTitle = `修改属性分组【${row.groupName}】`;
		this.groupForm = { ...row };
		this.showFormBox = true;
	},

	/*【M8】保存(新增/修改) */
	saveGroupData(){
		this.$refs.groupFormRef.validate(
			valid=>{
				if( !valid ) return;
				if( this.opMode=="add" ){
					addAttrGroup( this.groupForm )
					.then(
						resp=>{
							this.onSaveSuccess("添加");
						});
				}else{
					updateAttrGroup( this.groupForm )
					.then(
						resp=>{
							this.onSaveSuccess("修改");
						});
				}
			});
	},

	/*【M9】保存成功 */
	onSaveSuccess( opType ){
		this.$message(`${opType}【${this.groupForm.groupName}】分组成功。`);
		this.showFormBox = false;
		this.getGroupList( 1 );
	},

	/*【M10】删除分组 */
	handleDelete( row ){
		let name = row.groupName;
		this.$confirm(`确认要删除【${name}】分组吗?`, "安全警告",
			{ type:"warning" })
		.then(()=>{
			deleteAttrGroup( row.id )
			.then(
				resp=>{
					this.$message(`删除【${name}】分组成功。`);
					this.getGroupList( 1 );
				});
		}).catch(()=>{});
	},

	/*【M11】tab 添加表单: 确定 */
	tabAddSave(){
		this.$refs.addTabFormRef.validate(
			valid=>{
				if( !valid ) return;
				let categoryId = this.curCategory.id;
				if( !categoryId ){
					this.$message.warning('请先在左侧选择一个分类');
					return;
				}
				let data = {
					groupName: this.addTabForm.groupName,
					categoryId: categoryId,
					descript: this.addTabForm.descript,
					icons: this.addTabForm.icons,
					sort: this.addTabForm.sort
				};
				addAttrGroup( data )
				.then(
					resp=>{
						this.$message(`添加【${data.groupName}】分组成功。`);
						this.onCloseTabAdd();
						this.getGroupList( 1 );
					});
			});
	},

	/*【M12】tab 添加表单: 取消/清空 */
	onCloseTabAdd(){
		this.addTabForm = { groupName:'', descript:'', icons:'', sort:0 };
		this.$refs.addTabFormRef && this.$refs.addTabFormRef.clearValidate();
	},

	/*【M13】关闭对话框复位 */
	onClose(){
		this.groupForm = {};
		this.$refs.groupFormRef && this.$refs.groupFormRef.clearValidate();
	}
  },

  created(){
	 this.loadCategoryTree();
  }
}
</script>

<style scoped>
span.el-tree-node__label{ font-size:17px; }

.attr-group-page{
	height: calc(100vh - 90px);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
}
.attr-group-page > .el-tabs{
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.attr-group-page .attr-group-row{
	flex: 1;
	min-height: 0;
	display: flex !important;
	align-items: stretch;
}
.attr-group-page .attr-group-row > .el-col{
	height: 100%; float: none !important; display: flex !important;
	flex-direction: column;
}
</style>

<style>
.attr-group-page > .el-tabs .el-tabs__content{
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.attr-group-page > .el-tabs .el-tab-pane{
    height: 100%;
    display: flex;
    flex-direction: column;
}
.attr-group-page .el-card{
	height: 100%;
	width: 100%;
	margin-bottom: 0;
	display: flex !important;
	flex-direction: column;
	box-sizing: border-box;
}
.attr-group-page .el-card__header{ flex-shrink: 0; }
.attr-group-page .el-card__body{
	flex: 1;
	height: 0;
	min-height: 0;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
