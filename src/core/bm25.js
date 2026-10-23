import {P,G,D,PM} from './db.js';
import {tk,chunks,hs,gz,ungz} from './text.js';
import {link} from './graph.js';
import {S,xp,log} from './store.js';

export const IX={N:0,len:0,post:{},cl:{}};
export const DM={};
const BUDGET=2*1073741824,MAXCH=120000;
let ixT=null;
export function saveIx(){clearTimeout(ixT);ixT=setTimeout(async()=>P('kv','ix',await gz(JSON.stringify(IX))),1500)}

export async function ingest(name,text,kind){
  text=String(text).replace(/\r/g,'').replace(/[ \t]+/g,' ').trim().slice(0,300000);
  if(text.length<20)return 0;
  const h=hs(text);
  if(Object.values(DM).some(d=>d.h===h))return -1;
  const id='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const parts=chunks(text),rows=[],ids=[];let z=0;
  for(let i=0;i<parts.length;i++){
    const cid=id+'_'+i,t=tk(parts[i]),tf={};
    t.forEach(w=>tf[w]=(tf[w]||0)+1);
    for(const w in tf)(IX.post[w]=IX.post[w]||{})[cid]=tf[w];
    IX.cl[cid]=t.length;IX.N++;IX.len+=t.length;
    const top=Object.entries(tf).filter(x=>x[0].length>3).sort((a,b)=>b[1]-a[1]).slice(0,6).map(x=>x[0]);
    link(top);
    const b=await gz(parts[i]);z+=b.byteLength;
    rows.push([cid,{d:id,z:b}]);ids.push(cid);
  }
  await PM('chunk',rows);
  DM[id]={id,name,kind,t:Date.now(),used:Date.now(),h,size:text.length,zsize:z,ids};
  await P('doc',id,DM[id]);
  saveIx();xp(Math.min(20,ids.length));
  if(IX.N>MAXCH||totZ()>BUDGET)await evictDocs();
  return ids.length;
}
export const totZ=()=>Object.values(DM).reduce((a,d)=>a+d.zsize,0);

export async function rmDoc(id){
  const d=DM[id];if(!d)return;
  const s=new Set(d.ids);
  for(const w in IX.post){
    const p=IX.post[w];
    for(const c in p)if(s.has(c))delete p[c];
    if(!Object.keys(p).length)delete IX.post[w];
  }
  d.ids.forEach(c=>{IX.len-=IX.cl[c]||0;delete IX.cl[c];IX.N--});
  await D('chunk',d.ids);await D('doc',id);
  delete DM[id];saveIx();
}
export async function evictDocs(){
  let n=0;
  while(Object.keys(DM).length&&(totZ()>BUDGET||IX.N>MAXCH)){
    await rmDoc(Object.values(DM).sort((a,b)=>a.used-b.used)[0].id);n++;
  }
  return n;
}
function rank(q,k){
  const t=terms(q),sc={},N=IX.N||1,avg=IX.len/N||1;
  t.forEach(w=>{const p=IX.post[w];if(!p)return;
    const ids=Object.keys(p),idf=Math.log(1+(N-ids.length+.5)/(ids.length+.5));
    ids.forEach(id=>{const f=p[id],dl=IX.cl[id]||avg;
      sc[id]=(sc[id]||0)+idf*f*2.2/(f+1.2*(.25+.75*dl/avg))})});
  return Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,k||4);
}
import {terms} from './text.js';
export async function retrieve(q,k){
  const r=rank(q,k||4),out=[];
  for(const [cid] of r){
    const row=await G('chunk',cid);if(!row)continue;
    const d=DM[row.d];
    if(d){d.used=Date.now();P('doc',d.id,d)}
    out.push({txt:await ungz(row.z),name:d?d.name:'؟'});
  }
  const qt=terms(q);
  const cov=out.length&&qt.length?qt.filter(w=>terms(out[0].txt).includes(w)).length/qt.length:0;
  return {cs:out,top:r.length?r[0][1]:0,cov};
}
