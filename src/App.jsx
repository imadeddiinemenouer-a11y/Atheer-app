import {useEffect,useReducer,useState} from 'react';
import {S,subscribe} from './core/store.js';
import Chat from './pages/Chat.jsx';
import Library from './pages/Library.jsx';
import Knowledge from './pages/Knowledge.jsx';
import Learn from './pages/Learn.jsx';
import ModelPage from './pages/ModelPage.jsx';
import GgufPage from './pages/GgufPage.jsx';
import GraphPage from './pages/GraphPage.jsx';
import RulesPage from './pages/RulesPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import BackupPage from './pages/BackupPage.jsx';
import SyncPage from './pages/SyncPage.jsx';
import ErrorsPage from './pages/ErrorsPage.jsx';
import SysPage from './pages/SysPage.jsx';
import Stealth from './components/Stealth.jsx';

const PAGES=[
  ['chat','💬','المحادثة',Chat],['lib','📚','المكتبة',Library],
  ['kb','🧠','المعرفة',Knowledge],['learn','🧭','التعلّم',Learn],
  ['model','🤖','النموذج',ModelPage],['gguf','🔬','بصمة GGUF',GgufPage],
  ['graph','🕸','الشبكة',GraphPage],['rules','📐','القواعد',RulesPage],
  ['tasks','🗂','المفكرة',TasksPage],['backup','💾','النسخ',BackupPage],
  ['sync','☁️','المزامنة',SyncPage],['errs','⚠️','الأخطاء',ErrorsPage],
  ['sys','🩺','النظام',SysPage]
];

export default function App(){
  const[,f]=useReducer(x=>x+1,0);
  useEffect(()=>subscribe(f),[]);
  const [page,setPage]=useState(()=>(location.hash||'#/chat').slice(2));
  useEffect(()=>{
    const h=()=>setPage((location.hash||'#/chat').slice(2));
    addEventListener('hashchange',h);
    return()=>removeEventListener('hashchange',h);
  },[]);
  if(!S.ready)return <div className="boot">✦ أثير v12 — يستيقظ…</div>;
  if(S.cfg.stealth)return <Stealth/>;
  const cur=PAGES.find(p=>p[0]===page)||PAGES[0];
  const C=cur[3];
  return <div>
    <header><h1>✦ أثير <span className="v">v12 الموحّد</span><span id="ver">v12</span></h1>
      <div className="sub"><span className={'dot '+(S.cfg.web&&!S.cfg.strict&&navigator.onLine?'on':'')}/> نواة موحّدة · React · محلي أولاً</div></header>
    <nav>{PAGES.map(p=><button key={p[0]} className={p[0]===cur[0]?'on':''}
      onClick={()=>location.hash='/'+p[0]}>{p[1]} {p[2]}</button>)}</nav>
    <main><C/></main>
  </div>;
}
