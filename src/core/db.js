let db;
export function open(){
  if(db) return Promise.resolve(db);
  return new Promise(res=>{ try{
    const q=indexedDB.open('atheer12',1);
    q.onupgradeneeded=()=>['kv','chunk','doc','model'].forEach(n=>q.result.createObjectStore(n));
    q.onsuccess=()=>res(db=q.result);
    q.onerror=()=>res(null);
  }catch(e){res(null)} });
}
export function tx(s,m,f){
  return open().then(d=>d?new Promise(r=>{ try{
    const t=d.transaction(s,m),q=f(t.objectStore(s));
    t.oncomplete=()=>r(q&&q.result); t.onerror=t.onabort=()=>r();
  }catch(e){r()} }):undefined);
}
export const P=(s,k,v)=>tx(s,'readwrite',o=>o.put(v,k));
export const G=(s,k)=>tx(s,'readonly',o=>o.get(k));
export const D=(s,ks)=>tx(s,'readwrite',o=>[].concat(ks).forEach(k=>o.delete(k)));
export const AK=s=>tx(s,'readonly',o=>o.getAllKeys());
export const ALL=s=>tx(s,'readonly',o=>o.getAll());
export const PM=(s,rows)=>tx(s,'readwrite',o=>rows.forEach(r=>o.put(r[1],r[0])));
