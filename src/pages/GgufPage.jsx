import {useState,useRef} from 'react';
import {toast} from '../core/store.js';
import {F} from '../core/memory.js';
import {ggufFingerprint} from '../core/gguf.js';
import {Item,Badge} from '../components/ui.jsx';

export default function GgufPage(){
  const [fp,setFp]=useState(null);
  const [st,setSt]=useState('');
  const fin=useRef(null);
  const analyze=async ev=>{
    const f=ev.target.files[0];ev.target.value='';
    if(!f)return;
    setSt('🔎 تحليل الرأس…');
    try{
      const r=await ggufFingerprint(f);
      setFp(r);setSt('✅ اكتمل');
    }catch(e){setSt('❌ '+e.message)}
  };
  const save=()=>{
    if(!fp)return;
    F.store('بصمة GGUF: '+fp.name,
      'البنية: '+fp.arch+' — GGUF v'+fp.ver+' — Tensors: '+fp.tensors
      +' — معاملات مقدّرة: '+(fp.estParams?(fp.estParams/1e9).toFixed(2)+'B':'؟'),
      'fingerprint',.9);
    toast('🧠 حُفظت البصمة في المعرفة');
  };
  return <div className="card">
    <h3>🔬 بصمة GGUF الصادقة</h3>
    <p className="hint">يقرأ رأس الملف فقط (حتى 4MB): الاسم، البنية، عدد الـ tensors، تقدير المعاملات. لا يدّعي استخراج «كل المعرفة الكامنة».</p>
    <input type="file" style={{display:'none'}} ref={fin} onChange={analyze}/>
    <button className="b pr" onClick={()=>fin.current.click()}>📂 اختر .gguf وحلّل الرأس</button>
    <p className="hint">{st}</p>
    {fp&&<div>
      <Item title={fp.name} sub={'البنية: '+fp.arch+' • GGUF v'+fp.ver}/>
      <div className="stats">
        <div className="stat"><span>Tensors</span><b>{fp.tensors}</b></div>
        <div className="stat"><span>معاملات مقدّرة</span><b>{fp.estParams?(fp.estParams/1e9).toFixed(2)+'B':'؟'}</b></div>
      </div>
      <button className="b okb" onClick={save}>🧠 احفظ كمعرفة</button>
    </div>}
  </div>;
}
