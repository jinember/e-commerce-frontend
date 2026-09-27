<template>
    <div>
		<!-- 【0】TABS|页签【START】 -->
		<el-tabs type="border-card" v-model="activeTab">
		  <el-tab-pane name="publish">
			  <span slot="label"><i class="el-icon-circle-plus-outline"></i> 发布商品</span>
		  </el-tab-pane>
		  <el-tab-pane name="draft">
			  <span slot="label"><i class="el-icon-document"></i> 草稿管理</span>
			  <!-- 草稿列表（公共组件，切到本tab时自动加载） -->
				  <goods-draft-panel v-if="activeTab === 'draft'" @resume="onResumeDraft"></goods-draft-panel>
		  </el-tab-pane>
		</el-tabs>
		<!-- 【0】TABS|页签【END】 -->
<!-- 【2】卡片方块【START】 -->
		<el-card class="box-card" v-if="activeTab === 'publish'">
			<!-- 【2.1】步骤条【START】 -->
			<el-row :gutter="20">
				<el-col :span="20">
					<el-steps :space="200" :active="0" finish-status="success">
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
					<el-form :model="spuForm" ref="brandFormRef" 
					    label-width="120px" :rules="spuFormRules">
						
						  <el-form-item label="商品名称:">
							<el-input v-model="spuForm.goodsDetail.goodsName" 
							    style="width:650px;"
								placeholder="商品名称"></el-input>
						  </el-form-item>
							
						  <el-form-item label="商品描述:">
							<el-input v-model="spuForm.goodsDetail.goodsDetails" 
							    style="width:650px;"
								placeholder="商品描述"></el-input>
						  </el-form-item>
							
						  <!-- 【A】所属类别【START】 -->
						  <el-form-item label="所属类别" prop="categoryId">
							<el-cascader
								v-model="spuForm.pIdArr"
								:options="categoryList"
								:props="{label:'categoryName',value:'id'}"
								@change="cascaderChange">
							</el-cascader>
						  </el-form-item>
						  <!-- 【A】所属类别【END】 -->
						  
						  <!-- 【B】选择品牌【START】 -->
						   <el-form-item label="选择品牌:" prop="brandId">
							   <el-select v-model="spuForm.goodsDetail.brandId" 
								 clearable placeholder="请选择品牌">
								 <el-option 
									v-for="(item,index) in brandOptions" 
									key="item.value"
									:label="item.label" :value="item.value">
								 </el-option>
							   </el-select>
						   </el-form-item>
						  <!-- 【B】选择品牌【END】 -->
						   
						  <el-form-item label="商品重量:">
							<el-input v-model="spuForm.goodsDetail.weight" 
							    style="width:250px;"
								placeholder="商品重量"></el-input>
						  </el-form-item>
                      
						  
						  <el-form-item label="积分设置:">
						    <el-col :span="2">
						        积分抵扣:	
						    </el-col>
						    <el-col :span="3">
								<el-input v-model="spuForm.pointRule.allowDeduct" 
									style="width:100px;"
									placeholder="积分抵扣"></el-input>			
						    </el-col>
						    <el-col :span="2">
								返还积分:
							</el-col>
						    <el-col :span="3">					        
								<el-input v-model="spuForm.pointRule.rewardPoint" 
									style="width:100px;"
									placeholder="返还积分"></el-input>				
						    </el-col>
						  </el-form-item>
						  
						  <!-- 【C】商品主图【START】 -->
						  <el-form-item label="商品主图:">
								<el-upload
								  ref="mainUpload"
								  class="avatar-uploader"
								  action=""
								  :show-file-list="false"
								  :on-success="handleSuccess"
								  :before-upload="beforeUpload"
								  :auto-upload="false"
								  :on-change="uploadChange"
								  :http-request="httpRequest">
								  <img v-if="imageUrl" :src="imageUrl" class="avatar" />
								  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
								</el-upload>
						  </el-form-item>
						  <!-- 【C】商品主图【END】 -->
								<!-- 【D】商品图集【START】 -->
								<el-form-item label="商品图集:">
										<el-upload
										  class="avatar-uploader"
										  action=""
										  :show-file-list="false"
										  :before-upload="beforeUpload"
										  :http-request="albumRequest"
										  multiple
										  accept="image/*">
										  <i class="el-icon-plus avatar-uploader-icon"></i>
										</el-upload>
										<div style="display:flex;flex-wrap:wrap;margin-top:10px;">
											<div v-for="(img, idx) in spuForm.spuAlbumVO.images"
												:key="idx"
												style="margin:5px;text-align:center;">
												<img :src="albumImgUrl(img)"
													style="width:80px;height:80px;border:1px solid #E4E7ED;border-radius:4px;object-fit:cover;" />
												<div>
													<el-button type="text" size="mini" @click="removeAlbumImg(idx)">删除</el-button>
												</div>
											</div>
										</div>
									</el-form-item>
								<!-- 【D】商品图集【END】 -->
							  
							  <!-- 【E】售后保障【START】 -->
							  <el-form-item label="售后保障:">
							    <el-checkbox v-model="spuForm.goodsDetail.afterSale">7天无理由退换</el-checkbox>
							    <el-checkbox v-model="spuForm.goodsDetail.freightInsurance">运费险</el-checkbox>
							    <el-checkbox v-model="spuForm.goodsDetail.fakeCompensation">假一赔十</el-checkbox>
							  </el-form-item>
							  <!-- 【E】售后保障【END】 -->
						</el-form>
					
						<span>
							<el-button type="primary"
								style="margin-left:120px;"
								@click="resetForm">
								重置表单
							</el-button>
							<el-button type="primary" :disabled="disableSave"
								style="margin-left:10px;"
								@click="savePublishData">
								下一步:设置规格参数
							</el-button>
						</span>				
					
					</el-col>
				</el-row>

			</el-card>
    </div>
