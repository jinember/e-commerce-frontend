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
					<el-steps :space="200" :active="3" finish-status="success">
					  <el-step title="基本信息"></el-step>
					  <el-step title="规格参数"></el-step>
					  <el-step title="销售属性"></el-step>
					  <el-step title="SKU设置"></el-step>
					  <el-step title="保存完成"></el-step>
					</el-steps>
				</el-col>
			</el-row>
            <!-- 【2.1】步骤条【END】 -->

			<!-- 【2.3】属性组合表格【START】 -->
			<el-row style="margin-top:15px;">
				<el-table :data="skuList" border height="450" style="width:100%;">
					<el-table-column width="55" label="选择" align="center">
						<template slot-scope="scope">
							<el-checkbox v-model="scope.row.selected"></el-checkbox>
						</template>
					</el-table-column>
					<el-table-column
						v-for="(item, idx) in attrDefs"
						:key="idx"
						:label="item.attrName"
						width="130" align="center">
						<template slot-scope="scope">
							{{ getAttrValue( scope.row, item.id ) }}
						</template>
					</el-table-column>
					<el-table-column label="商品名称" width="220">
						<template slot-scope="scope">
							<el-input v-model="scope.row.skuName" size="small"></el-input>
						</template>
					</el-table-column>
					<el-table-column label="标题" width="220">
						<template slot-scope="scope">
							<el-input v-model="scope.row.skuTitle" size="small"></el-input>
						</template>
					</el-table-column>
					<el-table-column label="副标题" width="220">
						<template slot-scope="scope">
							<el-input v-model="scope.row.skuSubtitle" size="small"></el-input>
						</template>
					</el-table-column>
					<el-table-column label="价格" width="180" align="center">
						<template slot-scope="scope">
							<el-input-number v-model="scope.row.price" :min="0" :precision="2" size="small"></el-input-number>
						</template>
					</el-table-column>
					<!-- 展开列：点击箭头展开该行图集选图(教程效果) -->
					<el-table-column type="expand" width="60" align="center">
						<template slot-scope="scope">
							<div style="padding-left:40px;">
							<!-- 设置图片 -->
							<span style="font-weight:600;">设置图片</span>
							<div v-if="albumImages.length > 0"
								style="display:flex;flex-wrap:wrap;align-items:center;margin-top:8px;">
								<div v-for="(img, ii) in albumImages"
									:key="ii"
									style="margin:5px;text-align:center;">
									<img :src="showImgUrl(img)"
										style="width:64px;height:64px;border:1px solid #E4E7ED;border-radius:4px;object-fit:cover;" />
									<div>
										<el-checkbox v-model="scope.row.selectedImages" :label="img">选用</el-checkbox>
									</div>
									<div>
										<el-radio v-model="scope.row.defaultImage" :label="img"
											:disabled="!(scope.row.selectedImages || []).includes(img)">设为默认</el-radio>
									</div>
								</div>
							</div>
							<div v-else style="color:#909399;margin-top:8px;">暂无图集，请在第一页上传商品图集</div>
							<!-- 优惠设置(全局共用一份, 每个展开行都显示) -->
							<el-form label-width="100px" label-position="left" style="margin-top:10px;">
									<el-form-item label="设置折扣">
										<span>满</span>
										<el-input-number v-model="scope.row.discountForm.fullCount" :min="0" size="small" style="width:90px;"></el-input-number>
										<span>件打</span>
										<el-input-number v-model="scope.row.discountForm.discount" :min="0" :max="10" :step="0.01" :precision="2" size="small" style="width:110px;"></el-input-number>
										<span>折</span>
										<el-checkbox v-model="scope.row.discountForm.stackable" style="margin-left:10px;">可叠加优惠</el-checkbox>
									</el-form-item>
									<el-form-item label="设置满减">
										<span>满</span>
										<el-input-number v-model="scope.row.discountForm.fullAmount" :min="0" size="small" style="width:110px;"></el-input-number>
										<span>元减</span>
										<el-input-number v-model="scope.row.discountForm.minusAmount" :min="0" size="small" style="width:110px;"></el-input-number>
										<span>元</span>
										<el-checkbox v-model="scope.row.discountForm.fullMinusStackable" style="margin-left:10px;">可叠加优惠</el-checkbox>
									</el-form-item>
									<el-form-item label="设置会员价">
										<div>
											<div style="margin-bottom:10px;">
												<span style="display:inline-block;width:90px;">黄金会员</span>
												<el-input-number v-model="scope.row.discountForm.memberGold" :min="0" :precision="2" size="small" style="width:110px;"></el-input-number>
											</div>
											<div>
												<span style="display:inline-block;width:90px;">钻石会员</span>
												<el-input-number v-model="scope.row.discountForm.memberDiamond" :min="0" :precision="2" size="small" style="width:110px;"></el-input-number>
												
											</div>
										</div>
									</el-form-item>
								</el-form>
						</div>
						</template>
					</el-table-column>
				</el-table>
			</el-row>
            <!-- 【2.3】属性组合表格【END】 -->

			
			
			<!-- 【2.6】操作按钮【START】 -->
			<el-row style="margin-top:30px;">
				<el-button type="primary"
					style="margin-left:120px;"
					@click="gotoPre" >
					上一步
				</el-button>
				<el-button type="info"
					style="margin-left:10px;"
					@click="saveDraft">
					保存草稿
				</el-button>
				<el-button type="success"
					style="margin-left:10px;"
					@click="publishGoods">
					立即发布
				</el-button>
			</el-row>
            <!-- 【2.6】操作按钮【END】 -->

		</el-card>
    </div>
