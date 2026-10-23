export const Gr={n:{},e:{}};

export function link(top){
  for(let i=0;i<top.length;i++){
    Gr.n[top[i]]=(Gr.n[top[i]]||0)+1;
    for(let j=i+1;j<top.length;j++){
      const k=[top[i],top[j]].sort().join('|');
      Gr.e[k]=(Gr.e[k]||0)+1;
    }
  }
  const ks=Object.keys(Gr.e);
  if(ks.length>6000){
    const ne={};
    ks.sort((a,b)=>Gr.e[b]-Gr.e[a]).slice(0,5000).forEach(k=>ne[k]=Gr.e[k]);
    Gr.e=ne;
  }
}
export function adj(){
  const a={};
  for(const k in Gr.e){
    const [x,y]=k.split('|'),w=Gr.e[k];
    (a[x]=a[x]||[]).push([y,w]);
    (a[y]=a[y]||[]).push([x,w]);
  }
  for(const k in a)a[k].sort((p,q)=>q[1]-p[1]);
  return a;
}
export function gpath(a,b){
  if(!a||!b)return null;
  if(a===b)return[a];
  const A=adj(),prev={[a]:null};let fr=[a];
  for(let d=0;d<4&&fr.length;d++){
    const nx=[];
    for(const u of fr)for(const [v] of (A[u]||[]).slice(0,25)){
      if(v in prev)continue;
      prev[v]=u;
      if(v===b){const p=[];for(let c=b;c!==null;c=prev[c])p.push(c);return p.reverse()}
      nx.push(v);
    }
    fr=nx;
  }
  return null;
}
export function loadGraph(g){if(g){Gr.n=g.n||{};Gr.e=g.e||{}}}
