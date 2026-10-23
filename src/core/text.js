export const nz=s=>String(s||'').toLowerCase()
  .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
  .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
const STOP=new Set(nz('في من على الى إلى عن مع هذا هذه ذلك التي الذي هو هي ما ماذا كيف لماذا هل كان كانت يكون أن إن لم لن قد له لها ولا لكن أو ثم أيضا the and for are with that this what how who why').split(' '));
export const tk=s=>(nz(s).match(/[\u0621-\u063A\u0641-\u064A\u0660-\u0669a-z0-9]+/g)||[])
  .filter(w=>!STOP.has(w))
  .map(w=>w.replace(/^(?:وال|بال|لل|ال)(?=.{3})/,''))
  .filter(w=>w.length>1);
export const terms=s=>[...new Set(tk(s))];
export const chunks=t=>{const o=[];let c='';
  (t.match(/[^.!؟?؛\n]+[.!؟?؛\n]*/g)||[t]).forEach(x=>{for(let i=0;i<x.length;i+=800){const p=x.slice(i,i+800);
    if((c+p).length>600&&c){o.push(c);c=''}c+=p}});
  if(c)o.push(c);return o};
export const hs=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export const kb=n=>n>=1073741824?(n/1073741824).toFixed(2)+' GB':n>=1048576?(n/1048576).toFixed(1)+' MB':(n/1024).toFixed(0)+' KB';
const hasCS=typeof CompressionStream!=='undefined';
export const gz=s=>hasCS?new Response(new Blob([s]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer():new TextEncoder().encode(s).buffer;
export const ungz=b=>hasCS?new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text():new TextDecoder().decode(b);
