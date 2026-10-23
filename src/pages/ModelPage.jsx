import {useState,useRef} from 'react';
import {S,sv,toast} from '../core/store.js';
import {P,G,D,AK} from '../core/db.js';
import {LM,loadModelFile,useModel,unloadLLM} from '../core/llm.js';
import {Item,Badge} from '../components/ui.jsx';

export default function ModelPage(){
  const [tick,setTick]=useState(0);
  const [keys,setKeys]=useState([]);
  const fin=useRef(null);
  const refresh=async()=>{setKeys((await AK('model'))||[]);setTick(t=>t+1)};
  useState(()=>{refresh()});
  const pick=async ev=>{
    const f=ev.target.files[0];ev.target.value='';
    if(!f)return;
    const h=new Uint8Array(await f.slice(0,4).arrayBuffer());
    if(!(h[0]===0x47&&h[1]===0x47&&h[2]===0x55&&h[3]===0x46))return toast('⚠️ ليست GGUF');
    await loadModelFile(f,true);
    refresh();
  };
  return <div className="card">
    <h3>🤖 النموذج المحلي (GGUF)</h3>
    <p className="hint">{LM.ready?'✅ النموذج يعمل: '+LM.name:'⚠️ لا نموذج — الوضع الرمزي فعال'} — مقترح: Qwen2.5-0.5B-Instruct q4_k_m (~400MB). wllama أحادي الخيط مضمَّن بالبناء = يعمل offline.</p>
    <input type="file" style={{display:'none'}} ref={fin} onChange={pick}/>
    <div className="row">
      <button className="b pr" onClick={()=>fin.current.click()}>📂 اختر .gguf (بلا accept)</button>
      <button className="b" onClick={async()=>{keys.length?await useModel(keys.includes(S.cfg.act)?S.cfg.act:keys[0]).then(refresh):toast('لا نموذج محفوظ')}}>▶️ المحفوظ</button>
      <button className="b dn" onClick={unloadLLM}>⏸ إفراغ</button>
    </div>
    <h4>النماذج المحفوظة</h4>
    {keys.map(k=><Item key={k} title={'🤖 '+k.replace(/^gguf:/,'')+(k===S.cfg.act?' ●':'')}
      actions={<>
        <button className="x" style={{color:'var(--ac)'}} onClick={async()=>{await useModel(k);refresh()}}>▶</button>
        <button className="x" onClick={async()=>{await D('model',k);refresh()}}>✕</button>
      </>}/>)}
    {!keys.length&&<p className="hint">لا نماذج محفوظة.</p>}
    <h4>التقطير حسب النموذج</h4>
    {Object.entries(S.dist).map(([k,v])=><Item key={k} title={k} sub={v+' إجابة مقطّرة'}/>)}
    {!Object.keys(S.dist).length&&<p className="hint">لم يُقطَّر شيء بعد.</p>}
  </div>;
}
