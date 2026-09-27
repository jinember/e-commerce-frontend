<template>
    <div>
		<!-- 【0】TABS|页签【START】 -->
		<el-tabs type="border-card" v-model="activeTab">
		  <el-tab-pane label="发布商品" name="publish">
			 <span slot="label"><i class="el-icon-circle-plus-outline"></i> 发布商品</span>
		  </el-tab-pane>
		  <el-tab-pane label="草稿管理" name="draft">
			  <span slot="label"><i class="el-icon-document"></i> 草稿管理</span>
		  </el-tab-pane>
		</el-tabs>
		<!-- 【0】TABS|页签【END】 -->

		<!-- 草稿管理内容（公共组件，切到本tab时自动加载） -->
		<div v-if="activeTab === 'draft'">
			<goods-draft-panel @resume="onResumeDraft"></goods-draft-panel>
		</div>
<!-- 【2】卡片方块【START】 -->
		<el-card class="box-card" v-if="activeTab === 'publish'">
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
							<div style="display:flex;align-items:center;">
<el-checkbox-group v-model="item.valueArr">
								<el-checkbox
									v-for="(val, vi) in item.optionArr"
									:key="vi"
									:label="val">{{ val }}</el-checkbox>
							</el-checkbox-group>
							<el-button type="text" style="margin-left:10px;" @click="addCustom(item)">+自定义</el-button>
</div>
						</el-form-item>

					  <el-form-item label-width="0px">
						<span>
							<el-button type="primary"
								style="margin-left:120px;"
								@click="gotoPre" >
								上一步
							</el-button>
							<el-button type="warning"
								style="margin-left:10px;"
								@click="saveDraft">
								保存草稿
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
import { saveGoodsSaleValues, getGoodsSaleAttrValues } from '@/api/pms_publish.js'
import * as draftApi from '@/api/pms_goodsDraft.js'
import GoodsDraftPanel from './GoodsDraftPanel.vue'

export default {
  name: 'SetGoodsSale',
  components: { GoodsDraftPanel },
  data(){
     return {
		categoryId:'',
		attrType:2,    /* 定死属性类型是销售属性. */
		attrList: [],
		attrForm:{
			list:[],
		},
		limit: 0,
		disableSave:false,
		attrFormRules:{

		},
		activeTab: 'publish'
     }
  },  /* 【*】data 区 */

  /* 【方法区】【START】 */
  methods:{
	/* 草稿继续编辑：跳回第一步，由第一步 mounted 检测 from=draft 回显 */
	onResumeDraft(){
		this.$router.push({ name:'publishBaseInfo', query:{ from:'draft' } });
	},
	/* 组装当前销售属性列表（保存草稿、上一步、下一步共用）。 */
	buildSaleList(){
		return this.attrForm.list.map(
			item =>{
				let obj = {
					attrId: item.id,
					attrName: item.attrName,
					valueType: item.valueType
				};
				obj.attrValue = (item.valueArr || []).join(",");
				return obj;
			});
	},

	/*【保存草稿】先把当前销售属性写入Redis，再拍快照存草稿表(step=3)。 */
	saveDraft(){
		let _pubKey = window.localStorage.getItem("pubKey");
		if( !_pubKey ){
			this.$message.warning('未找到发布凭证，请先回到第一步填写基本信息');
			return;
		}
		saveGoodsSaleValues({ pubKey:_pubKey, attrList:this.buildSaleList() })
		.then(
			()=>{
				draftApi.saveFromCache({ pubKey:_pubKey, draftName:'', step:3 })
				.then(
					()=>{ this.$message.success('草稿已保存'); }
				);
			}
		);
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
							o.optionArr = o.attrValue ? o.attrValue.split(/[;；]/) : [];
							o.valueArr = [];
						}
					);
					this.attrForm.list = [...list];
				});
	    },
	/*【M2】上一步：返回规格参数页(先保存当前销售属性,避免回退再进入时丢失) */
	gotoPre(){
		let data = {
			pubKey: window.localStorage.getItem("pubKey"),
			attrList: this.buildSaleList()
		};
		saveGoodsSaleValues( data )
		.then(
			resp=>{
				this.$router.push({
					name: 'setGoodsAttr',
					params:{ categoryId: this.categoryId },
					query:{ from: 'setGoodsSale' }
				});
			});
	},

	/* 下一步：保存销售属性并跳到SKU页 */
	saveGoodsSaleData(){
			let _pubKey = window.localStorage.getItem("pubKey");
			let data = {
				pubKey:_pubKey,
				attrList:this.buildSaleList()
			};
			saveGoodsSaleValues( data )
			.then(
				resp=>{
					console.log( resp );
					let pubKey = resp.pubKey;
					let _categoryId = this.categoryId;
					console.log("【系统】categoryId:"+_categoryId);
					/* 实现跳转到下一页，并传参数。*/
					this.$router.push({
						name: 'setGoodsSku',
						params:{ categoryId: _categoryId }
					});
				}
			);
	},
	/*【M4】回显：从SKU页返回时恢复已保存的销售属性*/
	restoreForm(){
		let _pubKey = window.localStorage.getItem("pubKey");
		if( !_pubKey ){ this.loadAttrList(); return; }
		listByCategory( this.categoryId, this.attrType )
		.then(
			resp=>{
				let list = resp.data;
				list.forEach(
					o=>{
						o.optionArr = o.attrValue ? o.attrValue.split(/[;；]/) : [];
						o.valueArr = [];
					}
				);
				getGoodsSaleAttrValues( _pubKey )
				.then(
					r=>{
						let savedList = r.attrList || [];
						list.forEach(
							item=>{
								let saved = savedList.find( s=> s.attrId === item.id );
								if( saved && saved.attrValue ){
									item.valueArr = saved.attrValue.split(/[,;，；]/);
										/* 自定义值(不在标准模板中)回显时补回选项列表 */
										item.valueArr.forEach(
											v=>{
												if( item.optionArr.indexOf(v) === -1 ){
													item.optionArr.push( v );
												}
											});
								}
							}
						);
						this.attrForm.list = [...list];
					});
			});
	},
	/*【M5】自定义：添加模板中没有的属性值，并默认选中*/
	addCustom(item){
		this.$prompt('请输入自定义属性值', '自定义', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			inputPattern: /\S+/,
			inputErrorMessage: '不能为空'
		}).then(({ value }) => {
			let v = value.trim();
			if( item.optionArr.indexOf(v) === -1 ){
				item.optionArr.push( v );
			}
			if( item.valueArr.indexOf(v) === -1 ){
				item.valueArr.push( v );
			}
		}).catch(() => {});
	}
  },  /*【METHODS】【END】 */

  /*【1】【生命周期】【mounted】 */
  mounted(){
        this.categoryId = this.$route.params.categoryId;
        /* 无论从哪进入都先读缓存回显(有缓存就回显,没有则重新加载)。 */
        this.restoreForm();
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
