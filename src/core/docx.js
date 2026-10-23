export async function docxText(buf){
  const v=new DataView(buf),u=new Uint8Array(buf);
  let e=buf.byteLength-22;
  while(e>0&&v.getUint32(e,true)!==0x06054b50)e--;
  if(e<=0)throw new Error('ليست ملف docx صالح');
  let n=v.getUint16(e+10,true),p=v.getUint32(e+16,true);
  for(;n--;){
    const m=v.getUint16(p+10,true),cs=v.getUint32(p+20,true),nl=v.getUint16(p+28,true),
      xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),lo=v.getUint32(p+42,true);
    if(new TextDecoder().decode(u.subarray(p+46,p+46+nl))==='word/document.xml'){
      const st=lo+30+v.getUint16(lo+26,true)+v.getUint16(lo+28,true),d=u.subarray(st,st+cs);
      const x=m===0?new TextDecoder().decode(d)
        :await new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
      return x.replace(/<\/w:p>/g,'\n').replace(/<[^>]+>/g,'')
        .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');
    }
    p+=46+nl+xl+cl;
  }
  throw new Error('لم أجد المحتوى النصي');
}
