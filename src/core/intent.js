import {S,sv} from './store.js';
import {tk} from './text.js';

export function clsTrain(label,text){
  const ws=tk(text);
  if(!ws.length||!label)return;
  const L=S.cls.labels[label]=S.cls.labels[label]||{n:0,words:{}};
  L.n++;S.cls.trained++;
  ws.forEach(w=>{L.words[w]=(L.words[w]||0)+1;S.cls.vocab[w]=(S.cls.vocab[w]||0)+1});
  sv('cls');
}
export function clsPredict(text){
  const ws=tk(text),labels=Object.keys(S.cls.labels);
  if(!labels.length||!ws.length)return null;
  const V=Object.keys(S.cls.vocab).length+1;
  let best=null,bp=0;
  labels.forEach(l=>{
    const L=S.cls.labels[l];
    let p=(L.n+1)/(S.cls.trained+labels.length);
    ws.forEach(w=>{p*=((L.words[w]||0)+1)/(L.n+V)});
    p=Math.log(p);
    if(p>bp){bp=p;best=l}
  });
  return best?{intent:best,logp:bp}:null;
}
const SEED=[
  ['تحية','مرحبا أهلا السلام عليكم صباح الخير مساء الخير هلا أهلين'],
  ['مهمة','مهمة أضف اكتب لي تذكير ذكّرني افعل اشتري'],
  ['ملاحظة','ملاحظة دوّن سجل خذ بعين الاعتبار'],
  ['حفظ','تعلم هو تساوي تعرف أن اذكر معلومة حقيقة'],
  ['تقطير','قطّر تعلم من النموذج استخلص اشرح موضوعا'],
  ['إبداع','استعارة امزج قصة اكتب لي قصة خيال'],
  ['بحث','ابحث ابحث عن ابحث في الإنترنت ويكيبيديا'],
  ['شبكة','ما علاقة مفاهيم قريبة المسار بين الروابط']
];
export function seedIntents(){SEED.forEach(([l,t])=>{if(!S.cls.labels[l])clsTrain(l,t)})}
