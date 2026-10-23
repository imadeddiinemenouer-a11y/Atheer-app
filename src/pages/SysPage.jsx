import {useState} from 'react';
import {S,sv,toast,log} from '../core/store.js';
import {_fetch} from '../core/guard.js';
import {open} from '../core/db.js';
import {IX,DM,totZ} from '../core/bm25.js';
import {Gr} from '../core/graph.js';
import {F} from '../core/memory.js';
import {LM} from '../core/llm.js';
import {kb} from '../core/text.js';
import {Item,Badge} from '../components/ui.jsx';

export default function SysPage(){
  const [out,setOut]=useState(null);
  const check=async()=>{
    const o=[];
    const add=(b,t,x)=>o.push(<Item key={t} title={(b?'✅ ':'❌ ')+t} sub={x||''}/>);
    let on=false;
    try{if(S.cfg.web&&!S.cfg.strict){await _fetch('https://www.gstatic.com/generate_204',{mode:'no-cors',cache:'no-store'});on=true}}catch(e){}
    const db=await open();
    add(!!db,'قاعدة البيانات',db?'متصلة':'معطلة');
    add(LM.ready,'النموذج',LM.ready?LM.name:'غير محمّل — الرمزي فعال');
    add(typeof CompressionStream!=='undefined','ضغط gzip');
    add(!!Worker,'عزل المهارات (Worker)');
    try{const e=await navigator.storage.estimate();add(true,'التخزين',kb(e.usage)+' / '+kb(e.quota))}catch(e){add(false,'قراءة التخزين')}
    add(true,'الوضع',S.cfg.strict?'محلي صارم 🔒':(S.cfg.web?'محلي + إنترنت اختياري':'محلي'));
    add(on,'الاتصال',on?'متصل':'غير متصل');
    setOut(<div>{o}<p className="hint">🧠 {S.facts.length} حقيقة • 💭 قوة {Math.round(F.quality()*100)}% • 📚 {Object.keys(DM).length} ملف • 🕸 {Object.keys(Gr.n).length} مفهوم • 🎯 مصنّف على {S.cls.trained} عينة • 👍/👎 {(S.stat.own||0)+(S.stat.llm||0)} رد • ⭐ {S.xp} XP — المستوى {Math.floor(Math.sqrt(S.xp/20))+1}</p></div>);
    log('🔄 فحص النظام');
  };
  return <div className="card">
    <h3>🩺 النظام</h3>
    <div className="row">
      <button className="b pr" onClick={check}>🔄 فحص</button>
      <button className="b okb" onClick={async()=>{try{if(navigator.storage?.persist){toast((await navigator.storage.persist())?'🔒 دائم':'⚠️ رُفض')}else toast('غير مدعوم')}catch(e){toast('⚠️ '+e.message)}}}>🔒 تخزين دائم</button>
      <button className="b dn" onClick={async()=>{if(!confirm('سيُمسح كل شيء. متأكد؟'))return;if(!confirm('تأكيد أخير!'))return;
        try{(await open())?.close()}catch(e){}indexedDB.deleteDatabase('atheer12');location.reload()}}>⚠️ مسح كل البيانات</button>
    </div>
    <label className="tgl"><input type="checkbox" checked={!!S.cfg.tts} onChange={e=>{S.cfg.tts=e.target.checked?1:0;sv('cfg')}}/> 🔊 قراءة الردود بصوت عالٍ</label>
    <label className="tgl"><input type="checkbox" checked={!!S.cfg.stealth} onChange={e=>{S.cfg.stealth=e.target.checked?1:0;sv('cfg')}}/> 🕵️ وضع خفي — آلة حاسبة مقنعة</label>
    {out}
    <h4>السجل</h4>
    <div className="log">{S.logs.join('
')}</div>
    <button className="b gray" onClick={()=>{S.logs=[];sv('logs')}}>🧹 مسح السجل</button>
  </div>;
}
