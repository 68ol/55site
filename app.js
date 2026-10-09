(() => {
const {esc,inline,paragraphs,imageURL}=Guide;
let data=structuredClone(Guide.original),current=null,opener=null;
const dialog=document.querySelector('#detail');
const body=document.querySelector('#detail-body');
const foot=document.querySelector('#detail-footer');
const tip=document.createElement('div');tip.className='term-tip';tip.id='term-tip';tip.setAttribute('popover','manual');tip.setAttribute('role','tooltip');document.body.append(tip);
let tipTarget=null,tipTimer;
function hideTip(){clearTimeout(tipTimer);if(tip.matches(':popover-open'))tip.hidePopover();if(tipTarget){tipTarget.setAttribute('aria-expanded','false');tipTarget.removeAttribute('aria-describedby');}tipTarget=null;}
function positionTip(){if(!tipTarget)return;const r=tipTarget.getBoundingClientRect(),t=tip.getBoundingClientRect();let x=Math.min(innerWidth-t.width-12,Math.max(12,r.left)),y=r.bottom+9;if(y+t.height>innerHeight-12)y=Math.max(12,r.top-t.height-9);tip.style.left=x+'px';tip.style.top=y+'px';}
function showTip(target){clearTimeout(tipTimer);if(!data.terms[target.dataset.term])return;hideTip();tipTarget=target;const parent=dialog.open?dialog:document.body;parent.append(tip);tip.innerHTML='<button class="tip-close" aria-label="주석 닫기" type="button">×</button><strong>'+esc(target.dataset.term)+'</strong>'+esc(data.terms[target.dataset.term]);target.setAttribute('aria-expanded','true');target.setAttribute('aria-describedby','term-tip');tip.style.left='12px';tip.style.top='12px';tip.showPopover();positionTip();}
function render(){
 hideTip();
 document.title='1955 '+data.meta.title+' · V2';
 const bits=data.meta.title.split(' ');document.querySelector('h1').innerHTML=esc(bits.shift())+'<br>'+esc(bits.join(' '))+'<span class="period">.</span>';
 document.querySelector('.annotation-guide').textContent=data.meta.annotation;
 document.querySelector('.system-grid').innerHTML=data.system.map(x=>'<article><h3>'+esc(x.title)+'</h3>'+paragraphs(x.body,data)+'</article>').join('');
 document.querySelector('.timeline').innerHTML=data.history.map((h,i)=>{const years=h.years.split('–');return '<button type="button" class="timeline-row" data-history="'+i+'" aria-haspopup="dialog"><span class="year">'+esc(years[0])+'<span>— '+esc(years.slice(1).join('–'))+'</span></span><span class="timeline-copy"><strong>'+esc(h.title)+'</strong><span>'+esc(h.summary)+'</span><small>자세히 읽기 ＋</small></span></button>';}).join('');
 document.querySelector('#faction-list').innerHTML=data.factions.map((f,i)=>'<article class="faction" data-id="'+f.id+'"><div class="faction-text"><span class="faction-index">0'+(i+1)+' / '+esc(f.label)+'</span><h3>'+inline(f.name==='KGB'?'[[KGB]]':f.name,data)+'</h3><p class="faction-role">'+esc(f.role)+'</p>'+paragraphs(f.body,data)+'<div class="relation">'+f.relations.map(r=>'<div><strong>'+esc(r.target)+'</strong>'+esc(r.text)+'</div>').join('')+'</div></div>'+(f.image?'<figure><img src="'+esc(imageURL(f.image))+'" alt="'+esc(f.alt)+'" loading="lazy"><figcaption>AI 재현 이미지 · 1955년의 분위기를 재구성</figcaption></figure>':'')+'</article>').join('');
 document.querySelector('#character-list').innerHTML=data.factions.map(f=>'<div class="directory-group"><h3 class="directory-label">'+esc(f.name)+'</h3>'+data.characters.map((c,i)=>c.faction===f.id?'<button type="button" class="person-row" data-person="'+i+'" aria-haspopup="dialog"><span class="person-number">'+String(i+1).padStart(2,'0')+'</span><strong>'+esc(c.name)+'</strong><span class="person-job">'+esc(c.age)+'세 · '+esc(c.job)+'</span><span class="person-open" aria-hidden="true">＋</span></button>':'').join('')+'</div>').join('');
 if(current)showDetail(current.type,current.index,false);
}
function showDetail(type,index,focus=true){
 hideTip();current={type,index};const item=type==='history'?data.history[index]:data.characters[index];if(!item)return;
 if(!dialog.open){opener=document.activeElement;dialog.showModal();document.body.style.overflow='hidden';}
 document.querySelector('#detail-kicker').textContent=(type==='history'?'ИСТОРИЯ / ':'ЛИЧНОЕ ДЕЛО / ')+String(index+1).padStart(2,'0');
 if(type==='history'){
 body.innerHTML='<div class="detail-years">'+esc(item.years)+'</div><h2 id="detail-title" class="detail-title" tabindex="-1">'+esc(item.title)+'</h2><p class="detail-note">'+esc(item.summary)+'</p>'+item.parts.map(p=>'<section class="detail-part"><h3>'+esc(p.title)+'</h3>'+paragraphs(p.body,data)+'</section>').join('')+'<details class="sources"><summary>참고 자료</summary>'+item.sources.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.label)+'</a>').join('')+'</details>';
 foot.innerHTML='<button type="button" data-prev="'+(index-1)+'" '+(index===0?'disabled':'')+'>이전 사건</button><button type="button" class="close-dialog">연표로 돌아가기</button><button type="button" data-next="'+(index+1)+'" '+(index===data.history.length-1?'disabled':'')+'>다음 사건</button>';
 }else{
 const faction=data.factions.find(f=>f.id===item.faction);
 body.innerHTML='<div class="portrait">'+(item.image?'<img src="'+esc(imageURL(item.image))+'" alt="'+esc(item.name)+' 인물 사진">':'<span class="portrait-empty">인물 사진 · 1470 × 640</span>')+'</div><p class="detail-faction">'+esc(faction.name)+'</p><h2 id="detail-title" class="detail-title" tabindex="-1">'+esc(item.name)+'</h2><dl class="profile-meta">'+[['나이 성별',esc(item.age)+', '+esc(item.gender)],['출신',inline(item.origin,data)],['직책',esc(item.job)],['성향',esc(item.alignment)],['사상',item.ideologySecret?'<button type="button" class="secret" aria-expanded="false" data-secret="'+esc(item.ideology)+'">비밀 · 눌러서 확인</button>':esc(item.ideology)],['성격',esc(item.personality)]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl>';
 foot.innerHTML='<button type="button" class="close-dialog">인물 명부로 돌아가기</button>';
 }
 dialog.scrollTop=0;if(focus)document.querySelector('#detail-title').focus({preventScroll:true});
}
function closeDetail(){hideTip();dialog.close();}
document.addEventListener('click',e=>{
 const target=e.target.closest('button');if(!target){if(!tip.contains(e.target))hideTip();return;}
 if(target.matches('.term')){showTip(target);return;}
 if(target.matches('.tip-close')){hideTip();return;}
 if(target.dataset.history!==undefined)showDetail('history',Number(target.dataset.history));
 if(target.dataset.person!==undefined)showDetail('person',Number(target.dataset.person));
 if(target.dataset.prev!==undefined)showDetail('history',Number(target.dataset.prev));
 if(target.dataset.next!==undefined)showDetail('history',Number(target.dataset.next));
 if(target.matches('.close-dialog'))closeDetail();
});
document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const t=e.target.closest('.term');if(t)showTip(t);if(tip.contains(e.target))clearTimeout(tipTimer);});
document.addEventListener('pointerout',e=>{if(e.target.closest('.term')||tip.contains(e.target))tipTimer=setTimeout(hideTip,180);});
document.addEventListener('focusin',e=>{if(e.target.matches('.term'))showTip(e.target);else if(!tip.contains(e.target))hideTip();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&tipTarget){e.preventDefault();e.stopPropagation();hideTip();}},true);
dialog.addEventListener('close',()=>{hideTip();current=null;document.body.style.overflow='';opener?.focus({preventScroll:true});});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();});
document.addEventListener('scroll',hideTip,true);window.addEventListener('resize',hideTip);
document.addEventListener('click',e=>{const s=e.target.closest('.secret');if(!s||s.classList.contains('revealed'))return;s.textContent=s.dataset.secret;s.classList.add('revealed');s.setAttribute('aria-expanded','true');});
document.addEventListener('error',e=>{if(e.target.tagName==='IMG'){const img=e.target;const box=document.createElement('span');box.className='image-error';box.textContent='이미지를 불러오지 못했습니다.';img.replaceWith(box);}},true);
render();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){document.querySelectorAll('.spine nav a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-10% 0px -60% 0px'});document.querySelectorAll('main>section').forEach(s=>observer.observe(s));
})();
