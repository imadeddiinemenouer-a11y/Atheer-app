import {S,sv,log,xp,toast,bump} from '../core/store.js';
import {err} from '../core/errors.js';
import {terms,tk} from '../core/text.js';
import {retrieve} from '../core/bm25.js';
import {F} from '../core/memory.js';
import {clsTrain,clsPredict} from '../core/intent.js';
import {runSkill,ruleHit} from '../core/skills.js';
import {LM,ensureLLM,gen} from '../core/llm.js';
import {adj,gpath} from '../core/graph.js';
import {ingest} from '../core/bm25.js';
import {distill,webLearn} from './learn.js';
import {_fetch} from '../core/guard.js';
import {uid} from '../core/text.js';

let busy=false;
let MODE='auto';
export const isBusy=()=>busy;
export function setMode(m){MODE=m}
export function speak(t){try{const u=new SpeechSynthesisUtterance(String(t).slice(0,500));u.lang='ar-SA';speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}

const GAP=q=>{q=String(q).trim().slice(0,90);if(q.length<4)return;
  S.gaps[q]=(S.gaps[q]||0)+1;
  const k=Object.keys(S.gaps);if(k.length>80)delete S.gaps[k[0]];
  sv('gaps')};

function calc(c){
  const s=String(c).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/×/g,'*').replace(/÷/g,'/');
  if(!/[+\-*/]/.test(s)||!/\d/.test(s))return null;
  try{return Function('"use strict";return('+s+')')()}catch(e){return null}
}

