import {useState} from 'react';
import {Gr,adj,gpath} from '../core/graph.js';
import {terms} from '../core/text.js';
import {Item} from '../components/ui.jsx';

export default function GraphPage(){
  const [q,setQ]=useState('');
  const [out,setOut]=useState(null);
  const neigh=()=>{
    const w=terms(q)[0];
    if(!w)return;
    const n=(adj()[w]||[]).slice(0,14);
    setOut(n.length?n.map(x=><Item key={x[0]} title={x[0]} sub={'×'+x[1]}/>):<p className="hint">لا روابط بعد.</p>);
  };
  const path=()=>{
    const ps=q.split(/[,،]/).map(s=>s.trim());
    if(ps.length!==2)return;
    const p=gpath(terms(ps[0])[0],terms(ps[1])[0]);
    setOut(p?<Item title={'🧭 '+p.join(' ← ')}/>:<p className="hint">لا مسار بينهما.</p>);
  };
  const all=()=>{
    const a=Object.entries(Gr.n).sort((x,y)=>y[1]-x[1]).slice(0,40);
    setOut(a.map(([k,v])=><Item key={k} title={k} sub={String(v)}/>));
  };
  return <div className="card">
    <h3>🕸 شبكة المفاهيم</h3>
    <input placeholder="مفهوم، أو مفهومين مفصولين بفاصلة" value={q} onChange={e=>setQ(e.target.value)}/>
    <div className="row">
      <button className="b pr" onClick={neigh}>🔍 الجوار</button>
      <button className="b" onClick={path}>🧭 المسار</button>
      <button className="b gray" onClick={all}>📋 الأهم</button>
    </div>
    <div>{out||<p className="hint">{Object.keys(Gr.n).length} مفهوم • {Object.keys(Gr.e).length} رابط</p>}</div>
  </div>;
}
