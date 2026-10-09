(() => {
  const key = 'moscow-handbook-v2-draft';
  const original = structuredClone(window.HANDBOOK);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function validate(value) {
    let count=0;
    function walk(a,b,path) {
      if (++count>5000) throw new Error('항목 수가 너무 많습니다.');
      if (typeof b==='string') {
        if(typeof a!=='string'||a.length>30000) throw new Error(path+' 항목은 30,000자 이하의 문장이어야 합니다.');
        if(path.endsWith('.id')&&a!==b) throw new Error('고정 식별자는 바꿀 수 없습니다: '+path);
        if(path.endsWith('.faction')&&a!==b) throw new Error('세력 식별자가 일치하지 않습니다.');
        if(path.endsWith('.image')&&a&&!imageURL(a))throw new Error('이미지 주소를 확인하세요: '+path);
        if(path.endsWith('.url')&&!/^https?:\/\//i.test(a))throw new Error('자료 링크는 http 또는 https 주소여야 합니다.');
        for(const m of a.matchAll(/\[\[([^\]]+)\]\]/g))if(!Object.hasOwn(value.terms||{},m[1]))throw new Error('등록되지 않은 주석: '+m[1]);
        return;
      }
      if(typeof b==='number'){if(a!==b)throw new Error('V2 형식의 JSON이 필요합니다.');return;}
      if(Array.isArray(b)){if(!Array.isArray(a)||a.length!==b.length)throw new Error(path+'의 항목 수가 일치하지 않습니다.');b.forEach((v,i)=>walk(a[i],v,path+'.'+i));return;}
      if(!a||typeof a!=='object'||Array.isArray(a)||Object.keys(a).length!==Object.keys(b).length)throw new Error(path+'의 구조가 일치하지 않습니다.');
      for(const k of Object.keys(b)){if(!Object.hasOwn(a,k))throw new Error('빠진 항목: '+path+'.'+k);walk(a[k],b[k],path?path+'.'+k:k);}
    }
    walk(value,original,'');return structuredClone(value);
  }
  function imageURL(value){
    if(!value)return '';
    if(/^assets\/[a-z0-9_-]+\.(png|jpe?g|webp)$/i.test(value))return value;
    try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol))return '';if(u.hostname==='github.com'&&u.pathname.includes('/blob/')){u.hostname='raw.githubusercontent.com';u.pathname=u.pathname.replace('/blob/','/');u.search='';}return u.href;}catch{return '';}
  }
  let storageError='';
  function load(){try{const raw=localStorage.getItem(key);return raw?validate(JSON.parse(raw)):structuredClone(original);}catch(e){storageError='저장된 초안을 읽지 못해 원본을 표시합니다.';return structuredClone(original);}}
  function save(data){const checked=validate(data);try{localStorage.setItem(key,JSON.stringify(checked));}catch{throw new Error('브라우저에 저장하지 못했습니다. JSON 내려받기로 백업해 주세요.');}return checked;}
  function inline(text,data){return esc(text).replace(/\[\[([^\]]+)\]\]/g,(_,term)=>Object.hasOwn(data.terms,term)?'<button type="button" class="term" data-term="'+esc(term)+'" aria-label="'+esc(term)+' 주석 열기" aria-expanded="false">'+esc(term)+'<sup aria-hidden="true">*</sup></button>':esc(term));}
  function paragraphs(text,data){return text.split(/\n+/).filter(Boolean).map(p=>'<p>'+inline(p,data)+'</p>').join('');}
  function get(data,path){return path.split('.').reduce((v,k)=>v[k],data);}
  function set(data,path,value){const keys=path.split('.');let target=data;for(const k of keys.slice(0,-1))target=target[k];target[keys.at(-1)]=value;}
  window.Guide={key,original,esc,validate,imageURL,load,save,inline,paragraphs,get,set,get storageError(){return storageError;}};
})();
