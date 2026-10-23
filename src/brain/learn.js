import {S,sv,xp,log,toast} from '../core/store.js';
import {err} from '../core/errors.js';
import {terms} from '../core/text.js';
import {F} from '../core/memory.js';
import {LM,ensureLLM,useModel,genRaw} from '../core/llm.js';
import {AK} from '../core/db.js';
import {_fetch} from '../core/guard.js';
import {ingest} from '../core/bm25.js';

let stopFlag=false;
export function stopAll(){stopFlag=true}

export async function distill(topic,n=4,onStep){
  if(!await ensureLLM())throw new Error('حمّل نموذجاً أولاً');
  const Q=['ما هو «'+topic+'»؟','اشرح «'+topic+'» ببساطة مع مثال.',
    'ما أهم المفاهيم المرتبطة بـ «'+topic+'»؟','ما أخطاء شائعة حول «'+topic+'»؟'].slice(0,n);
  let done=0;stopFlag=false;
  for(const q of Q){
    if(stopFlag)break;
    let ans='';
    try{
      ans=await genRaw(q);
      if(/لا أعرف|غير مؤكد/i.test(ans)&&ans.length<70)ans='';
    }catch(e){err(e,'distill')}
    if(ans&&ans.length>30){
      const chk=F.verify(topic,ans);
      F.store('تقطير: '+topic,ans,'distill',chk.ok?.65:.4);
      S.dist[LM.name]=(S.dist[LM.name]||0)+1;sv('dist');
      log('⚗️ '+q.slice(0,50));
    }
    done++;
    if(onStep)onStep(done,Q.length,q);
    await new Promise(r=>setTimeout(r,100));
  }
  xp(15);S.learned=(S.learned||0)+done;sv('learned');
  return done;
}
export async function distillGaps(onStep){
  const gs=Object.entries(S.gaps).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(!gs.length)return 0;
  let n=0;
  for(const [g] of gs){
    if(stopFlag)break;
    try{n+=await distill(g,3,onStep)}catch(e){err(e,'gaps')}
    delete S.gaps[g];
  }
  sv('gaps');
  return n;
}
export async function teachAll(topic,onStep){
  const ks=(await AK('model'))||[];
  let n=0;
  for(const k of ks){
    if(stopFlag)break;
    toast('⚗️ '+k.replace(/^gguf:/,''));
    await useModel(k);
    if(LM.ready)n+=Math.max(0,await distill(topic,3,onStep));
  }
  return n;
}
export async function webLearn(q){
  const out=[];
  for(const L of['ar','en']){
    try{
      const j=JSON.parse(await _fetch('https://'+L+'.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=2&prop=extracts&exintro=1&explaintext=1&exlimit=2&gsrsearch='+encodeURIComponent(q)).then(r=>r.text()));
      Object.values((j.query&&j.query.pages)||{}).forEach(x=>x.extract&&out.push({t:x.title,x:x.extract}));
    }catch(e){}
  }
  let n=0;
  for(const x of out)if(await ingest('ويب: '+x.t,x.t+'\n'+x.x,'web')>0)n++;
  if(n){
    out.slice(0,2).forEach(x=>F.store('ويب: '+x.t,x.x.slice(0,600),'web',.55));
    S.stat.web+=n;sv('stat');
  }
  return {out,n};
}
