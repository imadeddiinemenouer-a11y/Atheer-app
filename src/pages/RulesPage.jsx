import {useState} from 'react';
import {S,sv,toast} from '../core/store.js';
import {ruleHit,runSkill} from '../core/skills.js';
import {clsPredict} from '../core/intent.js';
import {Item} from '../components/ui.jsx';

export default function RulesPage(){
  const [rp,setRp]=useState('');const [rr,setRr]=useState('');
  const [kn,setKn]=useState('');const [kp,setKp]=useState('');const [kc,setKc]=useState('');
  const [tIn,setTIn]=useState('');const [tOut,setTOut]=useState('');
  const [,force]=useState(0);
  const refresh=()=>force(x=>x+1);
  const addRule=()=>{
    if(!rp.trim()||!rr.trim())return;
    S.rules.push({p:rp.trim(),r:rr.trim()});sv('rules');
    setRp('');setRr('');refresh();
  };
  const addSkill=()=>{
    if(!kn.trim()||!kp.trim()||!kc.trim())return toast('أكمل كل الحقول');
    try{new RegExp(kp)}catch(e){return toast('⚠️ regex: '+e.message)}
    if(!confirm('ستعمل في Worker معزول بمهلة 4 ثوانٍ. احفظ فقط ما كتبتَه أو وثقتَ مصدره.'))return;
    S.skills=S.skills.filter(x=>x.n!==kn.trim());
    S.skills.push({n:kn.trim(),p:kp.trim(),c:kc});
    sv('skills');setKn('');setKp('');setKc('');refresh();
  };
  const test=async()=>{
    if(!tIn.trim())return;
    setTOut('⏳…');
    const hit=S.rules.find(x=>ruleHit(x,tIn));
    if(hit){setTOut('✔ قاعدة: '+hit.p+' ← '+hit.r.replace(/\{q\}/g,tIn));return}
    window.__ATHEER_KB=S.facts;
    for(const sk of S.skills){
      let mm=null;
      try{mm=tIn.match(new RegExp(sk.p,'i'))}catch(e){}
      if(mm){setTOut('✔ مهارة «'+sk.n+'»: '+(await runSkill(sk.c,tIn,mm)));return}
    }
    setTOut('لا قاعدة ولا مهارة — التصنيف: '+(clsPredict(tIn)?.intent||'؟'));
  };
  return <div className="card">
    <h3>📐 القواعد والمهارات المعزولة</h3>
    <p className="hint">المهارات JavaScript في Worker معزول — لا يمس بياناتك حتى لو كان خبيثاً. الوضع الآمن يعطّلها ساعة عند تكرار الأخطاء.</p>
    <h4>قاعدة</h4>
    <input placeholder="النمط — أو /regex/" value={rp} onChange={e=>setRp(e.target.value)}/>
    <input placeholder="الرد — {q} = السؤال" value={rr} onChange={e=>setRr(e.target.value)}/>
    <button className="b pr" onClick={addRule}>➕ قاعدة</button>
    {S.rules.map((x,i)=><Item key={i} title={x.p+' ← '+x.r}
      actions={<button className="x" onClick={()=>{S.rules.splice(i,1);sv('rules');refresh()}}>✕</button>}/>)}
    <h4>مهارة</h4>
    <input placeholder="اسم المهارة" value={kn} onChange={e=>setKn(e.target.value)}/>
    <input placeholder="نمط التفعيل: ^احسب (.+)" value={kp} onChange={e=>setKp(e.target.value)} dir="ltr"/>
    <textarea rows="3" dir="ltr" placeholder={"return 'أدخلت: ' + m[1];"} value={kc} onChange={e=>setKc(e.target.value)}/>
    <button className="b pr" onClick={addSkill}>💾 حفظ المهارة</button>
    {S.skills.map((x,i)=><Item key={i} title={'⚡ '+x.n} sub={x.p}
      actions={<button className="x" onClick={()=>{S.skills.splice(i,1);sv('skills');refresh()}}>✕</button>}/>)}
    <h4>🧪 اختبار</h4>
    <input placeholder="جرّب جملة…" value={tIn} onChange={e=>setTIn(e.target.value)}/>
    <button className="b" onClick={test}>اختبر</button>
    <p className="hint">{tOut}</p>
  </div>;
}
