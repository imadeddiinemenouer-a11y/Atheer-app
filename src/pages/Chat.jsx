import {useState,useRef,useEffect} from 'react';
import {S,sv,bump} from '../core/store.js';
import {send,isBusy,feedback,speak,setMode} from '../brain/reply.js';
import {clsPredict} from '../core/intent.js';

export default function Chat(){
  const [q,setQ]=useState('');
  const [mode,setModeL]=useState('auto');
  const box=useRef(null);
  useEffect(()=>{if(box.current)box.current.scrollTop=box.current.scrollHeight});
  const go=()=>{if(!q.trim()||isBusy())return;const v=q;setQ('');send(v)};
  const mic=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return;
    const r=new SR();r.lang='ar-SA';
    r.onresult=e=>setQ(e.results[0][0].transcript);
    r.start();
  };
  return <div className="card">
    <h3>💬 المحادثة</h3>
    <div className="row">
      <select value={mode} onChange={e=>{setModeL(e.target.value);setMode(e.target.value)}}>
        <option value="auto">تلقائي — ذاكرة ثم نموذج</option>
        <option value="memory">ذاكرة فقط</option>
        <option value="model">النموذج المحلي</option>
      </select>
      <button className="b gray" onClick={()=>{if(confirm('مسح المحادثة؟')){S.chat=[];sv('chat');bump()}}}>🗑 مسح</button>
    </div>
    <div className="chat" ref={box}>
      {S.chat.map((m,i)=><div key={i} className={'msg '+(m.r==='u'?'u':'b')}>{m.t}
        {m.r==='b'&&m.t!=='💭 ...'&&<div className="fb">
          <button onClick={()=>feedback(1)}>👍</button>
          <button onClick={()=>feedback(0)}>👎</button>
          <button onClick={()=>speak(m.t)} title="نطق">🔊</button>
        </div>}
      </div>)}
    </div>
    <div className="row">
      <input style={{flex:3}} value={q} placeholder="اسأل، أو: تعلم س هو ص • مهمة: ... • قطّر س • استعارة س"
        onChange={e=>setQ(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter'&&!e.isComposing)go()}}/>
      <button className="b pr" onClick={go}>➤</button>
      <button className="b gray" onClick={mic} title="إملاء">🎤</button>
    </div>
    <p className="hint">تصنيف النية: {clsPredict(q)?.intent||'—'} — أوامر: تعلم/مهمة/ملاحظة/قطّر/ابحث عن/اقرأ رابط/استعارة/قصة/امزج/ما علاقة</p>
  </div>;
}
