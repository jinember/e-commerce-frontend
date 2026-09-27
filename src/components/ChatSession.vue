<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-headset"></i>客服会话</span>
      </el-tab-pane>
    </el-tabs>

    <!-- 会话明细 -->
    <el-card class="box-card" style="margin-top:10px;">
      <div slot="header" style="display:flex;align-items:center;justify-content:space-between;">
        <span>会话明细</span>
        <el-radio-group v-model="mode" size="small" @change="load(1)">
          <el-radio-button label="all">全部会话</el-radio-button>
          <el-radio-button label="pending">待回复（{{ pending }}）</el-radio-button>
        </el-radio-group>
      </div>
      <!-- 检索区 -->
      <el-form inline size="small" style="margin-bottom:12px;" @submit.native.prevent>
        <el-form-item label="会话编号">
          <el-input v-model.trim="query.chatNo" placeholder="如 CS1790…" clearable style="width:150px;"></el-input>
        </el-form-item>
        <el-form-item label="会员">
          <el-input v-model.trim="query.nickname" placeholder="会员昵称" clearable style="width:130px;"></el-input>
        </el-form-item>
        <el-form-item label="咨询类型">
          <el-select v-model="query.chatType" placeholder="全部" clearable style="width:130px;">
            <el-option v-for="t in chatTypes" :key="t" :label="t" :value="t"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="load(1)">查询</el-button>
          <el-button icon="el-icon-refresh-left" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" border height="430" style="width:100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="chatNo" label="会话编号" width="148"></el-table-column>
        <el-table-column prop="nickname" label="会员" width="100"></el-table-column>
        <el-table-column prop="chatType" label="咨询类型" width="95"></el-table-column>
        <el-table-column prop="userMsgCount" label="会员发言" width="85"></el-table-column>
        <el-table-column prop="merchantReplyCount" label="商家回复" width="85"></el-table-column>
        <el-table-column prop="botReplyCount" label="智能应答" width="85"></el-table-column>
        <el-table-column prop="staffName" label="处理人" width="95">
          <template slot-scope="s">
            <span v-if="s.row.staffName">{{ s.row.staffName }}</span>
            <span v-else style="color:#C0C4CC;">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="firstResponseSec" label="首响(秒)" width="85"></el-table-column>
        <el-table-column prop="sessionDurationSec" label="时长(秒)" width="85"></el-table-column>
        <el-table-column label="是否转化" width="90">
          <template slot-scope="s">
            <el-tag size="mini" :type="s.row.isConverted==1?'success':'info'">
              {{ s.row.isConverted==1 ? (s.row.convertAction||'已转化') : '未转化' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" min-width="150"></el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template slot-scope="s">
            <el-button size="mini" type="primary" @click="openChat(s.row)">查看对话</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background style="margin-top:15px;text-align:left" @current-change="load"
                     :current-page="page" :page-size="limit" :total="total"
                     layout="prev, pager, next"></el-pagination>
    </el-card>

    <!-- 查看对话 / 人工客服回复 -->
    <el-drawer :title="drawerTitle" :visible.sync="drawer" size="560px" @open="scrollBottom">
      <div class="cv-wrap">
        <div class="cv-meta">
          <span>会员：{{ cur.nickname || cur.memberId }}</span>
          <span>类型：{{ cur.chatType }}</span>
          <span>处理人：{{ cur.staffName || '未分配' }}</span>
        </div>
        <div class="cv-meta">
          <span>会员 {{ cur.userMsgCount || 0 }} 条</span>
          <span>商家回复 {{ cur.merchantReplyCount || 0 }} 条</span>
          <span>智能应答 {{ cur.botReplyCount || 0 }} 条</span>
          <span>人工首响 {{ cur.firstResponseSec || 0 }} 秒 · 时长 {{ cur.sessionDurationSec || 0 }} 秒</span>
        </div>
        <div class="cv-body" ref="cvBody">
          <div v-if="!msgs.length" class="cv-empty">该会话暂无对话明细</div>
          <div v-for="(m,i) in msgs" :key="i" class="cv-row" :class="'r-' + m.sender">
            <div class="cv-who" :class="'w-' + m.sender">{{ senderName(m) }}</div>
            <div class="cv-main">
              <div class="cv-bubble" :class="'b-' + m.sender">{{ m.content }}</div>
              <div class="cv-time">{{ m.sendTime }}</div>
            </div>
          </div>
        </div>
        <div class="cv-foot">
          <el-input v-model="replyText" size="small" placeholder="以人工客服身份回复会员…" @keyup.enter.native="sendReply"></el-input>
          <el-button size="small" type="primary" @click="sendReply">回复</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { list, messages, reply, pendingList, pendingCount } from '@/api/pms_chatSession.js'

export default {
  data() {
    return {
      list: [], total: 0, page: 1, limit: 10,
      mode: 'all', pending: 0,
      query: { chatNo: '', nickname: '', chatType: '' },
      chatTypes: ['商品咨询', '物流查询', '退换货', '售后服务', '优惠咨询', '投诉建议', '其他'],
      drawer: false, cur: {}, msgs: [], replyText: ''
    }
  },
  computed: {
    drawerTitle() {
      return '会话对话 · ' + (this.cur.chatNo || '')
    }
  },
  created() {
    this.load(1)
    this.loadPendingCount()
  },
  methods: {
    /* 全部会话 / 待回复 两种视图 */
    load(p) {
      if (p) this.page = p
      const req = this.mode === 'pending'
        ? pendingList(this.page, this.limit)
        : list(this.page, this.limit, this.query)
      req.then(r => {
        this.list = r.data || []
        this.total = r.total || 0
      })
    },
    resetQuery() {
      this.query = { chatNo: '', nickname: '', chatType: '' }
      this.load(1)
    },
    loadPendingCount() {
      pendingCount().then(r => {
        this.pending = (r.data && r.data.count) || r.count || 0
      })
    },
    /* 发言方显示名 */
    senderName(m) {
      if (m.sender === 'user') return '会员'
      if (m.sender === 'bot') return '智能客服'
      return '人工客服' + (m.staffName ? ' · ' + m.staffName : '')
    },
    /* 查看对话 */
    openChat(row) {
      this.cur = row
      this.msgs = []
      this.replyText = ''
      this.drawer = true
      messages(row.id).then(r => {
        const d = r.data || {}
        this.msgs = d.rows || []
        if (d.session) this.cur = d.session
        this.scrollBottom()
      })
    },
    /* 以人工客服身份回复（后端记录处理人 = 当前登录账号） */
    sendReply() {
      const txt = (this.replyText || '').trim()
      if (!txt) return
      reply({ sessionId: this.cur.id, content: txt }).then(r => {
        if (!r || r.result === 'failed') {
          this.$message.error((r && r.cause) || '回复失败')
          return
        }
        const d = r.data || {}
        this.msgs = d.rows || this.msgs
        if (d.session) this.cur = d.session
        this.replyText = ''
        this.scrollBottom()
        if (d.staffName) this.$message.success('已由「' + d.staffName + '」回复')
        this.load(this.page)
        this.loadPendingCount()
      })
    },
    scrollBottom() {
      this.$nextTick(() => {
        const el = this.$refs.cvBody
        if (el) el.scrollTop = el.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.cv-wrap { padding: 0 16px 16px; display: flex; flex-direction: column; height: calc(100vh - 90px); }
.cv-meta { font-size: 12px; color: #909399; line-height: 1.9; }
.cv-meta span { display: inline-block; margin-right: 14px; }
.cv-body { flex: 1; overflow-y: auto; background: #f7f8fa; border-radius: 6px; padding: 12px; margin-top: 10px; }
.cv-empty { text-align: center; color: #c0c4cc; font-size: 13px; padding-top: 120px; }
.cv-row { display: flex; gap: 8px; margin-bottom: 12px; }
.cv-row.r-user { flex-direction: row; }
.cv-row.r-bot, .cv-row.r-merchant { flex-direction: row-reverse; }
.cv-who { font-size: 11px; width: 76px; flex: none; text-align: center; padding-top: 5px; color: #909399; }
.cv-who.w-user { color: #409EFF; }
.cv-who.w-bot { color: #909399; }
.cv-who.w-merchant { color: #0F6E56; font-weight: bold; }
.cv-main { max-width: 78%; display: flex; flex-direction: column; }
.cv-row.r-user .cv-main { align-items: flex-start; }
.cv-row.r-bot .cv-main, .cv-row.r-merchant .cv-main { align-items: flex-end; }
.cv-bubble { padding: 8px 12px; border-radius: 8px; font-size: 13px; line-height: 1.6; word-break: break-all; }
.cv-bubble.b-user { background: #409EFF; color: #fff; }
.cv-bubble.b-bot { background: #fff; color: #606266; border: 1px dashed #dcdfe6; }
.cv-bubble.b-merchant { background: #E1F5EE; color: #0F6E56; border: 1px solid #9FE1CB; }
.cv-time { font-size: 11px; color: #c0c4cc; margin-top: 4px; }
.cv-foot { display: flex; gap: 8px; margin-top: 10px; }
</style>