async function ft(url,ms){
  if(!navigator.onLine)throw new Error('لا اتصال');
  const PX=[u=>'https://api.allorigins.win/raw?url='+encodeURIComponent(u),
    u=>'https://corsproxy.io/?'+encodeURIComponent(u),
    u=>'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(u)];
  let le;
  for(const mk of [u=>u].concat(PX)){
    const c=new AbortController(),t=setTimeout(()=>c.abort(),ms||12000);
    try{
      const r=await _fetch(mk(url),{signal:c.signal});
      if(!r.ok)throw new Error('HTTP '+r.status);
      return await r.text();
    }catch(e){le=e}
    finally{clearTimeout(t)}
  }
  throw le||new Error('تعذر الوصول');
}

export async function reply(q){
  let m;
  const cc=calc(q);
  if(cc!=null)return '🔢 النتيجة: '+cc;
  const CM=(re,fn)=>{const x=q.match(re);if(x){CM.r=fn(x);return true}return false};

  if(CM(/^تعلم\s+(.+?)\s+(?:هو|هي|تساوي|=)\s+(.+)$/,x=>{
    const chk=F.verify(x[1],x[2]);
    F.store(x[1],x[2],'manual',chk.ok?.9:.5);
    clsTrain('حفظ',q);
    return '🧠 '+(chk.ok?'تعلمت':'حفظت بتنبيه تعارض: '+chk.con.join('، '))+' — «'+x[1]+'»';
  }))return CM.r;

  if(CM(/^مهمة[:：]\s*(.+)$/,x=>{
    S.tasks.push({id:uid(),t:x[1],d:0});sv('tasks');
    clsTrain('مهمة',q);
    return '✅ أضفت المهمة';
  }))return CM.r;

  if(CM(/^ملاحظة[:：]\s*(.+)$/,x=>{
    S.notes.push({id:uid(),t:x[1].slice(0,50),b:x[1]});sv('notes');
    clsTrain('ملاحظة',q);
    return '📝 حفظت الملاحظة';
  }))return CM.r;

  if(CM(/^(?:ابحث عن|ابحث في الإنترنت)\s+(.+)$/,async x=>{
    clsTrain('بحث',q);
    if(!S.cfg.web)throw new Error('الإنترنت معطّل — فعّله من صفحة التعلّم');
    const {out,n}=await webLearn(x[1]);
    return out.length
      ?'🌐 تعلمت '+n+' مصدراً:\n'+out.slice(0,3).map(v=>'• '+v.t+': '+v.x.slice(0,130)+'…').join('\n')
      :'🌐 لا نتائج — تحقق من الاتصال';
  }))return CM.r;

  if(CM(/^اقرأ\s+(https?:\/\/\S+)/,async x=>{
    if(!S.cfg.web)throw new Error('الإنترنت معطّل');
    const d=new DOMParser().parseFromString(await ft(x[1],20000),'text/html');
    d.querySelectorAll('script,style,nav,footer,header').forEach(e=>e.remove());
    const n=await ingest('رابط: '+(d.title||new URL(x[1]).hostname),d.body?d.body.textContent:'','url');
    return n>0?'🔗 قرأت الصفحة ('+n+' مقطع)':'الصفحة فارغة أو مكررة';
  }))return CM.r;

  if(CM(/^(?:قطّر|تقطير)\s+(.+)$/,async x=>{
    clsTrain('تقطير',q);
    const n=await distill(x[1],4);
    return n>0?'⚗️ تعلمت '+n+' إجابات عن: '+x[1]:'⚗️ لم أحصل على جديد — حمّل نموذجاً أو وضّح الموضوع';
  }))return CM.r;

  if(CM(/^استعارة\s+(.+)$/,x=>{
    clsTrain('إبداع',q);
    const a=terms(x[1])[0]||x[1],rels=(adj()[a]||[]);
    if(!rels.length)return 'لا روابط كافية لصنع استعارة عن «'+a+'» — أضف ملفات أو معرفة';
    return 'حين أفكر في «'+a+'» أراها مثل «'+rels[Math.floor(Math.random()*Math.min(8,rels.length))][0]+'» — يجمعهما خيط من شبكتي.';
  }))return CM.r;

  if(CM(/^قصة\s+(.+)$/,x=>{
    clsTrain('إبداع',q);
    let cur=terms(x[1])[0]||x[1],path=[cur];
    for(let i=0;i<4;i++){
      const r=(adj()[cur]||[]).slice(0,5);
      if(!r.length)break;
      const nx=r[Math.floor(Math.random()*r.length)][0];
      if(path.includes(nx))break;
      path.push(nx);cur=nx;
    }
    return path.length>1
      ?'حكاية من شبكة أثير: «'+path.join('» ← «')+'». مولّدة من الروابط، ليست معلومة موثقة.'
      :'الشبكة لا تملك روابط كافية بعد.';
  }))return CM.r;

  if(CM(/^امزج\s+(.+?)\s+(?:و|مع)\s+(.+)$/,x=>{
    clsTrain('إبداع',q);
    const a=terms(x[1])[0],b=terms(x[2])[0],ra=(adj()[a]||[])[0],rb=(adj()[b]||[])[0];
    return ra||rb
      ?'مزج تخيلي: «'+a+'» يضيف «'+(ra?ra[0]:'فكرة')+'» و«'+b+'» يضيف «'+(rb?rb[0]:'زاوية')+'». علاقة إبداعية لا حقيقة.'
      :'أحتاج روابط أكثر عن المفهومين.';
  }))return CM.r;

  if(CM(/^ما علاقة\s+(\S+)\s+(?:بـ|ب|و)\s*(\S+?)\??$/,x=>{
    clsTrain('شبكة',q);
    const p=gpath(terms(x[1])[0],terms(x[2])[0]);
    return p?'🕸 '+p.join(' ↔ '):'🕸 لا رابط بينهما في ما تعلمته';
  }))return CM.r;

  if(CM(/^مفاهيم (?:قريبة )?من\s+(\S+)/,x=>{
    clsTrain('شبكة',q);
    const n=adj()[terms(x[1])[0]];
    return n?'🕸 '+n.slice(0,10).map(v=>v[0]+' ×'+v[1]).join('، '):'🕸 لا روابط بعد';
  }))return CM.r;

  for(const r of S.rules)if(ruleHit(r,q))return r.r.replace(/\{q\}/g,q);

  window.__ATHEER_KB=S.facts;
  for(const sk of S.skills){
    if(S.safeMode&&S.safeMode['skill']&&Date.now()-S.safeMode['skill']<36e5)break;
    let mm=null;
    try{mm=q.match(new RegExp(sk.p,'i'))}catch(e){}
    if(mm){
      try{return await runSkill(sk.c,q,mm)}
      catch(e){err(e,'skill');return '⚠️ المهارة «'+sk.n+'»: '+e.message}
    }
  }

  const intent=clsPredict(q);
  const ctx=await retrieve(q);
  let facts=[];
  if(intent==='حفظ'){
    facts=S.facts.filter(f=>terms(q).every(w=>tk(f.k+' '+f.t).includes(w)||true)).slice(0,3);
  }else{
    const qt=terms(q);
    facts=S.facts.filter(f=>{
      const ft2=tk(f.k);
      return ft2.length&&ft2.every(w=>qt.includes(w));
    }).slice(0,3);
  }
  facts.forEach(f=>F.hit(f));

  const ctxT=facts.map(f=>f.k+': '+f.t).concat(ctx.cs.map(c=>c.txt)).join('\n---\n');
  const strong=(ctx.top>=1.3||ctx.cov>=.6||facts.length>0);

  const extract=()=>{
    const qt=new Set(terms(q)),ss=[];
    ctx.cs.forEach(c=>(c.txt.match(/[^.!؟?\n]+[.!؟?]?/g)||[]).forEach(s=>{
      s=s.trim();
      if(s.length>15)ss.push([tk(s).filter(w=>qt.has(w)).length,s,c.name]);
    }));
    const t=ss.filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,3);
    return t.length
      ?t.map(x=>x[1]).join(' ')+'\n\n📎 '+[...new Set(t.map(x=>x[2]))].join('، ')
      :'';
  };

  S.stat=S.stat||{own:0,llm:0,web:0};
  S.stat[strong?'own':'llm']++;sv('stat');

  if(facts.length&&strong&&S.cfg.memFirst&&(MODE==='auto'||MODE==='memory')){
    return '🧠 '+facts.map(f=>'«'+f.k+'» (ثقة '+Math.round((f.q||.5)*100)+'%): '+f.t).join('\n')
      +(extract()?'\n\n'+extract():'');
  }

  if(MODE!=='memory'){
    if(await ensureLLM()){
      const a=await gen(q,ctxT);
      if(a){
        if(!strong&&a.length>60)F.store('تقطير تلقائي: '+terms(q).slice(0,3).join(' '),a,'distill',.5);
        clsTrain(intent||'سؤال',q);
        return a;
      }
    }
  }

  const ex=extract();
  if(facts.length)return '🧠 '+facts.map(f=>'«'+f.k+'»: '+f.t).join('\n')+(ex?'\n\n'+ex:'');
  if(ex)return ex;

  GAP(q);
  return 'لا أملك جواباً عن «'+q+'» بعد. سجّلتُ الفجوة 🕳 — ارفع ملفاً، أو «قطّر '+q+'» بعد تحميل نموذج.';
}