</template>

<script>
/* 1.导入相关 api. */
import { listByCategory } from '@/api/pms_goodsAttr.js'
import { getPublishBase, getGoodsSaleAttrValues, saveSkuInfo, getSkuInfo, publishGoods } from '@/api/pms_publish.js'
import * as draftApi from '@/api/pms_goodsDraft.js'
import GoodsDraftPanel from './GoodsDraftPanel.vue'

export default {
  name: 'SetGoodsSku',
  components: { GoodsDraftPanel },
  data(){
     return {
		categoryId:'',
		attrType:2,          /* 定死属性类型是销售属性. */
		pubKey:'',
		attrDefs:[],         /* 销售属性定义(来自 tbl_goods_attr). */
		skuList:[],          /* 组合行. */
		albumImages:[],      /* 第一页上传的图集. */
		activeTab: 'publish'
     }
  },  /* 【*】data 区 */

  /* 【方法区】【START】 */
  methods:{
	/* 草稿继续编辑：跳回第一步，由第一步 mounted 检测 from=draft 回显 */
	onResumeDraft(){
		this.$router.push({ name:'publishBaseInfo', query:{ from:'draft' } });
	},

	/*【M1】上一步：返回销售属性页(先保存当前SKU,避免回退再进入时丢失)*/
	gotoPre(){
		/* 2.保存SKU到Redis缓存。 */
		this.skuList.forEach(
			line=>{
				line.images = (line.selectedImages || []).join(";");
			});
		let data = {
			pubKey: this.pubKey,
			skuList: this.skuList
		};
		saveSkuInfo( data )
		.then(
			()=>{
				this.$router.push({
					name: 'setGoodsSale',
					params:{ categoryId: this.categoryId },
					query:{ from:'setGoodsSku' }
				});
			});
	},

	/*【M2】加载销售属性定义 + 勾选值，并生成组合*/
	loadAttrList(){
		this.pubKey = window.localStorage.getItem("pubKey");
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
				this.attrDefs = [...list];
				/* 2.读取上一页勾选的销售属性值。 */
				if( this.pubKey ){
					getGoodsSaleAttrValues( this.pubKey )
					.then(
						r=>{
							let savedList = r.attrList || [];
							this.attrDefs.forEach(
								item=>{
									let saved = savedList.find( s=> s.attrId === item.id );
									if( saved && saved.attrValue ){
										item.valueArr = saved.attrValue.split(/[,;，；]/);
									}
								}
							);
							this.buildSkuList();
							this.loadAlbum();
						});
				}else{
					this.buildSkuList();
				}
			});
	},

	/*【M3】笛卡尔积：根据勾选的销售属性生成所有组合*/
	buildSkuList(){
		let groups = [];
		this.attrDefs.forEach(
			attr=>{
				if( attr.valueArr && attr.valueArr.length > 0 ){
					groups.push(
						attr.valueArr.map(
							v=> ({ attrId:attr.id, attrName:attr.attrName, attrValue:v })
						)
					);
				}
			});
		/* 2.计算笛卡尔积。 */
		let result = [[]];
		groups.forEach(
			group=>{
				let next = [];
				result.forEach(
					row=>{
						group.forEach(
							item=>{
								next.push( row.concat([item]) );
							}
						);
					});
				result = next;
			});
		/* 3.组装行数据。 */
		this.skuList = result.map(
			row=>{
				let name = row.map( x=> x.attrValue ).join(" ");
				return {
					selected:true,
					skuName: name,
					skuTitle: name,
					skuSubtitle:"",
					price: 0,
					attrList: row,
					images:"",
					defaultImage:"",
					selectedImages:[],
					/* 每行独立的折扣/满减/会员价。 */
					discountForm:{
						fullCount:0,
						discount:0,
						stackable:false,
						fullAmount:0,
						minusAmount:0,
						fullMinusStackable:false,
						memberGold:0,
						memberDiamond:0
					}
				};
			});
	},

	/*【M4】读取第一页上传的图集(不是主图)*/
	loadAlbum(){
		getPublishBase( this.pubKey )
		.then(
			resp=>{
				let base = resp.baseInfo;
				if( base && base.spuAlbumVO && base.spuAlbumVO.images ){
					/* 去重: 同一张图重复上传时只保留一份, 避免复选框全选/折叠异常。 */
					this.albumImages = [ ...new Set( base.spuAlbumVO.images ) ];
				}
			});
	},

	/*【M5】拼接图片的显示地址*/
	showImgUrl( name ){
		return `http://localhost:8090/mall-sys/PublishGoods/showImg/album/${name}`;
	},

	/*【M6】取一行中某个属性的值(表格显示用)*/
	getAttrValue( row, attrId ){
		let item = row.attrList.find( x=> x.attrId === attrId );
		return item ? item.attrValue : '';
	},

	/*【M7】保存SKU到 Redis 缓存*/
	saveSkuInfo(){
		this.skuList.forEach(
			line=>{
				line.images = (line.selectedImages || []).join(";");
			});
		let data = {
			pubKey: this.pubKey,
			skuList: this.skuList
		};
		saveSkuInfo( data )
		.then(
			resp=>{
				this.$message.success('SKU 已保存，可继续下一步');
			});
	},

	/*【M8】发布商品：先保存SKU，再写库+清缓存，跳保存完成页*/
	publishGoods(){
		this.$confirm('确定发布该商品吗？', '提示', {
			confirmButtonText:'确定',
			cancelButtonText:'取消',
			type:'warning'
		})
		.then(
			()=>{
				/* 1.先把 SKU 保存到缓存。 */
				this.skuList.forEach(
					line=>{
						line.images = (line.selectedImages || []).join(";");
					});
				let data = {
					pubKey: this.pubKey,
					skuList: this.skuList
				};
				saveSkuInfo( data )
				.then(
					()=>{
						/* 2.发布：写数据库 + 清理Redis。 */
						publishGoods( this.pubKey )
						.then(
							resp=>{
								let spuId = resp.spuId;
								window.localStorage.removeItem("pubKey");
								window.localStorage.removeItem('skuDiscount-' + this.pubKey);
								this.$router.push({
									name: 'setGoodsDone',
									params:{ categoryId: this.categoryId },
									query:{ spuId: spuId }
								});
							});
					});
			})
		.catch(()=>{});
	},

		/*【M9】保存草稿：先把SKU写入Redis，再拍快照存草稿表(step=4)。 */
	saveDraft(){
		let _pubKey = this.pubKey || window.localStorage.getItem("pubKey");
		if( !_pubKey ){
			this.$message.warning('未找到发布凭证，请先回到第一步填写基本信息');
			return;
		}
		this.skuList.forEach(line=>{ line.images = (line.selectedImages || []).join(";"); });
		saveSkuInfo({ pubKey:_pubKey, skuList:this.skuList })
		.then(
			()=>{
				draftApi.saveFromCache({ pubKey:_pubKey, draftName:'', step:4 })
				.then(
					()=>{ this.$message.success('草稿已保存'); }
				);
			}
		);
	},

  },  /*【METHODS】【END】 */

  /*【1】【生命周期】【mounted】 */
  mounted(){
        this.categoryId = this.$route.params.categoryId;
        if( !this.categoryId ){
            this.$message.warning('缺少类别ID，请从"发布商品→基本信息"重新进入');
            return;
        }
        this.pubKey = window.localStorage.getItem("pubKey");
        if( this.pubKey ){
            /* 已保存过 SKU 就回显，否则重新按销售属性生成。 */
            getSkuInfo( this.pubKey )
            .then(
                resp=>{
                    let list = resp.skuList;
                    if( list && list.length ){
                        /* 老数据行可能没有 discountForm, 补默认值。 */
                        list.forEach(
                            line=>{
                                if( !line.discountForm ){
                                    line.discountForm = {
                                        fullCount:0, discount:0, stackable:false,
                                        fullAmount:0, minusAmount:0, fullMinusStackable:false,
                                        memberGold:0, memberDiamond:0
                                    };
                                }
                            });
                        this.skuList = list;
                        this.loadAlbum();
                    }else{
                        this.loadAttrList();
                    }
                })
            .catch(
                ()=>{
                    this.loadAttrList();
                });
        }else{
            this.loadAttrList();
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
</style>
