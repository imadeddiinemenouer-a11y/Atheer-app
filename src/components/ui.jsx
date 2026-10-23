import {esc} from '../core/text.js';

export function Card({title,children}){
  return <div className="card"><h3>{title}</h3>{children}</div>;
}
export function Item({title,sub,actions}){
  return <div className="it">
    <span className="tx" dangerouslySetInnerHTML={{__html:esc(title)+(sub?' <small>'+esc(sub)+'</small>':'')}}/>
    {actions}
  </div>;
}
export function Badge({cls,children}){
  return <span className={'badge '+(cls||'')}>{children}</span>;
}
