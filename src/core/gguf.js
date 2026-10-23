export async function ggufFingerprint(file){
  const buf=await file.slice(0,Math.min(file.size,4*1048576)).arrayBuffer();
  const v=new DataView(buf);
  const magic=v.getUint32(0,true);
  if(magic!==0x46554747)throw new Error('ليست GGUF (البايتات السحرية غير مطابقة)');
  const ver=v.getUint32(4,true),nt=v.getBigUint64(8,true),nk=Number(v.getBigUint64(16,true));
  let pos=24;const meta={};
  const gstr=()=>{const len=Number(v.getBigUint64(pos,true));pos+=8;
    const s=new TextDecoder().decode(new Uint8Array(buf,pos,Math.min(len,4096)));pos+=len;return s};
  const gval=t=>{switch(t){
    case 0:return v.getUint8(pos++);
    case 1:{const x=v.getInt8(pos);pos+=1;return x}
    case 2:{const x=v.getUint16(pos,true);pos+=2;return x}
    case 3:{const x=v.getInt16(pos,true);pos+=2;return x}
    case 4:{const x=v.getUint32(pos,true);pos+=4;return x}
    case 5:{const x=v.getInt32(pos,true);pos+=4;return x}
    case 6:{const x=v.getFloat32(pos,true);pos+=4;return x}
    case 7:pos+=1;return null;
    case 8:return gstr();
    case 9:{const el=v.getUint32(pos,true);pos+=4;const n2=Number(v.getBigUint64(pos,true));pos+=8;pos+=n2*elsize(el);return '[ثابت]'}
    case 10:{const et=v.getUint32(pos,true);pos+=4;const n3=Number(v.getBigUint64(pos,true));pos+=8;pos+=n3*(1+elsize(et));return '[مصفوفة]'}
    case 11:{pos+=4;const kt=v.getUint32(pos,true);pos+=4;const vt=v.getUint32(pos,true);pos+=4;
      const nm=Number(v.getBigUint64(pos,true));pos+=8;
      for(let i=0;i<nm;i++){gstr();gval(vt)}return '[خريطة]'}
    case 12:{const bt=v.getUint32(pos,true);pos+=4;return gval(bt)}
    default:throw new Error('نوع غير معروف '+t)}};
  const elsize=t=>[1,1,2,2,4,4,4,1,0,0,0,0][t]||0;
  for(let i=0;i<nk&&pos<buf.byteLength-32;i++){
    try{const k=gstr(),t=v.getUint32(pos,true);pos+=4;
      const val=gval(t);
      if(val!=null&&k.length<120)meta[k]=val;
    }catch(e){break}
  }
  let est=0;
  try{
    for(let i=0;i<Math.min(Number(nt),400)&&pos<buf.byteLength-64;i++){
      gstr();const nd=v.getUint32(pos,true);pos+=4;
      let elems=1;
      for(let j=0;j<nd&&pos<buf.byteLength-8;j++){elems*=Number(v.getBigUint64(pos,true));pos+=8}
      const typ=v.getUint32(pos,true);pos+=4;pos+=8;
      const sz=[0,1,2,2,4,4,4,8,0,0,0,0,0][typ]||4;
      est+=elems*sz;if(est>1e13)break;
    }
  }catch(e){}
  return {name:meta['general.name']||file.name,arch:meta['general.architecture']||'?',ver,
    tensors:Number(nt),estParams:est,meta};
}
