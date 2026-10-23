import {useState,useRef} from 'react';
import {S,sv,toast,log} from '../core/store.js';
import {G} from '../core/db.js';
import {ungz} from '../core/text.js';
import {DM,ingest,saveIx} from '../core/bm25.js';
import {Gr,loadGraph} from '../core/graph.js';
import {gz} from '../core/text.js';

export default function BackupPage(){
  const [txt,setTxt]=useState('');
  const fin=useRef(null);
  const snap=async()=>{
    const docs=[];
    for(const d of Object.values(DM)){
      const parts=[];
      for(const cid of d.ids){
        const row=await G('chunk',cid);
        if(row)parts.push(await ungz(row.z));
      }
      docs.push({name:d.name,kind:d.kind,text:parts.join('\n')});
    }
    return {format:'atheer12-backup',version:1,created:new Date().toISOString(),
      app:{chat:S.chat.slice(-120),facts:S.facts,gaps:S.gaps,rules:S.rules,skills:S.skills,
        tasks:S.tasks,notes:S.notes,xp:S.xp,interactions:S.interactions,stat:S.stat,dist:S.dist,
        cls:S.cls,cfg:{...S.cfg,act:''}},
      graph:{n:Gr.n,e:Gr.e},docs,
      note:'ملفات GGUF الثنائية غير مضمنة — استوردها يدوياً'};
  };
  const copy=async()=>{
    const s=JSON.stringify(await snap());
    try{await navigator.clipboard.writeText(s);toast('📋 نُسخت')}
    catch(e){setTxt(s);toast('وُضعت في المربع')}
  };
  const file=async()=>{
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(await snap())],{type:'application/json'}));
    a.download='atheer12-backup-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.appendChild(a);a.click();a.remove();
    toast('💾 حُفظت');
  };
  const apply=async o=>{
    if(!o||!o.app)throw new Error('ليست نسخة صالحة');
    if(!confirm('استبدال/دمج البيانات الحالية؟'))return;
    const A=o.app;
    S.facts=A.facts||[];S.gaps=A.gaps||{};S.rules=A.rules||[];S.skills=A.skills||[];
    S.tasks=A.tasks||[];S.notes=A.notes||[];S.xp=A.xp||0;S.interactions=A.interactions||0;
    S.stat=A.stat||S.stat;S.dist=A.dist||{};S.cls=A.cls||S.cls;
    if(o.graph)loadGraph(o.graph);
    if(!S.chat.length&&A.chat)S.chat=A.chat;
    let imp=0;
    if(Array.isArray(o.docs))for(const d of o.docs){
      if(d.text&&d.text.trim().length>20){const n=await ingest(d.name,d.text,d.kind||'file');if(n>0)imp++}
    }
    ['chat','facts','gaps','rules','skills','tasks','notes','xp','interactions','stat','dist','cls'].forEach(sv);
    await saveIx(); 
    log('✔ استيراد: '+imp+' وثيقة، '+S.facts.length+' حقيقة');
    toast('✔ اكتمل — أعد استيراد GGUF يدوياً');
  };
  const impFile=async ev=>{
    const f=ev.target.files[0];ev.target.value='';
    if(!f)return;
    try{await apply(JSON.parse(await f.text()))}catch(x){toast('⚠️ '+x.message)}
  };
  const brain=async()=>{
    const brain={app:'أثير',version:12,created:new Date().toISOString(),
      note:'دماغ معرفي مستقل — يُستورد في أي نسخة أثير',
      facts:S.facts,graph:{n:Gr.n,e:Gr.e},rules:S.rules,skills:S.skills,cls:S.cls,
      quality:S.facts.map(f=>({k:f.k,q:f.q}))};
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([JSON.stringify(brain)],{type:'application/json'}));
    a.download='atheer-brain.json';document.body.appendChild(a);a.click();a.remove();
    log('🧠 صُدّر الدماغ: '+S.facts.length+' حقيقة');toast('🧠 صُدّر الدماغ');
  };
  return <div className="card">
    <h3>💾 النسخ الاحتياطي ودماغ أثير</h3>
    <p className="hint">يشمل المعرفة والمكتبة (نصوص) والشبكة والقواعد والمهارات والمصنّف. لا يشمل ملفات GGUF.</p>
    <div className="row">
      <button className="b pr" onClick={copy}>📋 للحافظة</button>
      <button className="b" onClick={file}>💾 حفظ JSON</button>
      <button className="b" onClick={()=>fin.current.click()}>📥 استيراد ملف</button>
    </div>
    <input type="file" style={{display:'none'}} ref={fin} onChange={impFile}/>
    <textarea rows="4" placeholder="أو الصق نسخة JSON…" value={txt} onChange={e=>setTxt(e.target.value)}/>
    <button className="b" onClick={async()=>{try{await apply(JSON.parse(txt))}catch(x){toast('⚠️ '+x.message)}}}>📝 استيراد من نص</button>
    <h4>🧠 دماغ أثير</h4>
    <button className="b okb" onClick={brain}>🧠 تصدير الدماغ</button>
  </div>;
}
