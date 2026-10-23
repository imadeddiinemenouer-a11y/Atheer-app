import {useState,useEffect,useRef} from 'react';
import {S,sv,toast} from '../core/store.js';

const KEYS=['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','(',')','='];

export default function Stealth(){
  const [expr,setExpr]=useState('');
  const [err,setErr]=useState(false);
  const t=useRef(null);
  useEffect(()=>{
    const h=e=>{if(e.key==='Escape')exit()};
    addEventListener('keydown',h);
    return()=>removeEventListener('keydown',h);
  },[]);
  const exit=()=>{S.cfg.stealth=0;sv('cfg');toast('✓ عدت إلى أثير')};
  const press=k=>{
    setErr(false);
    if(k==='C')return setExpr('');
    if(k==='⌫')return setExpr(e=>e.slice(0,-1));
    if(k==='='){
      let s=expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
      try{const v=Function('"use strict";return('+ (s||'0') +')')();setExpr(String(v))}
      catch(e){setErr(true)}
      return;
    }
    setExpr(e=>e+k);
  };
  return <div className="stealth">
    <div className="box">
      <div className="scr">{err?'خطأ':(expr||'0')}</div>
      <div className="keys">
        {KEYS.map(k=><button key={k}
          className={k==='C'?'cl':('÷×−+='.includes(k)?'op':'')}
          onClick={()=>press(k)}>{k}</button>)}
      </div>
      <div className="ver"
        onTouchStart={()=>{t.current=setTimeout(exit,900)}}
        onTouchEnd={()=>clearTimeout(t.current)}
        onMouseDown={()=>{t.current=setTimeout(exit,900)}}
        onMouseUp={()=>clearTimeout(t.current)}>
        Calculator v2.1.4 — اضغط مطولاً للخروج</div>
    </div>
  </div>;
}
