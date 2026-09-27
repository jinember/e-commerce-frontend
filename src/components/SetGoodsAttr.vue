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
					<el-steps :space="200" :active="1" finish-status="success">
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
							<el-button type="warning"
								style="margin-left:10px;"
								@click="saveDraft">
								保存草稿
							</el-button>
							<el-button type="primary" :disabled="disableSave"
								style="margin-left:10px;"
								@click="saveGoodsAttrData">
								下一步:设置销售属性
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
import { saveGoodsAttrValues, getGoodsAttrValues } from '@/api/pms_publish.js'
import * as draftApi from '@/api/pms_goodsDraft.js'
import GoodsDraftPanel from './GoodsDraftPanel.vue'

export default {
  name: 'SetGoodsAttr',
  components: { GoodsDraftPanel },
  data(){
     return {
		categoryId:'',
		attrType:1,    /* 定死属性类型是规格参数. */
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
	/* 组装当前规格参数列表（保存草稿、下一步共用）。 */
	buildAttrList(){
		return this.attrForm.list.map(
			item =>{
				let obj = {
					attrId: item.id,
					attrName: item.attrName,
					valueType: item.valueType
				};
				obj.attrValue = (item.valueType==1)
					? item.attrValue
					: (item.valueArr||[]).join(",");
				return obj;
			});
	},

	/*【保存草稿】先把当前规格参数写入Redis，再拍快照存草稿表(step=2)。 */
	saveDraft(){
		let _pubKey = window.localStorage.getItem("pubKey");
		if( !_pubKey ){
			this.$message.warning('未找到发布凭证，请先回到第一步填写基本信息');
			return;
		}
		saveGoodsAttrValues({ pubKey:_pubKey, attrList:this.buildAttrList() })
		.then(
			()=>{
				draftApi.saveFromCache({ pubKey:_pubKey, draftName:'', step:2 })
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
							if(o.valueType==2){
								o.valueArr = o.attrValue.split(/[,;，；]/);  /* 兼容逗号/分号/中文逗号/中文分号 */
							}
						}
					);
					this.attrForm.list = [...list];
				});
    },
	/*【M2】上一步：返回基本信息页(先保存当前规格参数,避免回退再进入时丢失) */
	gotoPre(){
		let data = {
			pubKey: window.localStorage.getItem("pubKey"),
			attrList: this.buildAttrList()
		};
		saveGoodsAttrValues( data )
		.then(
			resp=>{
				this.$router.push({ name: 'publishBaseInfo', query:{ from:'setGoodsAttr' } });
			});
	},

	/* 下一步：保存规格参数并跳到销售属性页 */
	saveGoodsAttrData(){
			let _pubKey = window.localStorage.getItem("pubKey");
			let data = {
				pubKey:_pubKey,
				attrList:this.buildAttrList()
			};
			saveGoodsAttrValues( data )
			.then(
				resp=>{
					console.log( resp );
					let pubKey = resp.pubKey;
					let _categoryId = this.categoryId;
					console.log("【系统】categoryId:"+_categoryId);
					/* 实现跳转到下一页，并传参数。*/
					this.$router.push({
						name: 'setGoodsSale',
						params:{ categoryId: _categoryId }
					});
				}
			);
	},
	/*【M4】回显：从销售属性页返回时恢复已保存的规格参数*/
	restoreForm(){
		let _pubKey = window.localStorage.getItem("pubKey");
		if( !_pubKey ){ this.loadAttrList(); return; }
		listByCategory( this.categoryId, this.attrType )
		.then(
			resp=>{
				let list = resp.data;
				list.forEach(
					o=>{
						if(o.valueType==2){
							o.valueArr = o.attrValue ? o.attrValue.split(/[,;，；]/) : [];
						}
					}
				);
				getGoodsAttrValues( _pubKey )
				.then(
					r=>{
						let savedList = r.attrList || [];
						list.forEach(
							item=>{
								let saved = savedList.find( s=> s.attrId === item.id );
								if( saved ){
									if( item.valueType==1 ){
										item.attrValue = saved.attrValue;
									}else{
										item.valueArr = (saved.attrValue||"").split(/[,;，；]/);
									}
								}
							}
						);
						this.attrForm.list = [...list];
					});
			});
	}
  },  /*【METHODS】【END】 */

  /*【1】【生命周期】【mounted】 */
  mounted(){
        this.categoryId = this.$route.params.categoryId;
        if( !this.categoryId ){
            this.$message.warning('缺少类别ID，请从"发布商品→基本信息"重新进入');
            return;
        }
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
