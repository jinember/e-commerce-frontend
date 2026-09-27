<template>
  <div>
	<el-table :data="draftList" border style="width:100%;" v-loading="loading">
		<el-table-column prop="id" label="ID" width="70"></el-table-column>
		<el-table-column prop="draftName" label="草稿名称" min-width="180" show-overflow-tooltip></el-table-column>
		<el-table-column label="状态" width="110" align="center">
			<template slot-scope="scope">
				<el-tag v-if="scope.row.status===2" type="success" size="small">已发布</el-tag>
				<el-tag v-else-if="scope.row.status===1" type="warning" size="small">定时待发布</el-tag>
				<el-tag v-else type="info" size="small">草稿</el-tag>
			</template>
		</el-table-column>
		<el-table-column prop="publishTime" label="定时发布时间" width="160">
			<template slot-scope="scope">
				<span v-if="scope.row.publishTime">{{ formatTime(scope.row.publishTime) }}</span>
				<span v-else style="color:#bbb;">—</span>
			</template>
		</el-table-column>
		<el-table-column prop="updateTime" label="更新时间" width="160">
			<template slot-scope="scope">{{ formatTime(scope.row.updateTime) }}</template>
		</el-table-column>
		<el-table-column label="操作" width="400" align="center">
			<template slot-scope="scope">
				<template v-if="scope.row.status !== 2">
					<el-button size="mini" style="margin:0 4px 0 0;" @click="editDraft(scope.row)">继续编辑</el-button>
					<el-button size="mini" type="warning" style="margin:0 4px 0 0;" @click="openSchedule(scope.row)">定时发布</el-button>
					<el-button size="mini" type="success" style="margin:0 4px 0 0;" @click="publishDraft(scope.row)">立即发布</el-button>
					<el-button size="mini" type="danger" style="margin:0;" @click="deleteDraft(scope.row)">删除</el-button>
				</template>
				<span v-else style="color:#bbb;">已上架，不可再操作</span>
			</template>
		</el-table-column>
	</el-table>

	<!-- 分页 -->
	<el-pagination
		style="margin-top:15px;text-align:left;"
		background
		@size-change="handleSizeChange"
		@current-change="handleCurrentChange"
		:current-page="currentPage"
		:page-sizes="[10, 20, 50]"
		:page-size="pageSize"
		layout="total, sizes, prev, pager, next, jumper"
		:total="total">
	</el-pagination>

	<!-- 定时发布弹窗 -->
	<el-dialog title="定时发布" :visible.sync="scheduleVisible" width="420px" append-to-body>
		<div style="margin-bottom:10px;color:#606266;">草稿：{{ scheduleRow.draftName }}</div>
		<el-date-picker
			v-model="scheduleTime"
			type="datetime"
			placeholder="选择自动发布时间"
			value-format="yyyy-MM-dd HH:mm:ss"
			style="width:100%;">
		</el-date-picker>
		<div slot="footer">
			<el-button @click="scheduleVisible = false">取消</el-button>
			<el-button type="primary" @click="confirmSchedule">确定</el-button>
		</div>
	</el-dialog>
  </div>
</template>

<script>
import * as draftApi from '@/api/pms_goodsDraft.js'

export default {
  name: 'GoodsDraftPanel',
  data(){
	return {
		loading: false,
		draftList: [],
		total: 0,
		currentPage: 1,
		pageSize: 10,
		scheduleVisible: false,
		scheduleRow: {},
		scheduleTime: ''
	}
  },
  methods:{
	/* 加载草稿列表 */
	loadList(){
		this.loading = true;
		draftApi.list(this.currentPage, this.pageSize, {}).then(resp=>{
			this.draftList = resp.data || [];
			this.total = resp.total || 0;
		}).finally(()=>{ this.loading = false; });
	},
	/* 时间格式化：后端返回可能是时间戳或字符串，统一成 yyyy-MM-dd HH:mm:ss */
	formatTime(t){
		if(!t) return '';
		let d = new Date(t);
		if(isNaN(d.getTime())){ return t; }
		let p = n => (n<10?'0'+n:n);
		return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())
			+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
	},
	/* 继续编辑：把草稿灌回 Redis，拿到 pubKey 后通知父组件跳回第一步 */
	editDraft(row){
		draftApi.resume(row.id).then(resp=>{
			if(resp && resp.result==='success' && resp.pubKey){
				window.localStorage.setItem('pubKey', resp.pubKey);
				this.$message.success('草稿已恢复，可继续编辑');
				/* 交给父组件处理：第一步切tab回显，其余步骤路由跳回第一步 */
				this.$emit('resume', resp.pubKey);
			}else{
				this.$message.error('恢复草稿失败');
			}
		});
	},
	/* 立即发布 */
	publishDraft(row){
		this.$confirm('确定立即发布草稿「'+row.draftName+'」吗？发布后商品直接上架。', '提示', {
			confirmButtonText:'确定发布', cancelButtonText:'取消', type:'warning'
		}).then(()=>{
			draftApi.publishNow(row.id).then(resp=>{
				this.$message.success('发布成功，商品SPU ID：'+resp.spuId);
				this.loadList();
			});
		}).catch(()=>{});
	},
	/* 打开定时发布弹窗 */
	openSchedule(row){
		this.scheduleRow = row;
		this.scheduleTime = row.publishTime ? this.formatTime(row.publishTime) : '';
		this.scheduleVisible = true;
	},
	/* 确认定时发布 */
	confirmSchedule(){
		if(!this.scheduleTime){
			this.$message.warning('请选择发布时间');
			return;
		}
		draftApi.schedule(this.scheduleRow.id, this.scheduleTime).then(()=>{
			this.$message.success('已设置定时发布：'+this.scheduleTime);
			this.scheduleVisible = false;
			this.loadList();
		});
	},
	/* 删除草稿 */
	deleteDraft(row){
		this.$confirm('确定删除草稿「'+row.draftName+'」吗？', '提示', {
			confirmButtonText:'确定', cancelButtonText:'取消', type:'warning'
		}).then(()=>{
			draftApi.remove(row.id).then(()=>{
				this.$message.success('删除成功');
				this.loadList();
			});
		}).catch(()=>{});
	},
	handleSizeChange(val){ this.pageSize = val; this.loadList(); },
	handleCurrentChange(val){ this.currentPage = val; this.loadList(); }
  },
  mounted(){
	this.loadList();
  }
}
</script>
