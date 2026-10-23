import {useState} from 'react';
import {S,sv,toast} from '../core/store.js';
import {distill,distillGaps,teachAll,stopAll} from '../brain/learn.js';
import {isBusy} from '../brain/reply.js';
import {Item} from '../components/ui.jsx';

export default function Learn(){
  const [topic,setTopic]=useState('');
  const [st,setSt]=useState('');
  const [bar,setBar]=useState(0);
  const [,force]=useState(0);
  const refresh=()=>force(x=>x+1);
  const onStep=(done,total,q)=>{setBar(Math.round(done/total*100));setSt('⚗️ '+q)};
  const wrap=fn=>async()=>{
    if(isBusy())return toast('⏳ عملية جارية');
    setBar(0);
    try{const n=await fn();if(n!=null){toast('✔ '+n);refresh()}}
    catch(e){toast('⚠️ '+e.message)}
    finally{setSt('');setBar(0)}
  };
  const gaps=Object.entries(S.gaps).sort((a,b)=>b[1]-a[1]);
  return <div className="card">
    <h3>🧭 التعلّم والتقطير</h3>
    <p className="hint">التقطير: سؤال النموذج المحلي وحفظ إجاباته كنصوص دائمة. ليس نسخاً للأوزان ولا تدريباً.</p>
    <input placeholder="الموضوع — مثال: الشبكات العصبية" value={topic} onChange={e=>setTopic(e.target.value)}/>
    <div className="row">
      <button className="b pr" onClick={wrap(async()=>{if(!topic.trim())throw new Error('اكتب موضوعاً');return await distill(topic.trim(),4,onStep)})}>⚗️ بالنموذج الحالي</button>
      <button className="b okb" onClick={wrap(async()=>{if(!topic.trim())throw new Error('اكتب موضوعاً');return await teachAll(topic.trim(),onStep)})}>⚗️ بكل النماذج</button>
      <button className="b warn" onClick={wrap(async()=>await distillGaps(onStep))}>🕳 فجواتي</button>
      <button className="b dn" onClick={()=>{stopAll();toast('⏹ أُرسل الإيقاف')}}>⏹ إيقاف</button>
    </div>
    <div className="bar"><i style={{width:bar+'%'}}/></div>
    <p className="hint">{st}</p>
    <label className="tgl"><input type="checkbox" checked={!!S.cfg.web} onChange={e=>{S.cfg.web=e.target.checked?1:0;sv('cfg');toast(S.cfg.web?'🌐 الإنترنت مسموح':'🔒 محلي فقط');refresh()}}/> السماح بالإنترنت (اختياري)</label>
    <label className="tgl"><input type="checkbox" checked={!!S.cfg.auto} onChange={e=>{S.cfg.auto=e.target.checked?1:0;sv('cfg');refresh()}}/> تعلّم ذاتي كل 10 دقائق من الفجوات</label>
    <label className="tgl"><input type="checkbox" checked={!!S.cfg.strict} onChange={e=>{S.cfg.strict=e.target.checked?1:0;sv('cfg');toast(S.cfg.strict?'🔒 الوضع الصارم مفعّل':'الصارم متوقف');refresh()}}/> 🔒 الوضع المحلي الصارم (رفض كل اتصال خارجي)</label>
    <h4>فجوات المعرفة <span className="badge y">{gaps.length}</span></h4>
    {gaps.map(([k,v])=><Item key={k} title={k} sub={'×'+v}
      actions={<button className="x" onClick={()=>{delete S.gaps[k];sv('gaps');refresh()}}>✕</button>}/>)}
    {!gaps.length&&<p className="hint">لا فجوات ✨</p>}
  </div>;
}
