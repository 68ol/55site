(()=>{
  const audio=new Audio('Nostalgic%20Soviet%20Romance.mp3');
  audio.loop=true;audio.preload='auto';
  const gate=document.querySelector('.gate'),player=document.querySelector('.player');
  const toggle=player.querySelector('.player-toggle'),range=player.querySelector('input[type=range]'),status=player.querySelector('.player-label small');
  const title=status.textContent;
  const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v;}catch{return d;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
  let volume=Math.min(1,Math.max(0,parseFloat(store.get('moscow-volume','0.5'))||0));
  let muted=false,fadeTimer=0,retry=null;
  const icons={on:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',off:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm18.3 0-1.4-1.4L17 10.6l-2.9-3L12.7 9l2.9 3-2.9 2.9 1.4 1.4 2.9-2.9 2.9 2.9 1.4-1.4-2.9-2.9z"/></svg>'};
  function setStatus(t){status.textContent=t||title;player.classList.toggle('notice',!!t);}
  function render(){const off=muted||audio.paused||volume===0;toggle.innerHTML=off?icons.off:icons.on;toggle.setAttribute('aria-label',off?'음악 켜기':'음악 끄기');toggle.setAttribute('aria-pressed',String(!off));range.value=Math.round(volume*100);}
  function setVol(v){try{audio.volume=Math.min(1,Math.max(0,v));}catch{}}
  function fadeTo(target,ms,done){
    clearInterval(fadeTimer);const from=audio.volume,start=Date.now();
    fadeTimer=setInterval(()=>{const p=Math.min(1,(Date.now()-start)/ms);setVol(from+(target-from)*p);if(p>=1){clearInterval(fadeTimer);done&&done();}},40);
  }
  function clearRetry(){if(retry){document.removeEventListener('pointerdown',retry,true);document.removeEventListener('keydown',retry,true);retry=null;}}
  function armRetry(){
    clearRetry();setStatus('화면을 누르면 음악이 재생됩니다');
    retry=e=>{if(e.target.closest&&e.target.closest('.player'))return;clearRetry();if(!muted)play();};
    document.addEventListener('pointerdown',retry,true);document.addEventListener('keydown',retry,true);
  }
  function play(){
    setVol(0);
    const p=audio.play();
    render();
    return Promise.resolve(p).then(()=>{clearRetry();setStatus();fadeTo(volume,1600);render();}).catch(err=>{
      if(err&&err.name==='AbortError')return;
      setVol(volume);render();armRetry();
    });
  }
  audio.addEventListener('waiting',()=>{if(!muted)setStatus('음악을 불러오는 중…');});
  audio.addEventListener('playing',()=>{setStatus();render();});
  audio.addEventListener('pause',render);
  audio.addEventListener('error',()=>{setStatus('음악을 불러오지 못했습니다');render();});
  function enter(withSound){
    gate.classList.add('leaving');document.body.classList.remove('gated');player.hidden=false;
    setTimeout(()=>gate.remove(),950);
    if(withSound){muted=false;if(volume<.05){volume=.5;store.set('moscow-volume','0.5');}play();}else{muted=true;render();}
    store.set('moscow-muted',withSound?'0':'1');
    document.querySelector('#main').focus({preventScroll:true});
  }
  gate.querySelector('.gate-enter').addEventListener('click',()=>enter(true));
  gate.querySelector('.gate-silent').addEventListener('click',()=>enter(false));
  toggle.addEventListener('click',()=>{
    if(muted||audio.paused){muted=false;store.set('moscow-muted','0');if(volume<.05){volume=.5;store.set('moscow-volume','0.5');}if(audio.paused)play();else fadeTo(volume,400);}
    else{muted=true;clearRetry();setStatus();store.set('moscow-muted','1');fadeTo(0,400,()=>{if(muted)audio.pause();});}
    render();
  });
  range.addEventListener('input',()=>{
    volume=range.value/100;store.set('moscow-volume',String(volume));clearInterval(fadeTimer);
    if(volume>0&&(muted||audio.paused)){muted=false;store.set('moscow-muted','0');if(audio.paused){play();return;}}
    setVol(volume);render();
  });
  document.body.classList.add('gated');
  gate.querySelector('.gate-enter').focus();
  render();
})();