export async function send(q){
  if(!q||busy)return;
  busy=true;
  S.chat.push({r:'u',t:q});
  if(S.chat.length>200)S.chat.shift();
  sv('chat');bump();
  S.interactions++;sv('interactions');
  S.chat.push({r:'b',t:'💭 ...'});bump();
  try{
    const a=await reply(q);
    S.chat[S.chat.length-1]={r:'b',t:a};
    sv('chat');bump();xp(3);
    if(S.cfg.tts)speak(a);
  }catch(e){
    S.chat[S.chat.length-1]={r:'b',t:'⚠️ '+(e.message||e)};
    sv('chat');bump();err(e,'reply');
  }
  busy=false;
}

export function feedback(up){
  const last=[...S.chat].reverse().find(x=>x.r==='b');
  if(!last)return;
  terms(last.t).slice(0,8).forEach(k=>{
    const f=S.facts.find(x=>x.k===k);
    if(f){
      f.q=Math.max(.05,Math.min(.98,(f.q||.5)+(up?.06:-.08)));
      f.last=Date.now();
    }else if(!up){
      S.facts.push({id:uid(),k,t:'(ثقة منخفضة — راجعها)',src:'flag',q:.15,hits:0,created:Date.now(),last:Date.now()});
    }
  });
  sv('facts');
  toast(up?'👍 رفعت ثقة هذه المفاهيم':'👎 خفّضت الثقة وسأراجعها');
  log(up?'👍':'👎');
}
