(()=>{
  const audio=new Audio('Nostalgic%20Soviet%20Romance.mp3');
  audio.loop=true;audio.preload='auto';
  const gate=document.querySelector('.gate'),player=document.querySelector('.player');
  const toggle=player.querySelector('.player-toggle'),range=player.querySelector('input[type=range]');
  const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v;}catch{return d;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
  let volume=Math.min(1,Math.max(0,parseFloat(store.get('moscow-volume','0.5'))||0));
  let muted=false,fade=0;
  const icons={on:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',off:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm18.3 0-1.4-1.4L17 10.6l-2.9-3L12.7 9l2.9 3-2.9 2.9 1.4 1.4 2.9-2.9 2.9 2.9 1.4-1.4-2.9-2.9z"/></svg>'};
  function render(){const off=muted||audio.paused||volume===0;toggle.innerHTML=off?icons.off:icons.on;toggle.setAttribute('aria-label',off?'음악 켜기':'음악 끄기');toggle.setAttribute('aria-pressed',String(!off));range.value=Math.round(volume*100);}
  function fadeTo(target,ms){cancelAnimationFrame(fade);const from=audio.volume,start=performance.now();const step=t=>{const p=Math.min(1,(t-start)/ms);audio.volume=from+(target-from)*p;if(p<1)fade=requestAnimationFrame(step);};fade=requestAnimationFrame(step);}
  function play(){audio.volume=0;return audio.play().then(()=>{fadeTo(volume,1600);render();}).catch(()=>{muted=true;render();});}
  function enter(withSound){
    gate.classList.add('leaving');document.body.classList.remove('gated');player.hidden=false;
    setTimeout(()=>gate.remove(),950);
    if(withSound){muted=false;play();}else{muted=true;render();}
    store.set('moscow-muted',withSound?'0':'1');
    document.querySelector('#main').focus({preventScroll:true});
  }
  gate.querySelector('.gate-enter').addEventListener('click',()=>enter(true));
  gate.querySelector('.gate-silent').addEventListener('click',()=>enter(false));
  toggle.addEventListener('click',()=>{
    if(muted||audio.paused){muted=false;if(volume===0){volume=.5;}store.set('moscow-muted','0');if(audio.paused)play();else fadeTo(volume,400);}
    else{muted=true;store.set('moscow-muted','1');fadeTo(0,400);setTimeout(()=>{if(muted)audio.pause();},420);}
    render();
  });
  range.addEventListener('input',()=>{
    volume=range.value/100;store.set('moscow-volume',String(volume));cancelAnimationFrame(fade);
    if(volume>0&&(muted||audio.paused)){muted=false;store.set('moscow-muted','0');if(audio.paused){audio.volume=volume;audio.play().catch(()=>{});}}
    audio.volume=volume;render();
  });
  document.body.classList.add('gated');
  gate.querySelector('.gate-enter').focus();
  render();
})();
