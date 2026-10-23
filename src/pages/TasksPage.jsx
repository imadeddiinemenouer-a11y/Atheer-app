import {useState} from 'react';
import {S,sv} from '../core/store.js';
import {uid,terms} from '../core/text.js';
import {link} from '../core/graph.js';
import {Item} from '../components/ui.jsx';

export default function TasksPage(){
  const [t,setT]=useState('');const [n,setN]=useState('');
  const [,force]=useState(0);
  const refresh=()=>force(x=>x+1);
  return <div className="card">
    <h3>🗂 المهام والملاحظات</h3>
    <input placeholder="مهمة جديدة — أو في المحادثة: مهمة: ..." value={t} onChange={e=>setT(e.target.value)}
      onKeyDown={e=>{if(e.key==='Enter'&&t.trim()){S.tasks.push({id:uid(),t:t.trim(),d:0});sv('tasks');setT('');refresh()}}}/>
    <button className="b pr" onClick={()=>{if(!t.trim())return;S.tasks.push({id:uid(),t:t.trim(),d:0});sv('tasks');setT('');refresh()}}>➕ مهمة</button>
    {S.tasks.map((x,i)=><Item key={x.id} title={x.t}
      actions={<>
        <button className="x" style={{color:'var(--ok)'}} onClick={()=>{S.tasks[i].d=S.tasks[i].d?0:1;sv('tasks');refresh()}}>{x.d?'↩️':'✔️'}</button>
        <button className="x" onClick={()=>{S.tasks.splice(i,1);sv('tasks');refresh()}}>✕</button>
      </>}/>)}
    {!S.tasks.length&&<p className="hint">لا مهام.</p>}
    <h4>ملاحظات</h4>
    <textarea rows="3" placeholder="ملاحظة… أو في المحادثة: ملاحظة: ..." value={n} onChange={e=>setN(e.target.value)}/>
    <button className="b pr" onClick={()=>{if(!n.trim())return;
      S.notes.push({id:uid(),t:n.trim().slice(0,50),b:n.trim()});
      link(terms(n).slice(0,8));sv('notes');setN('');refresh()}}>💾 حفظ</button>
    {S.notes.map((x,i)=><Item key={x.id} title={x.b}
      actions={<button className="x" onClick={()=>{S.notes.splice(i,1);sv('notes');refresh()}}>✕</button>}/>)}
    {!S.notes.length&&<p className="hint">لا ملاحظات.</p>}
  </div>;
}
