import {S,sv,toast} from './store.js';

export function err(e,w){
  w=w||'unknown';
  try{
    S.errCtx[w]=(S.errCtx[w]||0)+1;
    if(S.errCtx[w]>=3&&!S.safeMode[w]){
      S.safeMode[w]=Date.now();
      toast('⚠️ وضع آمن: عُطّل «'+w+'» ساعة');
    }
    S.errs.unshift({t:Date.now(),w,m:String(e&&e.message||e).slice(0,180)});
    S.errs.length=Math.min(S.errs.length,40);
    sv('errs');sv('errCtx');sv('safeMode');
  }catch(_){}
}
addEventListener('error',e=>err(e.error||e.message,'window'));
addEventListener('unhandledrejection',e=>err(e.reason,'promise'));
