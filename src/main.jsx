import React from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import './core/guard.js';
import {S,bump,loadAll,log} from './core/store.js';
import {open,G,ALL} from './core/db.js';
import {IX,DM} from './core/bm25.js';
import {loadGraph} from './core/graph.js';
import {seedIntents} from './core/intent.js';
import {F} from './core/memory.js';
import {ungz} from './core/text.js';
import {LM} from './core/llm.js';
import {isBusy} from './brain/reply.js';
import {distillGaps} from './brain/learn.js';
import App from './App.jsx';

async function boot(){
  try{
    await open(); await loadAll();
    const ix=await G('kv','ix'); if(ix)Object.assign(IX,JSON.parse(await ungz(ix)));
    const g=await G('kv','g'); if(g)loadGraph(JSON.parse(await ungz(g)));
    (await ALL('doc')||[]).forEach(d=>DM[d.id]=d);
    seedIntents();
    if(navigator.storage?.persist)navigator.storage.persist();
    const n=F.forget(); if(n)log('🧹 نُسيت '+n+' معرفة');
    setInterval(()=>{F.decay();F.forgetOld()},36e5);
    setInterval(()=>{
      if(S.cfg.auto&&Object.keys(S.gaps).length&&LM.ready&&!isBusy())
        distillGaps().catch(e=>console.error(e));
    },600000);
    if(!S.chat.length)S.chat.push({r:'b',t:'أهلاً! أنا أثير v12 ✦ النواة الموحّدة (React).\n\nارفع ملفاتك في «المكتبة»، علّمني في «المعرفة»، أو حمّل نموذج GGUF و«قطّر» منه. علّمني بـ 👍 و👎.\n\nأعمل بلا إنترنت افتراضياً — الإنترنت اختياري من «التعلّم».'});
  }catch(e){console.error(e)}
  S.ready=true; bump();
}
boot();
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
