import {_fetch} from './guard.js';
import {S,sv,toast,log} from './store.js';
import {err} from './errors.js';
import {Gr} from './graph.js';

export function snap(){
  return {format:'atheer12-sync',t:Date.now(),
    facts:S.facts,tasks:S.tasks,notes:S.notes,rules:S.rules,skills:S.skills,
    gaps:S.gaps,cls:S.cls,chat:S.chat.slice(-40),
    graph:{n:Gr.n,e:Gr.e}};
}
export function mergeRemote(d){
  let n=0;if(!d)return 0;
  const add=(arr,items)=>{if(!Array.isArray(items))return;
    items.forEach(x=>{if(x&&x.id&&!arr.some(y=>y.id===x.id)){arr.push(x);n++}})};
  add(S.facts,d.facts);add(S.tasks,d.tasks);add(S.notes,d.notes);
  (d.rules||[]).forEach(r=>{if(r&&!S.rules.some(x=>x.p===r.p&&x.r===r.r)){S.rules.push(r);n++}});
  (d.skills||[]).forEach(s=>{if(s&&!S.skills.some(x=>x.n===s.n)){S.skills.push(s);n++}});
  if(d.cls&&d.cls.labels){
    for(const l in d.cls.labels){
      const L=d.cls.labels[l];
      if(!S.cls.labels[l]){S.cls.labels[l]=L;S.cls.trained+=L.n||0;n++}
    }
  }
  if(d.graph){
    for(const k in (d.graph.n||{}))Gr.n[k]=(Gr.n[k]||0)+d.graph.n[k];
    for(const k in (d.graph.e||{}))Gr.e[k]=(Gr.e[k]||0)+d.graph.e[k];
  }
  return n;
}
export async function syncNow(push){
  const y=S.cfg.sync=S.cfg.sync||{};
  if(!y.url||!y.user){toast('⚙️ اضبط رابط WebDAV أولاً');return}
  if(S.cfg.strict){toast('🔒 الوضع الصارم يمنع الاتصال — عطّله من التعلّم');return}
  if(!S.cfg.web&&!confirm('الإنترنت معطّل — أسمح به مؤقتاً للمزامنة؟'))return;
  try{
    const url=y.url.replace(/\/$/,'')+'/'+(y.file||'atheer_sync.json');
    const auth='Basic '+btoa(y.user+':'+y.pass);
    let added=0;
    try{
      const g=await _fetch(url,{headers:{Authorization:auth}});
      if(g.ok)added=mergeRemote(await g.json());
    }catch(e){}
    const r=await _fetch(url,{method:'PUT',headers:{Authorization:auth,'Content-Type':'application/json'},body:JSON.stringify(snap())});
    if(!r.ok)throw new Error('HTTP '+r.status);
    y.lastSync=Date.now();sv('cfg');
    ['facts','tasks','notes','rules','skills','gaps','cls','chat'].forEach(sv);
    if(push)toast('☁️ تمت المزامنة'+(added?' — استلمت '+added+' عنصر':''));
    log('☁️ مزامنة WebDAV'+(added?' (+ '+added+')':''));
  }catch(e){err(e,'sync');if(push)toast('☁️ فشلت: '+e.message)}
}
