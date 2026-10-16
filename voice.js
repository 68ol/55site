(()=>{
  const dialog=document.querySelector('#detail');
  let clip=null,btn=null;
  function reset(){
    if(clip){clip.onended=clip.onerror=null;clip.pause();clip=null;}
    if(btn){btn.classList.remove('playing');btn.setAttribute('aria-pressed','false');btn=null;}
    window.BGM&&window.BGM.restore();
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('.voice-btn');if(!b)return;
    if(b===btn){reset();return;}
    reset();
    btn=b;b.classList.add('playing');b.setAttribute('aria-pressed','true');
    const line=dialog.querySelector('.voice-line');if(line)line.hidden=false;
    window.BGM&&window.BGM.duck();
    clip=new Audio(b.dataset.voice.split('/').map(encodeURIComponent).join('/'));
    clip.onended=reset;
    clip.onerror=()=>{reset();const l=dialog.querySelector('.voice-line');if(l)l.insertAdjacentHTML('beforeend','<p class="voice-ko">음성을 불러오지 못했습니다.</p>');};
    setTimeout(()=>{if(clip)clip.play().catch(()=>reset());},200);
  });
  dialog.addEventListener('close',reset);
  new MutationObserver(()=>{if(btn&&!dialog.contains(btn))reset();}).observe(dialog,{childList:true,subtree:true});
})();
