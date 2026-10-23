import {useState} from 'react';
import {S,sv,toast,bump} from '../core/store.js';
import {F} from '../core/memory.js';
import {Gr,link} from '../core/graph.js';
import {terms,nz} from '../core/text.js';
import {Item,Badge} from '../components/ui.jsx';

export default function Knowledge(){
  const [k,setK]=useState('');const [v,setV]=useState('');const [q,setQ]=useState('');
  const [,force]=useState(0);
  const refresh=()=>force(x=>x+1);
  const list=S.facts.filter(f=>!q||nz(f.k+' '+f.t).includes(nz(q))).slice(-80).reverse();
  const add=()=>{
    if(!k.trim()||!v.trim())return toast('أكمل الحقلين');
    const chk=F.verify(k,v);
    if(!chk.ok&&!confirm('⚠️ تعارض مع: '+chk.con.join('، ')+'\nحفظ رغم ذلك؟'))return;
    F.store(k.trim(),v.trim(),'manual',chk.ok?.9:.5);
    link(terms(k+' '+v).slice(0,6));
    setK('');setV('');refresh();toast('✅ حُفظت');
  };
  return <div className="card">
    <h3>🧠 المعرفة</h3>
    <div className="stats">
      <div className="stat"><span>حقيقة</span><b>{S.facts.length}</b></div>
      <div className="stat"><span>مفهوم</span><b>{Object.keys(Gr.n).length}</b></div>
      <div className="stat"><span>رابط</span><b>{Object.keys(Gr.e).length}</b></div>
      <div className="stat"><span>جودة</span><b>{Math.round(F.quality()*100)}%</b></div>
    </div>
    <input placeholder="المفتاح — مثال: الخلية" value={k} onChange={e=>setK(e.target.value)}/>
    <textarea rows="3" placeholder="النص أو الحقيقة…" value={v} onChange={e=>setV(e.target.value)}/>
    <button className="b pr" onClick={add}>➕ حفظ (مع فحص تعارض)</button>
    <input placeholder="🔎 بحث في المعرفة" value={q} onChange={e=>setQ(e.target.value)}/>
    {list.map(f=><Item key={f.id}
      title={f.k+'
'+(f.t||'').slice(0,150)}
      sub={' '}
      actions={<>
        <Badge cls={f.src==='manual'?'':f.src==='distill'?'g':''}>{f.src} {Math.round((f.q||.5)*100)}%</Badge>
        <button className="x" onClick={()=>{S.facts=S.facts.filter(x=>x.id!==f.id);sv('facts');refresh()}}>✕</button>
      </>}/>)}
    {!list.length&&<p className="hint">لا معرفة مطابقة.</p>}
  </div>;
}
