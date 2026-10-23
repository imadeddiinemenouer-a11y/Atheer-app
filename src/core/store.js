import {P,G} from './db.js';

export const S={
  chat:[],facts:[],gaps:{},rules:[],skills:[],tasks:[],notes:[],
  xp:0,interactions:0,stat:{own:0,llm:0,web:0},dist:{},
  cls:{labels:{},vocab:{},trained:0},
  cfg:{web:0,strict:1,auto:0,tts:0,memFirst:1,act:'',vc:1,stealth:0,sync:{}},
  errs:[],logs:[],learned:0,errCtx:{},safeMode:{},builds:[],
  ready:false
};

const listeners=new Set();
export function subscribe(f){listeners.add(f);return()=>listeners.delete(f)}
export function bump(){listeners.forEach(f=>f())}

const timers={};
export function sv(k){clearTimeout(timers[k]);timers[k]=setTimeout(()=>P('kv',k,S[k]),300)}
export function svNow(k){return P('kv',k,S[k])}
export const KEYS=['chat','facts','gaps','rules','skills','tasks','notes','xp','interactions','stat','dist','cls','cfg','errs','logs','learned','errCtx','safeMode','builds'];

export async function loadAll(){for(const k of KEYS){const v=await G('kv',k);if(v!=null)S[k]=v}}

export function toast(msg){
  const el=document.createElement('div');
  el.className='ts';el.textContent=msg;document.body.appendChild(el);
  setTimeout(()=>el.remove(),2600);
}
export function log(m){
  S.logs.push('['+new Date().toLocaleTimeString('ar')+'] '+m);
  if(S.logs.length>200)S.logs.shift();
  sv('logs');bump();
}
export function xp(n){S.xp=(S.xp||0)+n;sv('xp');bump()}
