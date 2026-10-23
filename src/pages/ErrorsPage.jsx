import {S,sv,toast} from '../core/store.js';
import {Item,Badge} from '../components/ui.jsx';

export default function ErrorsPage(){
  const sm=S.safeMode||{};
  return <div className="card">
    <h3>⚠️ سجل الأخطاء والوضع الآمن</h3>
    <p className="hint">تكرار الخطأ في سياق واحد 3 مرات يُفعّل «الوضع الآمن» له ساعة (يعطّل المهارات المعزولة مثلاً).</p>
    <p className="hint">السياقات: {Object.keys(S.errCtx||{}).length?Object.entries(S.errCtx).map(([k,v])=>k+' ×'+v).join('، '):'لا أخطاء ✨'}</p>
    {Object.keys(sm).length>0&&<p className="hint">🔒 الوضع الآمن نشط لـ: {Object.keys(sm).join('، ')}</p>}
    <div className="row">
      <button className="b dn" onClick={()=>{S.errs=[];S.errCtx={};sv('errs');sv('errCtx');toast('🧹 مُسح')}}>🧹 مسح السجل</button>
      <button className="b" onClick={()=>{S.safeMode={};sv('safeMode');toast('✅ أُلغي الوضع الآمن')}}>✅ إلغاء الوضع الآمن</button>
    </div>
    <h4>آخر الأخطاء</h4>
    {S.errs.slice(0,30).map((e,i)=><Item key={i} title={'⚠️ '+e.m} sub={new Date(e.t).toLocaleString('ar')+' • '+e.w}/>)}
    {!S.errs.length&&<p className="hint">السجل فارغ.</p>}
  </div>;
}
