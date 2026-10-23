import {S,sv,log} from './store.js';
import {uid,terms} from './text.js';

export const F={
  byKey:k=>S.facts.find(f=>f.k===k),
  store(k,t,src='manual',conf=.7){
    if(!k||!t)return;
    const old=F.byKey(k);
    if(old){old.t=t;old.src=src;old.q=Math.max(old.q||.5,conf);old.last=Date.now()}
    else S.facts.push({id:uid(),k,t,src,q:conf,hits:0,created:Date.now(),last:Date.now()});
    sv('facts');
  },
  hit(f){f.hits=(f.hits||0)+1;f.last=Date.now();sv('facts')},
  decay(){
    const now=Date.now();let ch=0;
    S.facts.forEach(f=>{
      if(now-(f.last||0)<36e5)return;
      const hours=(now-(f.last||f.created))/(36e5);
      const d=Math.exp(-hours/24);
      const q=.4+((f.q||.5)-.4)*d;
      if(Math.abs(q-(f.q||.5))>.01){f.q=Math.max(.08,Math.min(.98,q));ch++}
    });
    if(ch){sv('facts');log('💭 انحلال ذاكرة: '+ch+' حقيقة أُعيد تقدير ثقتها')}
  },
  forget(){
    const max=500;
    if(S.facts.length<=max)return 0;
    const sc=f=>((f.q||.5)*2+(f.hits||0)*.5+(Date.now()-f.last<6048e5?1:0)+(f.src==='manual'?1.5:0));
    S.facts.sort((a,b)=>sc(b)-sc(a));
    const cut=S.facts.splice(max);
    sv('facts');return cut.length;
  },
  forgetOld(){
    const t0=Date.now(),cut=[];
    S.facts=S.facts.filter(f=>{
      const idle=t0-(f.last||f.created);
      if(idle>2592e6&&(f.src==='web'||f.src==='distill')&&!((f.hits||0)>2)){cut.push(f.k);return false}
      return true;
    });
    if(cut.length){sv('facts');log('🧹 نسيت '+cut.length+' معرفة قديمة')}
    return cut.length;
  },
  verify(k,t){
    const qt=terms(k+' '+t),neg=/ليس|لا |لم |لن |غير/.test(t);
    const con=[];
    for(const f of S.facts){
      if(f.k===k)continue;
      const ft=terms(f.k+' '+f.t);
      const ov=qt.filter(w=>ft.includes(w)).length;
      if(ov>=2&&(/ليس|لا |لم |لن |غير/.test(f.t)!==neg))con.push(f.k);
    }
    return {ok:!con.length,con:con.slice(0,4)};
  },
  quality(){
    const qs=S.facts.map(f=>f.q||.5);
    return qs.length?qs.reduce((a,b)=>a+b,0)/qs.length:.5;
  }
};
