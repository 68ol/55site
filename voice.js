(()=>{
  const dialog=document.querySelector('#detail');
  const VER='20261017d';
  const labels={base:'목소리',pet:'애칭'};
  let clip=null,btn=null;
  function stop(){
    if(clip){clip.onended=clip.onerror=null;clip.pause();clip=null;}
    if(btn){btn.classList.remove('playing');btn=null;}
    window.BGM&&window.BGM.restore();
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('.voice-btn');if(!b)return;
    const person=window.HANDBOOK.characters[Number(b.dataset.voicePerson)];
    const step=b.dataset.step,line=person&&person.voice&&person.voice[step];
    if(!line)return;
    if(clip){clip.onended=clip.onerror=null;clip.pause();clip=null;}
    const next=step==='base'&&person.voice.pet?'pet':'base';
    b.dataset.step=next;b.querySelector('.voice-label').textContent=labels[next];
    b.setAttribute('aria-label',person.name+' '+(next==='pet'?'애칭 듣기':'목소리 듣기'));
    const box=dialog.querySelector('.voice-line');
    if(box){box.hidden=false;box.classList.remove('show');void box.offsetWidth;box.classList.add('show');
      box.querySelector('.voice-ru').textContent=line.ru;box.querySelector('.voice-ko').textContent=line.ko;}
    btn=b;b.classList.add('playing');
    window.BGM&&window.BGM.duck();
    const c=new Audio(line.file.split('/').map(encodeURIComponent).join('/')+'?v='+VER);clip=c;
    c.onended=stop;
    c.onerror=()=>{stop();if(box)box.querySelector('.voice-ko').textContent='음성을 불러오지 못했습니다.';};
    setTimeout(()=>{if(clip===c)c.play().catch(()=>stop());},200);
  });
  dialog.addEventListener('close',stop);
  new MutationObserver(()=>{if(btn&&!dialog.contains(btn))stop();}).observe(dialog,{childList:true,subtree:true});
})();