</template>

<script>
/* 1.导入相关 api. */
import { getCategoryList, getPids } from '@/api/pms_category.js'
import { getBrandOptions } from '@/api/pms_brand.js'
import { pickForm } from '@/utils/common.js'
import { uploadImage, savePublishBase, getPublishBase } from '@/api/pms_publish.js'
import GoodsDraftPanel from './GoodsDraftPanel.vue'

export default {
  name: 'PublishBaseInfo',
  components: { GoodsDraftPanel },
  data(){
     return {
			activeTab: 'publish',
			//1.三级列表的绑定项
			categoryList:[],
			//2.品牌选项数据
			brandOptions:[],
			//3.图片地址
			imageUrl:'',
			//4.禁止保存.[true:不能保存]
			disableSave:true,
			//5.商品基本信息表单
			spuForm:{
				//1.商品基本信息
				goodsDetail:{
					goodsName:"",
					goodsDetails:"",
					weight:0,
					mainImage:"",
					categoryId:"",
					brandId:"",
					afterSale:false,
					freightInsurance:false,
					fakeCompensation:false,
					timingPublish:false,
					publishTime:''
				},
				//2.商品图集
				spuAlbumVO:{
					images:[],
				},
				//3.积分规则设置
				pointRule:{
					rewardPoint:150,//返还点数（积分）
					allowDeduct:100,//允许扣除
					work:''
				},
				pIdArr:[]
			},
			//6.表单的验证
			spuFormRules:{
			//这里后面要填代码
			},

     }
  },
  
  /* 【方法区】【START】 */
  methods:{  
	/* 草稿继续编辑：本就在第一步，切回发布表单并回显 */
	onResumeDraft(){
		this.activeTab = 'publish';
		this.$nextTick(()=>{ this.restoreForm(); });
	},
	/* 【M1】多级菜单改变【TODO】*/
	/* --请填入代码-- */
	cascaderChange(arr){
		if(arr && arr.length > 0){
			let categoryId = arr[arr.length - 1];
			this.spuForm.goodsDetail.categoryId = categoryId;
			//更换类别后，清空品牌
			this.spuForm.goodsDetail.brandId = "";
			getBrandOptions(categoryId)
			.then(
				resp=>{
					this.brandOptions = resp.data;
				}
			);
		}
		else{
			this.spuForm.goodsDetail.categoryId = "";
			this.brandOptions = [];
		}
	},
	
	/* 【M2】文件上传相关 */
	handleSuccess(res, file) { },

	uploadChange( file ){
		this.$refs.mainUpload.submit();
	},

	beforeUpload( file ){
		/* 1.计算文件的大小。*/
		let size = file.size / 1024 / 1024;
		/* 2.校验文件大小。*/
		if( size>2 ){
			this.$message("【提示】上传的文件不能 2 MB.");
			return false;
		}
		return true;
	},

	httpRequest( param ){
		/* 1.创建表单对象。*/
		let FD = new FormData();
		FD.append("file", param.file);
		/* 2.这里指定我上传的是主图 */
		FD.append("type", 1);
		let BASE = "http://localhost:8090/mall-sys";
		/* 2.调用 api 方法执行上传。*/
		uploadImage( FD )
		.then(
			resp=>{
				/* 1.通知 el-upload：这个文件已经传完了，别再重复传 */
				param.onSuccess( resp );
				let fileName = resp.fileName;
				let logoUri = resp.logoUri;
				this.$message("图片上传成功。");
				/* 1.把提交锁定开关关闭【false不锁定】.*/
				this.disableSave = false;
				/* 2.把文件名保存到 brand 表单。*/
				this.imageUrl = BASE + logoUri;
				this.spuForm.goodsDetail.mainImage = resp.fileName;
			}
		);
	},
	
		/*【M5】上传商品图集（type=2 -> album 目录）*/
		albumRequest( param ){
			/* 多图并发上传时返回顺序不定, 会导致图集顺序与选择顺序不一致。
			   这里改用串行队列: 按选择顺序一张一张传。 */
			this._albumQueue = this._albumQueue || [];
			this._albumQueue.push( param );
			if( !this._albumUploading ){
				this._nextAlbumUpload();
			}
		},

		/*【M5.1】串行上传队列: 每次只传一张, 传完再传下一张*/
		_nextAlbumUpload(){
			if( !this._albumQueue || this._albumQueue.length === 0 ){
				this._albumUploading = false;
				return;
			}
			this._albumUploading = true;
			let param = this._albumQueue.shift();
			let FD = new FormData();
			FD.append("file", param.file);
			FD.append("type", 2);
			uploadImage( FD )
			.then(
				resp=>{
					param.onSuccess( resp );
					this.spuForm.spuAlbumVO.images.push( resp.fileName );
					this.$message.success("图集上传成功。");
					this._nextAlbumUpload();
				})
			.catch(
				()=>{
					/* 单张失败不阻塞队列, 继续传下一张。 */
					this._nextAlbumUpload();
				});
		},

		/*【M6】拼接图集图片的显示地址*/
		albumImgUrl( name ){
			return "http://localhost:8090/mall-sys/PublishGoods/showImg/album/" + name;
		},

		/*【M7】删除图集某一张*/
		removeAlbumImg( idx ){
			this.spuForm.spuAlbumVO.images.splice( idx, 1 );
		},

	/*【M2】重置表单*/
	resetForm(){
		// 1. 清空商品基本信息
		this.spuForm.goodsDetail.goodsName = "";
		this.spuForm.goodsDetail.goodsDetails = "";
		this.spuForm.goodsDetail.weight = 0;
		this.spuForm.goodsDetail.brandId = "";
		this.spuForm.goodsDetail.categoryId = "";
		this.spuForm.goodsDetail.mainImage = "";
		this.spuForm.goodsDetail.afterSale = false;
		this.spuForm.goodsDetail.freightInsurance = false;
		this.spuForm.goodsDetail.fakeCompensation = false;
		this.spuForm.goodsDetail.timingPublish = false;
		this.spuForm.goodsDetail.publishTime = '';
		this.spuForm.spuAlbumVO.images = [];

		// 2. 清空级联选择的数组
		this.spuForm.pIdArr = [];

		// 3. 积分恢复初始值（和 data 里定义的一致）
		this.spuForm.pointRule.rewardPoint = 150;
		this.spuForm.pointRule.allowDeduct = 100;

		// 4. 清空品牌选项和图片预览
		this.brandOptions = [];
		this.imageUrl = "";

		// 5. 恢复"禁止保存"锁定（因为主图被清掉了）
		this.disableSave = true;

		// 6. 清空上传组件的文件列表（如果有）
		if (this.$refs.mainUpload) {
			this.$refs.mainUpload.clearFiles();
		}
	},

	savePublishData(){
		/* 已有 pubKey 说明是流程中返回修改, 沿用旧钥匙, 避免后续缓存全丢。 */
		let oldPubKey = window.localStorage.getItem("pubKey");
		let form = JSON.parse( JSON.stringify( this.spuForm ) );
		if( oldPubKey ){ form.pubKey = oldPubKey; }
		savePublishBase( form )
		.then(
			resp=>{
				let pubKey = oldPubKey || resp.pubKey;
				/* 1.把 pubKey 保存到浏览器本地。*/
				window.localStorage.setItem("pubKey", pubKey);
				console.log("【系统】pubKey:"+ pubKey);
				let _categoryId = form.goodsDetail.categoryId;
				console.log("【系统】categoryId:"+_categoryId);
				/* 2.实现跳转到第二页，并传参数。*/
				this.$router.push({
					name: 'setGoodsAttr',
					params:{ categoryId: _categoryId }
				});
			}
		);
	},

	/*【M3】缓存回显: 从 Redis 恢复上次已保存的基本信息 */
	restoreForm(){
		/* 1.从浏览器本地存储取出 pubKey(发布流程的唯一凭证) */
		let pubKey = window.localStorage.getItem("pubKey");
		/* 2.第一次进发布页没有 pubKey, 说明没保存过, 直接返回 */
		if( !pubKey ){ return; }
		/* 3.调后端接口, 按 pubKey 从 Redis 读出基本信息 */
		getPublishBase( pubKey )
		.then(
			resp=>{
				let bi = resp.baseInfo;
				/* 4.缓存不存在(比如 Redis 重启被清空), 直接返回 */
				if( !bi ){ return; }
				/* 5.回填商品基本信息 */
				this.spuForm.goodsDetail = bi.goodsDetail;
				/* 6.回填积分规则 */
				this.spuForm.pointRule = bi.pointRule;
				/* 6.1 回填商品图集 */
				this.spuForm.spuAlbumVO = bi.spuAlbumVO;
				/* 7.回显主图 */
				let BASE = "http://localhost:8090/mall-sys";
				if( bi.goodsDetail && bi.goodsDetail.mainImage ){
					this.imageUrl = BASE + "/PublishGoods/showImg/goods/" + bi.goodsDetail.mainImage;
				}
				/* 8.解除"下一步"按钮锁定 */
				this.disableSave = false;
				/* 9.回显类别级联框 */
				let cid = bi.goodsDetail.categoryId;
				if( cid ){
					getPids( cid )
					.then(
						r=>{
							this.spuForm.pIdArr = r.data;
						}
					);
					/* 10.按类别重新加载品牌下拉选项 */
					getBrandOptions( cid )
					.then(
						r=>{
							this.brandOptions = r.data;
						}
					);
				}
			}
		);
	},
  },  /*【METHODS】【END】 */

  /*【1】【生命周期】【mounted】 */
  mounted(){
	 /* --请填入代码 D. -- */
	 getCategoryList()
	 .then(
		resp=>{
			this.categoryList = resp.data;
		}
	 );
	 /* 从第二步返回、或从草稿"继续编辑"跳回时，都恢复基本信息 */
		 if( this.$route.query.from === 'setGoodsAttr' || this.$route.query.from === 'draft' ){
			this.restoreForm();
		 }
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

.avatar-uploader .el-upload {
	border: 1px dashed #d9d9d9;
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
}
.avatar-uploader .el-upload:hover {
	border-color: #409EFF;
}
.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 105px;
	height: 105px;
	line-height: 105px;
	text-align: center;
	border:2px dashed #CCC;
	border-radius:5px;
}
.avatar {
	width: 105px;
	height: 105px;
	display: block;
}
</style>
