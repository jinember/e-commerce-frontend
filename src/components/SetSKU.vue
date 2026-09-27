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
					<el-steps :space="200" :active="2" finish-status="success">
					  <el-step title="基本信息"></el-step>
					  <el-step title="规格参数"></el-step>
					  <el-step title="销售属性"></el-step>
					  <el-step title="SKU设置"></el-step>
					  <el-step title="保存完成"></el-step>
					</el-steps>
				</el-col>
			</el-row>
            <!-- 【2.1】步骤条【END】 -->

			<!-- 【2.2】商品详情表单【START】 -->			
			<el-row :gutter="20" style="margin-top:20px;">
			
				<el-col :span="20">
					<el-form :model="attrForm" ref="attrFormRef" 
					    label-width="120px" :rules="attrFormRules">
						
						<el-form-item v-for="(item, index) in attrForm.list"
							style="width:650px"
							:key="index" :label="item.attrName">
							<el-select
								v-if="item.valueType==1"
								v-model="item.attrValue"
								key="single"
								filterable
								allow-create
								style="width:550px"
								default-first-option>
							</el-select>
							<el-select
								v-else
								v-model="item.valueArr"
								key="multi"
								multiple
								filterable
								clearable
								allow-create
								style="width:550px"
								default-first-option>
							</el-select>
						</el-form-item>

					  <el-form-item label-width="0px">
						<span>
							<el-button type="primary"
								style="margin-left:120px;"
								@click="gotoPre" >
								上一步
							</el-button>
							<el-button type="primary" :disabled="disableSave"
								style="margin-left:10px;"
								@click="saveGoodsSaleData">
								下一步:设置SKU
							</el-button>
						</span>
					  </el-form-item>					  
					</el-form>
				</el-col>
			</el-row>

		</el-card>
    </div>
</template>

<script>
/* 1.导入相关 api. */
import { listByCategory } from '@/api/pms_goodsAttr.js'
import { pickForm } from '@/utils/common.js'
import { saveGoodsAttrValues } from '@/api/pms_publish.js'

export default {
  name: 'SetGoodsAttr',
  data(){
     return {
		categoryId:'',
		attrType:2,    /* 定死属性类型是规格参数. */
		attrList: [],
		attrForm:{
			list:[],
		},
		limit: 0,
		disableSave:false,
		attrFormRules:{
		
		}
     }
  },  /* 【*】data 区 */
  
  /* 【方法区】【START】 */
  methods:{  
	/* 【M1】待定【TODO】*/
	method0( arr ){
		
	},

	loadAttrList(){
        this.categoryId = this.$route.params.categoryId;
			console.log("【系统】类别ID:"+ this.categoryId);
			listByCategory( this.categoryId, this.attrType )
			.then(
				(resp)=>{
					let list = resp.data;
					list.forEach(
						o=>{
							if(o.valueType==2){
								o.valueArr = o.attrValue.split(/[,;，；]/);  /* 兼容逗号/分号/中文逗号/中文分号 */
							}
						}
					);
					this.attrForm.list = [...list];
				});
    },
	/*【M2】上一步：返回基本信息页 */
	gotoPre(){
		this.$router.push({ name: 'setGoodsAttr', query:{ from:'setGoodsSale' } });
	},
	
	/* 【M3】待定【TODO】*/
	saveGoodsSaleData(){	
			const list = this.attrForm.list.map(
				item =>{
					let obj = {
						attrId: item.id,
						valueType: item.valueType
					};
					obj.attrValue = (item.valueType==1)
						? item.attrValue
						: item.valueArr.join(",");
					return obj;
				});
			let _pubKey = window.localStorage.getItem("pubKey");
			let data = {
				pubKey:_pubKey,
				attrList:list
			};
			saveGoodsSaleValues( data )
			.then(
				resp=>{
					console.log( resp );
					let pubKey = resp.pubKey;
					let _categoryId = this.categoryId;
					console.log("【系统】categoryId:"+_categoryId);
					/* 2.实现跳转到下一页，并传参数。*/
					this.$router.push({
						name: 'setGoodsSale',
						params:{ categoryId: _categoryId }
					});
				}
			);
	},
	gotoNext(){
		/* 这里预留一个跳转下一页测试键. */
		
	}
  },  /*【METHODS】【END】 */

  /*【1】【生命周期】【mounted】 */
  mounted(){
			this.loadAttrList();
  },  
  
  /*【2】【生命周期】【created】 */
  created(){
	 /* --请填入代码(14)--  */
  }
}
</script>

<style scoped>
.el-button span { color:white; }
.el-card .el-dialog__body{ padding-top:0px; }
</style>