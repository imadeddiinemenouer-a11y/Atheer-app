import {useState} from 'react';
import {S,sv,toast} from '../core/store.js';
import {_fetch} from '../core/guard.js';
import {syncNow} from '../core/webdav.js';

export default function SyncPage(){
  const y=S.cfg.sync=S.cfg.sync||{};
  const [u,setU]=useState(y.url||'');const [us,setUs]=useState(y.user||'');
  const [p,setP]=useState(y.pass||'');const [f,setF]=useState(y.file||'');
  const save=()=>{y.url=u.trim();y.user=us.trim();y.pass=p;y.file=f.trim()||'atheer_sync.json';sv('cfg');toast('💾 حُفظ')};
  const test=async()=>{
    save();
    if(S.cfg.strict)return toast('🔒 الوضع الصارم مفعّل');
    if(!S.cfg.web)return toast('🌐 فعّل الإنترنت من صفحة التعلّم');
    try{
      const r=await _fetch(y.url.replace(/\/$/,'')+'/'+y.file,{headers:{Authorization:'Basic '+btoa(y.user+':'+y.pass)}});
      toast(r.ok||r.status===404?'✅ متصل (HTTP '+r.status+')':'⚠️ HTTP '+r.status);
    }catch(e){toast('⚠️ '+e.message)}
  };
  return <div className="card">
    <h3>☁️ مزامنة WebDAV</h3>
    <p className="hint">تُرفع المعرفة والمهام والقواعد والمصنّف والشبكة إلى ملف JSON (Nextcloud وغيره). يتطلب السماح بالإنترنت وتعطيل الوضع الصارم.</p>
    <input placeholder="الرابط — https://cloud.example.com/remote.php/dav/files/USER/" value={u} onChange={e=>setU(e.target.value)}/>
    <input placeholder="المستخدم" value={us} onChange={e=>setUs(e.target.value)}/>
    <input type="password" placeholder="كلمة المرور" value={p} onChange={e=>setP(e.target.value)}/>
    <input placeholder="اسم الملف (افتراضي atheer_sync.json)" value={f} onChange={e=>setF(e.target.value)}/>
    <div className="row">
      <button className="b pr" onClick={save}>💾 حفظ</button>
      <button className="b" onClick={test}>🔌 اختبار</button>
      <button className="b okb" onClick={()=>{save();syncNow(true)}}>🔄 مزامنة الآن</button>
    </div>
    <p className="hint">آخر مزامنة: {y.lastSync?new Date(y.lastSync).toLocaleString('ar'):'لم تتم'}</p>
  </div>;
}
