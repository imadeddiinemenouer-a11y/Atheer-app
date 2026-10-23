import {useState,useRef} from 'react';
import {S,sv,toast,bump} from '../core/store.js';
import {IX,DM,ingest,rmDoc,evictDocs,totZ,saveIx} from '../core/bm25.js';
import {retrieve} from '../core/bm25.js';
import {kb,terms} from '../core/text.js';
import {docxText} from '../core/docx.js';
import {G,P} from '../core/db.js';
import {Item} from '../components/ui.jsx';

export default function Library(){
  const [q,setQ]=useState('');
  const [res,setRes]=useState(null);
  const [tick,setTick]=useState(0);
  const fin=useRef(null);
  const refresh=()=>setTick(t=>t+1);
  const upload=async ev=>{
    const fs=[...ev.target.files];ev.target.value='';
    let ok=0,bad=[];
    for(const f of fs){
      try{
        if(f.size>9e6)throw new Error('كبير (>9MB)');
        const head=new Uint8Array(await f.slice(0,4).arrayBuffer());
        let text='';
        if(head[0]===0x50&&head[1]===0x4b)text=await docxText(await f.arrayBuffer());
        else if(head[0]===0x47&&head[1]===0x47)throw new Error('هذا GGUF — استخدمه في صفحة النموذج');
        else text=await f.text();
        const r=await ingest(f.name,text,'file');
        if(r>0)ok++;else bad.push(f.name+(r<0?' (مكرر)':''));
      }catch(x){bad.push(f.name+' ('+(x.message||'خطأ')+')')}
    }
    toast('📎 تعلمت من '+ok+' ملف'+(bad.length?' • تعذّر: '+bad.join('، '):''));
    refresh();
  };
  const clean=async()=>{
    const n=await evictDocs();
    const drop=[];
    if(IX.N>20)for(const w in IX.post)if(Object.keys(IX.post[w]).length>IX.N*.6){delete IX.post[w];drop.push(w)}
    await P('kv','ix',await (await import('../core/text.js')).gz(JSON.stringify(IX)));
    toast('🗜 حُذف '+drop.length+' مفردة شائعة و'+n+' ملف');
    refresh();
  };
  const search=async v=>{
    setQ(v);
    if(!v.trim()){setRes(null);return}
    setRes(await retrieve(v,5));
  };
  return <div className="card">
    <h3>📚 المكتبة</h3>
    <p className="hint">{Object.keys(DM).length} ملف • {IX.N} مقطع • {kb(totZ())} مضغوط — بلا accept= (خدعة WebView)، تحقق بالبايتات السحرية.</p>
    <input type="file" multiple style={{display:'none'}} ref={fin} onChange={upload}/>
    <div className="row">
      <button className="b pr" onClick={()=>fin.current.click()}>📎 رفع ملفات</button>
      <button className="b" onClick={clean}>🗜 ضغط</button>
    </div>
    <input placeholder="🔎 ابحث في المكتبة" value={q} onChange={e=>search(e.target.value)}/>
    {res? <div>{res.cs.map((c,i)=><Item key={i} title={c.txt.slice(0,200)} sub={c.name}/>)}
      {!res.cs.length&&<p className="hint">لا نتائج.</p>}</div>
    : <div>{Object.values(DM).sort((a,b)=>b.t-a.t).slice(0,40).map(d=>
        <Item key={d.id} title={'📄 '+d.name} sub={kb(d.zsize)+' • '+d.kind}
          actions={<button className="x" onClick={async()=>{await rmDoc(d.id);refresh()}}>✕</button>}/>)}
      {!Object.keys(DM).length&&<p className="hint">لا ملفات بعد.</p>}</div>}
  </div>;
}
