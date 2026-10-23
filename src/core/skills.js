export function ruleHit(x,q){
  try{
    if(/^\/.+\/$/.test(x.p))return new RegExp(x.p.slice(1,-1),'i').test(q);
    const t=x.p.toLowerCase().split(/\s+/).filter(w=>w.length>1);
    const qt=q.toLowerCase();
    return t.length>0&&t.every(w=>qt.includes(w));
  }catch(e){return false}
}
export function runSkill(code,input,m){
  return new Promise(res=>{
    const src='self.onmessage=function(e){var d=e.data;'
      +'function tk(s){return String(s).toLowerCase().split(/\\s+/).filter(function(w){return w.length>2;});}'
      +'try{var facts={};d.kb.forEach(function(f){facts[f.k]=f.t});'
      +'var api={facts:function(k){return facts[k]||null},kb:d.kb,tk:tk,now:Date.now()};'
      +'var fn=new Function("input","m","api",d.code);var r=fn(d.input,d.m,api);'
      +'Promise.resolve(r).then(function(x){self.postMessage({ok:true,result:String(x==null?"✔ نُفّذت المهارة":x)})},function(err){self.postMessage({ok:false,error:String(err)})});'
      +'}catch(err){self.postMessage({ok:false,error:String(err)})}}';
    let url,w;
    const fin=v=>{try{w.terminate();URL.revokeObjectURL(url)}catch(e){}res(v)};
    try{
      url=URL.createObjectURL(new Blob([src],{type:'application/javascript'}));
      w=new Worker(url);
      const t=setTimeout(()=>fin('⏱ انتهت مهلة المهارة (4 ثوانٍ)'),4000);
      w.onmessage=e=>{clearTimeout(t);fin(e.data.ok?e.data.result:'⚠️ '+e.data.error)};
      w.onerror=e=>{clearTimeout(t);fin('⚠️ '+e.message)};
      w.postMessage({code,input,m:Array.from(m||[]),kb:(window.__ATHEER_KB||[]).slice(0,400)});
    }catch(e){fin('⚠️ '+e.message)}
  });
}
