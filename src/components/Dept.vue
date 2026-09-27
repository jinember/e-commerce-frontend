<template>
  <div class="dept-page">
	<!-- 【1】【TABS|页签】【START】 -->
		<el-tabs type="border-card">
      <el-tab-pane>
         <span slot="label"><i class="el-icon-office-building"></i>部门列表</span>        
      </el-tab-pane>
    </el-tabs>
	<!-- 【1】【TABS|页签】【END】 -->
	
	<el-row :gutter="24" class="dept-row">
	    <!-- 【2】【部门列表】【START】 -->
		<el-col :span="5">
			<el-card class="box-card">
			
			  <div slot="header" class="clearfix">
				<label>请选择部门</label>
				<label style="margin-left:20px;color:gray;">名称过滤:</label>
				<el-input size="small" style="width:100px;"
					v-model="filterForm.deptName"
					@change="onFilter();" >
				</el-input>
			  </div>
			  
			  <el-tree
				:data="deptList"				
				:props="defaultProps"
				:expand-on-click-node="false"
				node-key="id"
				default-expand-all
				@node-click="handleNodeClick" >
				<span class="custom-tree-node" slot-scope="{ node, data }">
					<span>{{ data.deptName }}</span>
					<span style="margin-left:8px;">
						  <el-button
							 type="text"
							 size="medium"
							 v-if="data.level<=3"
							 @click.stop
							 @click="()=>handleAppend(data)">
							 添加
						  </el-button>
						  <el-button
						     style="margin-left:5px;"
							 type="text"
							 size="medium"
							 v-if="!data.hasSub"
							 @click.stop
							 @click="()=>handleDelete(data)">
							 删除
						  </el-button> 
					</span>
			    </span>
			  </el-tree>
			</el-card>	  
		</el-col>
		<!-- 【2】【部门列表】【END】 -->
		
	  <el-col :span="19">			
		<el-card class="box-card">
			<!-- 【D03:START】【部门表单】
			     栅格布局+label-width，去掉 float:left
			     （float 会让输入框可见区域与可点击区域错位，表现为"不可编辑"） -->
			<el-form
				:model="deptForm" :rules="deptRules"
				ref="deptFormRef" label-width="90px">
			  <div style="margin-bottom:12px;">{{dialogTitle}}</div>

			  <el-row :gutter="12">
				<el-col :span="8">
				  <el-form-item label="部门名称" prop="deptName">
					<el-input v-model="deptForm.deptName" clearable
						placeholder="3-10个字符"
						:disabled="opMode!='edit' && opMode!='add'"></el-input>
				  </el-form-item>
				</el-col>

				<el-col :span="8">
				  <el-form-item label="父节点ID" prop="parentId">
					<el-input v-model="deptForm.parentId" readonly
						placeholder="由所选父级自动带入"
						:disabled="opMode!='edit' && opMode!='add'"></el-input>
					<input type="hidden" :value="deptForm.pIds" />
				  </el-form-item>
				</el-col>

				<el-col :span="8">
				  <el-form-item label="部门描述" prop="deptDesc">
					<el-input v-model="deptForm.deptDesc" clearable
						placeholder="如：负责公司财务核算"
						:disabled="opMode!='edit' && opMode!='add'"></el-input>
				  </el-form-item>
				</el-col>
			  </el-row>

			  <!-- {1}[添加其它同类项] -->
			  <el-form-item label-width="0">
				 <el-button id="confirm" type="primary"
					@click="saveDept" :disabled="opMode!='edit' && opMode!='add'">{{btnText}}</el-button>
			  </el-form-item>
			</el-form>
			<!-- 【D03:END】【部门表单】 -->
		</el-card> 
	  </el-col>
	</el-row>

  </div>
</template>

<script>
import { pickForm } from '@/utils/common.js'
import { 
	getDeptList, 
	addDept,
	updateDept,
	deleteDept
} from '@/api/pms_dept.js'

