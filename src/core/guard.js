import {S} from './store.js';

const LOCAL=new Set(['localhost','127.0.0.1','::1']);
const _fetch=window.fetch.bind(window);
export {_fetch};

window.fetch=function(input,init){
  try{
    const raw=typeof input==='string'?input:(input&&input.url)||String(input);
    const u=new URL(raw,location.href);
    if(u.protocol==='blob:'||u.protocol==='data:')return _fetch(input,init);
    if(u.origin!==location.origin&&!LOCAL.has(u.hostname)){
      if(S.cfg.strict)return Promise.reject(new TypeError('الوضع المحلي الصارم يمنع الاتصال الخارجي'));
      if(!S.cfg.web)return Promise.reject(new TypeError('الإنترنت معطّل — فعّله من صفحة التعلّم'));
    }
    return _fetch(input,init);
  }catch(e){return Promise.reject(e)}
};
