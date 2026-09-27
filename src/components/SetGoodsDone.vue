<template>
    <div>
		<!-- 【1】面包屑导航条【START】 -->
		<el-breadcrumb separator-class="el-icon-arrow-right" 
			style="height:30px;margin-top:15px;padding-left:15px;">
		  <el-breadcrumb-item :to="{path:'/'}">首页</el-breadcrumb-item>
		  <el-breadcrumb-item>商品维护</el-breadcrumb-item>
		  <el-breadcrumb-item>发布商品</el-breadcrumb-item>
		</el-breadcrumb>
		<!-- 【1】面包屑导航条【END】 -->
		
		<!-- 【2】卡片方块【START】 -->
		<el-card class="box-card">
			<!-- 【2.1】步骤条【START】 -->
			<el-row :gutter="20">
				<el-col :span="20">
					<el-steps :space="200" :active="4" finish-status="success">
					  <el-step title="基本信息"></el-step>
					  <el-step title="规格参数"></el-step>
					  <el-step title="销售属性"></el-step>
					  <el-step title="SKU设置"></el-step>
					  <el-step title="保存完成"></el-step>
					</el-steps>
				</el-col>
			</el-row>
            <!-- 【2.1】步骤条【END】 -->

			<!-- 【2.2】发布成功提示【START】 -->
			<el-row style="margin-top:80px;text-align:center;">
				<div style="font-size:22px;color:#67C23A;font-weight:600;">商品发布成功！</div>
				<div style="color:#909399;margin-top:12px;">
					商品SPU编号：{{ spuId }}
				</div>
			</el-row>
            <!-- 【2.2】发布成功提示【END】 -->

			<!-- 【2.3】操作按钮【START】 -->
			<el-row style="margin-top:40px;text-align:center;">
				<el-button type="primary"
					@click="goHome">
					返回首页
				</el-button>
				<el-button
					@click="republish">
					重新发布商品
				</el-button>
			</el-row>
            <!-- 【2.3】操作按钮【END】 -->

		</el-card>
    </div>
</template>

<script>
export default {
  name: 'SetGoodsDone',
  data(){
     return {
		spuId:''
     }
  },
  methods:{
	/*【M1】返回首页 */
	goHome(){
		this.$router.push({ path:'/' });
	},
	/*【M2】重新发布商品 */
	republish(){
		this.$router.push({ name:'publishBaseInfo' });
	}
  },
  mounted(){
		this.spuId = this.$route.query.spuId || '';
  }
}
</script>

<style scoped>
.el-button span { color:white; }
</style>
