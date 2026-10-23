import { Wllama } from '@wllama/wllama';
import { P,G,AK,D } from './db.js';
import { S,sv,toast,log } from './store.js';
import { err } from './errors.js';

export const LM={w:null,ready:false,busy:false,name:''};

export async function loadModelFile(f,keep){
  if(LM.busy)return;
  LM.busy=true;
  if(LM.w){try{await LM.w.exit()}catch(e){}LM.w=null;LM.ready=false}
  try{
    if(!(f instanceof File))f=new File([f],'model.gguf');
    
    // ✅ نمرر المسار المحلي الذي رفعته يدوياً في مجلد dist
    LM.w = new Wllama({
      'wllama.wasm': './wllama.wasm' 
    });
    
    await LM.w.loadModel([f],{n_gpu_layers:0});
    LM.ready=true;LM.name=f.name;
    if(keep){
      await P('model','gguf:'+f.name,f);
      S.cfg.act='gguf:'+f.name;sv('cfg');
      toast('🤖 جاهز وحُفظ');
    }else toast('🤖 جاهز: '+f.name);
    log('🤖 نموذج محمّل: '+f.name);
  }catch(e){err(e,'model');toast('⚠️ '+(e.message||e).toString().slice(0,90))}
  LM.busy=false;
}

export async function useModel(k){
  const b=await G('model',k);
  if(!b)return toast('النموذج غير موجود');
  S.cfg.act=k;sv('cfg');
  await loadModelFile(new File([b],k.replace(/^gguf:/,'')),false);
}
export async function unloadLLM(){
  try{if(LM.w)await LM.w.exit()}catch(e){}
  LM.w=null;LM.ready=false;LM.name='';
  toast('⏸ أُفرغ النموذج');log('⏸ أُفرغ النموذج');
}
export async function ensureLLM(){
  if(LM.ready)return true;
  if(LM.busy)return false;
  const ks=(await AK('model'))||[];
  const k=ks.includes(S.cfg.act)?S.cfg.act:ks[0];
  if(k)await useModel(k);
  return LM.ready;
}
export async function gen(q,ctx){
  if(!LM.ready)throw new Error('لا نموذج');
  const m=[{role:'system',content:'أنت «أثير» مساعد عربي موجز ودقيق يعمل محلياً. اعتمد على المعرفة المقدمة إن وُجدت، وإن لم تعرف فقل ذلك صراحة ولا تخترع.'}];
  S.chat.slice(-7).forEach(x=>m.push({role:x.r==='u'?'user':'assistant',content:String(x.t).slice(0,300)}));
  m.push({role:'user',content:(ctx?'معارف:\n'+ctx+'\n\n':'')+'السؤال: '+q});
  LM.busy=true;
  try{
    const r=await LM.w.createChatCompletion({messages:m,max_tokens:340,temperature:.4,top_k:40,top_p:.9});
    return r.choices[0].message.content.trim();
  }finally{LM.busy=false}
}
export async function genRaw(q){
  LM.busy=true;
  try{
    const r=await LM.w.createChatCompletion({messages:[
      {role:'system',content:'أجب بالعربية باختصار. إن لم تكن متأكداً فصرّح بعدم اليقين.'},
      {role:'user',content:q}],max_tokens:320,temperature:.3});
    return r.choices[0].message.content.trim();
  }finally{LM.busy=false}
}