export default {
  name: 'Dept',
  
  /*{1} 数据区 */
  data () {
    return {
	
		/* 1.部门列表相关数据. */
		deptList:[],
		defaultProps:{
			children: "children",
			label: "deptName"
		},

		/* 2.搜索栏相关数据. */
		filterForm:{
			id: "",
			deptName:""
		},
		
		/* 3.部门表单相关数据. */
    deptForm:{ },
		dialogTitle:'编辑部门',
		showFormBox:false,
		opMode:'',       /* 添加模式|编辑模式 */
		deptRules:{      /* 表单验证规则 */
			deptName:[
				{required:true, message:'请输入部门', trigger:'blur'},
				{min:3, max:10, message:'部门长度要求:(3-10)', trigger:'blur'},
			],
		},
		btnText:"保存编辑",
		/* 5.其它数据。*/
	}
  },  /* [DATA-END] */
  
  /*{2}方法区 */
  methods:{
    /* 【M1】setLeap()【TODO】   功能解析：在每一个节点上标记它是否为叶子节点。*/
	
	setLeap(childList,level){
		childList.forEach(
			(D)=>{
				D.level = level;
				console.log("【遍历节点】 【%s】 【%s】",
					D.deptName,D.level);
				let children = D.children;
				if(!children || children.length == 0){
					D.isLeap = true;
				}
				else{
					D.isLeap = false;
					this.setLeap(children, level+1);
				}
			}
		);
	},

	/* 【M2】重载部门列表【TODO】*/
	
	reloadList(){
	getDeptList()
	.then(
		resp=>{
			this.deptList = resp.data;
			this.setLeap(this.deptList,1);
		}
	);
	},

	/* 【M3】点击部门节点触发此方法。【---】
	   【修复】原写法直接把树节点对象绑给表单；节点上缺失的字段（如 deptDesc）
	   在 Vue2 中不是响应式的，会导致输入框无法编辑。
	   这里改为克隆并预置全部字段。 */
	handleNodeClick( row, node, component ){
		console.log("[DEBUG]你点击了部门:【%s】", row.deptName);
		this.deptForm = {
			id:       row.id,
			deptName: row.deptName,
			parentId: row.parentId,
			pIds:     row.pIds,
			deptDesc: row.deptDesc || ''
		};
		this.opMode = 'edit';    /* 编辑模式 */
		this.dialogTitle = `编辑部门【${row.deptName}】`;
		this.btnText = "保存编辑";
	},

	/* 【M4】过滤部门名称。【TODO】*/
	
	onFilter(){
		let keyword = this.filterForm.deptName;
		if(keyword && keyword !=""){
			let retList = [];
			//1.调用下面的过滤方法来检索部门
			this.doFilter(this.deptList,keyword,retList);
			this.deptList = retList;
		}
		else{
			//2.从后台重新下载列表
			this.reloadList();
		}
		
	},
	
	/* 【M5】过滤部门名称。【--】*/
	doFilter( list, keyword, retList ){
		let find = 0;		
		for(let i=0; i<list.length; i++){
			let DP = list[i];
			let nDP = this.copyDP( DP );
			/* a.处理非叶子 */
			let _fd = 0;
			if( DP.children && DP.children.length>0 ){
				let _list = [];
				_fd = this.doFilter(
					DP.children, keyword, _list );
				if( _fd > 0 ){
					nDP.children = _list;
					retList.push( nDP );
					find ++;
				}
			}
			if( _fd==0 ){   /* b.处理叶子节点了。 */
				let hasKey = DP.deptName.includes(keyword);
				if( hasKey ){
					retList.push( nDP );
					find ++;
				}
			}
		}
		return find;
	},

	/* 【M6】显示添加对话框。【TODO】*/
	
	handleAppend(parDept){
		let parName = parDept.deptName;
		/* 【修复】预置全部字段，保证新增时输入框也是响应式的。 */
		this.deptForm = {
			id:       null,
			deptName: '',
			parentId: parDept.id,
			pIds:     parDept.pIds,
			deptDesc: ''
		};
		this.opMode = 'add';
		this.dialogTitle = `添加【${parName}】的子级部门`;
		this.btnText = "保存添加";
	},

	/* 【M7】添加部门。【TODO】*/
	
	doAddDept(){
		let deptName = this.deptForm.deptName;
		//1.调用API方法保存数据到后台
		addDept(this.deptForm)
		.then(
			resp=>{
				this.$message(`添加【${deptName}】部门成功`);
				this.opMode = "";
				//2.清空检索的信息
				this.clearSearch();
				//3.重新加载树形列表
				this.reloadList();
			}
		);
	},

	/* 【M8】更新部门。 */
	doUpdateDept(){
		let deptName = this.deptForm.deptName;
		/* 1.调用 API 方法保存数据到后台。*/
		updateDept( this.deptForm )
		.then(
			resp=>{
				this.$message(`更新【${deptName}】部门成功。`);
				this.opMode = "";
				/* 2.清空检索的信息 */
				this.clearSearch();
				/* 3.重新加载树形列表。*/
				this.reloadList();
			}
		);
	},

	/* 【M9】保存部门。 */
	saveDept(){
		/* 【ps】当点击保存部门时，触发以下逻辑。*/
		if( this.opMode=="add" ){
			this.doAddDept();
		}else{
			this.doUpdateDept();
		}
	},

	/* 【M10】删除部门。 */
	handleDelete( dept ){
		let id = dept.id;
		let deptName = dept.deptName;
		this.$confirm(`你确认要删除【${deptName}】节点吗？`,
			"安全警告",{
				type:"warning"
			}
		).then(()=>{
			/* 1.点击确认会执行以下逻辑。*/
			this.confirmDelete(id, deptName);
		}).catch(()=>{});
	},
	
	
	confirmDelete( id, deptName ){
		deleteDept( id )
		.then(
			(resp)=>{
				this.$message("删除【"+ deptName +"】部门成功。");
				this.opMode = "";
				this.clearSearch();
				this.reloadList();
			}
		);	
	},	

	//9.批量删除部门
	doBatchDelete(){
		
	},
	
	copyDP( DP ){
		return {
			id: DP.id, 
			deptName: DP.deptName,
			parentId: DP.parentId,
			pIds: DP.pIds,
			deptDesc: DP.deptDesc,
			isLeap: DP.isLeap, 
			level: DP.level
		};
	},
	
	clearSearch(){
		this.filterForm = {
			id: "",
			deptName: ""
		};
	},

  },    /* [METHOD-END] */
  
  /*{3}生命周期方法*/
  created(){
	this.reloadList();
  }    /*【CREATED】【END】*/

}
</script>

<style>
span.el-tree-node__label{
	font-size:17px;
}

.dept-page{
	height: calc(100vh - 90px);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	box-sizing: border-box;
}
.dept-page > .el-tabs{
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
.dept-page .dept-row{
	flex: 1;
	min-height: 0;
	display: flex !important;
	align-items: stretch;
}
.dept-page .dept-row > .el-col{
	height: 100%; float: none !important; display: flex !important;
	flex-direction: column;
}
.dept-page > .el-tabs .el-tabs__content{
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}
.dept-page > .el-tabs .el-tab-pane{
    height: 100%;
    display: flex;
    flex-direction: column;
}
.dept-page .el-card{
	height: 100%;
	width: 100%;
	margin-bottom: 0;
	display: flex !important;
	flex-direction: column;
	box-sizing: border-box;
}
.dept-page .el-card__header{ flex-shrink: 0; }
.dept-page .el-card__body{
	flex: 1;
	height: 0;
	min-height: 0;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
