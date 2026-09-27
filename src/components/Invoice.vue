<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane>
        <span slot="label"><i class="el-icon-tickets"></i>发票管理</span>
      </el-tab-pane>
    </el-tabs>
    <el-card class="box-card" style="margin-top:10px;">
      <el-table :data="list" border height="450" style="width:100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="orderId" label="订单ID" width="80"></el-table-column>
        <el-table-column prop="memberId" label="用户ID" width="80"></el-table-column>
        <el-table-column prop="nickname" label="用户昵称" width="120"></el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="s">
            <el-tag size="mini" :type="s.row.type=='company'?'warning':''">{{ s.row.type=='company'?'企业':'个人' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="发票抬头"></el-table-column>
        <el-table-column prop="taxNo" label="税号"></el-table-column>
        <el-table-column prop="amount" label="金额" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="s">
            <el-tag size="mini" :type="s.row.status=='issued'?'success':'warning'">{{ s.row.status=='issued'?'已开票':'待开票' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="issueDate" label="开票时间" width="160">
          <template slot-scope="s">
            <span>{{ s.row.issueDate ? s.row.issueDate.replace('T',' ').substring(0,16) : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="发票文件" width="130">
          <template slot-scope="s">
            <template v-if="s.row.invoiceFile">
              <el-button type="text" @click="previewFile(s.row.invoiceFile)">预览</el-button>
              <el-button type="text" @click="downloadFile(s.row.invoiceFile)">下载</el-button>
            </template>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="s">
            <el-button v-if="s.row.status!='issued'" type="text" style="color:#67C23A" @click="openIssue(s.row)">开票</el-button>
            <el-button type="text" @click="edit(s.row)">编辑</el-button>
            <el-button type="text" style="color:#F56C6C" @click="del(s.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination background style="margin-top:15px;text-align:left" @current-change="load" :current-page="page" :page-size="limit" :total="total" layout="prev, pager, next"></el-pagination>
    </el-card>

    <!-- 开票弹窗 -->
    <el-dialog title="开具发票" :visible.sync="issueDialog" width="520px" :close-on-click-modal="false">
      <el-form :model="issueForm" :rules="issueRules" ref="issueFormRef" label-width="100px">
        <el-form-item label="订单ID">
          <el-input v-model="issueForm.orderId" disabled></el-input>
        </el-form-item>
        <el-form-item label="开票金额">
          <el-input v-model="issueForm.amount" disabled>
            <template slot="append">元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="发票类型" prop="type">
          <el-radio-group v-model="issueForm.type">
            <el-radio label="personal">个人</el-radio>
            <el-radio label="company">企业</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="issueForm.type=='company'" label="发票抬头" prop="title">
          <el-input v-model="issueForm.title" placeholder="请输入企业名称"></el-input>
        </el-form-item>
        <el-form-item v-if="issueForm.type=='company'" label="税号" prop="taxNo">
          <el-input v-model="issueForm.taxNo" placeholder="请输入纳税人识别号"></el-input>
        </el-form-item>
        <el-form-item v-else label="发票抬头">
          <el-input v-model="issueForm.title" placeholder="个人"></el-input>
        </el-form-item>
        <el-form-item label="发票文件">
          <el-upload
            :show-file-list="false"
            :http-request="uploadInvoiceFile"
            :before-upload="beforePdfUpload"
            accept=".pdf"
            :disabled="uploading">
            <el-button size="small" type="primary" icon="el-icon-upload2" :loading="uploading">上传发票 PDF</el-button>
            <div slot="tip" class="el-upload__tip">只能上传 PDF 格式的发票版式文件</div>
          </el-upload>
          <div v-if="issueForm.invoiceFile" style="margin-top:8px;">
            <el-tag size="small" type="success" closable @close="issueForm.invoiceFile=''">
              <i class="el-icon-document"></i> {{ issueForm.invoiceFile }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="issueDialog=false">取消</el-button>
        <el-button type="primary" :loading="issuing" @click="confirmIssue">确认开票</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="form.id?'编辑':'新增'" :visible.sync="dialog" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="订单ID"><el-input v-model="form.orderId"></el-input></el-form-item>
        <el-form-item label="用户ID"><el-input v-model="form.memberId"></el-input></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="个人" value="personal"></el-option>
            <el-option label="企业" value="company"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="抬头"><el-input v-model="form.title"></el-input></el-form-item>
        <el-form-item label="税号"><el-input v-model="form.taxNo"></el-input></el-form-item>
      </el-form>
      <div slot="footer"><el-button @click="dialog=false">取消</el-button><el-button type="primary" @click="save">确定</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { list, add, del, issue, uploadFile } from '@/api/pms_invoice.js'

const BASE = 'http://localhost:8090/mall-sys';

export default {
  data(){
    return {
      list:[], total:0, page:1, limit:10, dialog:false, form:{},
      // 开票相关
      issueDialog:false, issuing:false, uploading:false,
      issueForm:{ id:null, orderId:null, amount:null, type:'personal', title:'', taxNo:'', invoiceFile:'' },
      issueRules:{
        type:[{ required:true, message:'请选择发票类型', trigger:'change' }],
        title:[{ required:true, message:'请输入发票抬头', trigger:'blur' }],
        taxNo:[{ required:true, message:'请输入税号', trigger:'blur' }]
      }
    }
  },
  created(){ this.load() },
  methods:{
    load(p){ if(p) this.page=p; list(this.page,this.limit,{}).then(r=>{ this.list=r.data||[]; this.total=r.total||0; }) },
    edit(row){ this.form=Object.assign({},row); this.dialog=true; },
    save(){ add(this.form).then(()=>{ this.dialog=false; this.$message.success('保存成功'); this.load(); }) },
    del(id){ this.$confirm('确认删除?','提示',{type:'warning'}).then(()=>{ del(id).then(()=>{ this.$message.success('删除成功'); this.load(); }) }).catch(()=>{}); },

    // 打开开票弹窗
    openIssue(row){
      this.issueForm = {
        id: row.id,
        orderId: row.orderId,
        amount: row.amount,
        type: row.type || 'personal',
        title: (row.type=='company' ? row.title : '') || '',
        taxNo: row.taxNo || '',
        invoiceFile: row.invoiceFile || ''
      };
      this.issueDialog = true;
      this.$nextTick(()=>{ if(this.$refs.issueFormRef){ this.$refs.issueFormRef.clearValidate(); } });
    },
    // 上传前校验 PDF
    beforePdfUpload(file){
      var isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      if (!isPdf){ this.$message.error('只能上传 PDF 文件'); return false; }
      if (file.size > 10 * 1024 * 1024){ this.$message.error('文件大小不能超过 10MB'); return false; }
      return true;
    },
    // 自定义上传（携带登录态）
    uploadInvoiceFile(param){
      var fd = new FormData();
      fd.append('file', param.file);
      this.uploading = true;
      uploadFile(fd).then(r=>{
        this.uploading = false;
        if (r.fileName){
          this.issueForm.invoiceFile = r.fileName;
          this.$message.success('发票文件上传成功');
        } else {
          this.$message.error('上传失败');
        }
      }).catch(()=>{ this.uploading = false; this.$message.error('上传失败'); });
    },
    // 确认开票
    confirmIssue(){
      this.$refs.issueFormRef.validate(valid=>{
        if(!valid) return;
        if(this.issueForm.type=='personal' && !this.issueForm.title){
          this.issueForm.title = '个人';
        }
        this.issuing = true;
        issue(this.issueForm).then(r=>{
          this.issuing = false;
          if(r.result=='success'){
            this.issueDialog = false;
            this.$message.success('发票开具成功');
            this.load();
          } else {
            this.$message.error(r.cause || '开票失败');
          }
        }).catch(()=>{ this.issuing = false; this.$message.error('开票失败，请稍后重试'); });
      });
    },

    // 用 fetch 携带 token 获取 PDF blob，再预览（避免 window.open 不带认证头）
    getPdfBlob(name, withDownload){
      var token = window.sessionStorage.getItem('adminToken');
      var url = BASE + '/Invoice/showFile/' + name + (withDownload ? '?download=1' : '');
      return fetch(url, { headers: token ? { token: token } : {} }).then(function(r){
        if (!r.ok) throw new Error('文件读取失败');
        return r.blob();
      });
    },
    previewFile(name){
      this.getPdfBlob(name, false).then(blob=>{
        var objUrl = URL.createObjectURL(blob);
        window.open(objUrl, '_blank');
        setTimeout(function(){ URL.revokeObjectURL(objUrl); }, 60000);
      }).catch(()=>{ this.$message.error('预览失败，发票文件可能不存在'); });
    },
    downloadFile(name){
      this.getPdfBlob(name, true).then(blob=>{
        var objUrl = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = objUrl;
        a.download = '发票_' + name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objUrl);
      }).catch(()=>{ this.$message.error('下载失败，发票文件可能不存在'); });
    }
  }
}
</script>
