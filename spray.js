/* Projected depth particles follow the moving atomizer in screen space. */
(()=>{
 const art=document.querySelector('.spray-experience .hero-art'),bottle=document.getElementById('hero-bottle'),canvas=document.getElementById('perfume-mist'),ctx=canvas.getContext('2d'),button=document.getElementById('spray-perfume');
 if(!ctx)return;
 let w=0,h=0,particles=[],last=0,emittingUntil=0,nextAuto=performance.now()+1800,inView=true,pointerDown=0,downX=0,downY=0,lastInteraction=0,uncapTimer;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function resize(){const r=art.getBoundingClientRect();w=r.width;h=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0)}
 new ResizeObserver(resize).observe(art);resize();
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;},{threshold:.15}).observe(art);
 function spray(manual=false){
  if(document.hidden||!inView)return;
  if(reduced.matches||paused){if(manual){bottle.classList.add('uncapped');document.getElementById('spray-status').textContent=products[selected].name+': '+products[selected].short+'. Resume motion to see the spray.';}return;}
  const wasOpen=bottle.classList.contains('uncapped');bottle.classList.add('uncapped');clearTimeout(uncapTimer);
  uncapTimer=setTimeout(()=>{if(paused||document.hidden)return;bottle.classList.add('spraying');art.classList.add('is-spraying');emittingUntil=performance.now()+520;document.getElementById('spray-status').textContent=products[selected].name+' — a fine mist of '+products[selected].short+'.';setTimeout(()=>{bottle.classList.remove('spraying');art.classList.remove('is-spraying');},650);},wasOpen?30:850);
  nextAuto=performance.now()+7000;
 }
 button.addEventListener('click',()=>spray(true));
 stage.addEventListener('pointerdown',e=>{pointerDown=performance.now();downX=e.clientX;downY=e.clientY;lastInteraction=performance.now()});
 stage.addEventListener('pointerup',e=>{lastInteraction=performance.now();if(Math.hypot(e.clientX-downX,e.clientY-downY)<7&&performance.now()-pointerDown<600)spray(true)});
 stage.addEventListener('keydown',e=>{lastInteraction=performance.now();if(e.key===' '||e.key==='Enter'){e.preventDefault();spray(true)}});
 document.querySelectorAll('.scent-tab').forEach(el=>el.addEventListener('click',()=>{particles=[];nextAuto=performance.now()+600;spray(false)}));
 function emit(dt){const nozzle=bottle.querySelector('.spray-hole');if(!nozzle)return;const r=nozzle.getBoundingClientRect(),a=art.getBoundingClientRect(),origin={x:r.left+r.width/2-a.left,y:r.top+r.height/2-a.top};
  for(let i=0;i<Math.min(14,Math.ceil(dt*.32));i++){const spread=(Math.random()-.5)*1.1,speed=75+Math.random()*135;particles.push({x:origin.x,y:origin.y,z:(Math.random()-.5)*20,vx:-speed*Math.cos(spread),vy:-28+speed*Math.sin(spread)*.55,vz:(Math.random()-.5)*80,age:0,life:1.4+Math.random()*1.1,size:1+Math.random()*4,cloud:Math.random()>.5});}
 }
 function frame(now){requestAnimationFrame(frame);const dt=Math.min(40,now-(last||now));last=now;if(document.hidden||!inView)return;
  if(paused||reduced.matches){ctx.clearRect(0,0,w,h);particles=[];emittingUntil=0;return;}
  if(now>nextAuto&&!dragging)spray(false);
  if(!dragging&&now-lastInteraction>3500){angle+=(-23+Math.sin(now*.00043)*19-angle)*.018;bottle.style.transform=`rotateX(${-10+Math.cos(now*.0004)*3}deg) rotateY(${angle}deg) rotateZ(${6+Math.sin(now*.00032)*3}deg)`;}
  if(now<emittingUntil)emit(dt);
  ctx.clearRect(0,0,w,h);const seconds=dt/1000;
  particles=particles.filter(p=>p.age<p.life);
  for(const p of particles){p.age+=seconds;p.x+=p.vx*seconds;p.y+=p.vy*seconds;p.z+=p.vz*seconds;p.vx*=.989;p.vy-=seconds*9;const depth=600/(600+p.z),size=(p.size+p.age*(p.cloud?13:1.8))*depth,alpha=Math.sin(Math.min(1,p.age/p.life)*Math.PI)*(p.cloud?.075:.42),x=p.x,y=p.y;
   if(p.cloud){const g=ctx.createRadialGradient(x,y,0,x,y,size);g.addColorStop(0,`rgba(255,247,239,${alpha*2})`);g.addColorStop(.4,`rgba(178,130,132,${alpha})`);g.addColorStop(1,'rgba(229,190,180,0)');ctx.fillStyle=g;}else ctx.fillStyle=`rgba(255,250,242,${alpha})`;
   ctx.beginPath();ctx.arc(x,y,Math.max(.5,size),0,Math.PI*2);ctx.fill();
  }
 }
 requestAnimationFrame(frame);
})();
