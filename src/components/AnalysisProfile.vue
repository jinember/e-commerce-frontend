<template>
  <div>
    <el-card shadow="never" style="margin-bottom:12px">
      <div slot="header">
        <span style="font-weight:600">用户画像 · 会员分层与地域分布</span>
        <span style="margin-left:12px;color:#909399;font-size:12px">
          按「会员属性」与「地域」两个维度拆解用户结构，是对四大模块的维度补充
        </span>
      </div>
      <div style="color:#606266;font-size:13px;line-height:1.9">
        上层是<b>会员分层</b>（性别 / 年龄段 / 会员等级 / 消费能力等属性分布），
        下层是<b>地域分布</b>（会员城市、订单城市、成交额的地域集中度）。
        两部分都从 <code>ads_member_profile</code> / <code>ads_region_dist</code> 读取，由离线 ETL 产出。
      </div>
    </el-card>

    <AnalysisMember />
    <AnalysisRegion />
  </div>
</template>

<script>
import AnalysisMember from './AnalysisMember.vue'
import AnalysisRegion from './AnalysisRegion.vue'

export default {
  name: 'AnalysisProfile',
  components: { AnalysisMember, AnalysisRegion }
}
</script>
