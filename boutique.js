/* Native WebGL scene: modeled architecture, hinged doors, lit display bottles,
   and a continuous camera journey from the street into the fragrance boutique. */
(()=>{
'use strict';
const canvas=document.getElementById('boutique-world'),root=document.querySelector('.cinema');
let gl;try{gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'high-performance'});}catch{}
function fallback(){root.classList.add('unavailable');document.getElementById('cinema-fallback').hidden=false;}
if(!gl){fallback();return;}
const vs=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUV;uniform mat4 uModel;uniform mat4 uVP;varying vec3 vPos;varying vec3 vNormal;varying vec2 vUV;void main(){vec4 p=uModel*vec4(aPosition,1.0);vPos=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);vUV=aUV;gl_Position=uVP*p;}`;
const fs=`precision mediump float;varying vec3 vPos;varying vec3 vNormal;varying vec2 vUV;uniform vec3 uColor;uniform vec3 uEye;uniform float uMetal;uniform float uGlow;uniform float uTextured;uniform sampler2D uTexture;void main(){vec3 n=normalize(vNormal);vec3 view=normalize(uEye-vPos);vec3 l=normalize(vec3(-3.,7.,4.)-vPos);vec3 l2=normalize(vec3(3.,4.,-8.)-vPos);float diffuse=max(dot(n,l),0.)*.65+max(dot(n,l2),0.)*.55;float spec=pow(max(dot(n,normalize(l+view)),0.),36.)*uMetal;float spec2=pow(max(dot(n,normalize(l2+view)),0.),48.)*uMetal;vec3 base=uColor;if(uTextured>.5)base*=texture2D(uTexture,vUV).rgb;vec3 col=base*(.34+diffuse)+vec3(1.,.82,.56)*(spec+spec2)*.7+base*uGlow;float fog=1.-exp(-length(uEye-vPos)*.007);col=mix(col,vec3(.09,.065,.08),fog);gl_FragColor=vec4(pow(col,vec3(.9)),1.);}`;
function shader(type,source){let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader linking failed');}catch{fallback();return;}
gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(.075,.055,.075,1);
const U={};['Model','VP','Color','Eye','Metal','Glow','Textured','Texture'].forEach(k=>U[k]=gl.getUniformLocation(program,'u'+k));const A=['aPosition','aNormal','aUV'].map(k=>gl.getAttribLocation(program,k));
function mul(a,b){let o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
function matrix(x,y,z,sx=1,sy=1,sz=1,ry=0){let c=Math.cos(ry),s=Math.sin(ry);return new Float32Array([c*sx,0,-s*sx,0,0,sy,0,0,s*sz,0,c*sz,0,x,y,z,1]);}
function norm(a){let l=Math.hypot(...a)||1;return a.map(x=>x/l)}function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function dot(a,b){return a.reduce((s,x,i)=>s+x*b[i],0)}
function look(eye,at){const z=norm(eye.map((x,i)=>x-at[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function perspective(aspect){let f=1/Math.tan(.7/2),near=.08,far=90;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]);}
function mesh(data){let buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return{buffer,count:data.length/8};}
const cubeData=[];const faces=[[[1,0,0],[[.5,-.5,-.5],[.5,-.5,.5],[.5,.5,.5],[.5,.5,-.5]]],[[-1,0,0],[[-.5,-.5,.5],[-.5,-.5,-.5],[-.5,.5,-.5],[-.5,.5,.5]]],[[0,1,0],[[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5]]],[[0,-1,0],[[-.5,-.5,.5],[.5,-.5,.5],[.5,-.5,-.5],[-.5,-.5,-.5]]],[[0,0,1],[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],[[0,0,-1],[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]]];for(const[n,p]of faces)for(const i of[0,1,2,0,2,3])cubeData.push(...p[i],...n,...[[0,0],[1,0],[1,1],[0,1]][i]);const cube=mesh(cubeData);
function lathe(profile){let data=[];for(let j=0;j<profile.length-1;j++)for(let i=0;i<36;i++){let u=i/36*Math.PI*2,v=(i+1)/36*Math.PI*2;let pts=[[u,j],[v,j],[v,j+1],[u,j+1]];for(const k of[0,1,2,0,2,3]){let[a,b]=pts[k],r=profile[b][0],y=profile[b][1],dy=profile[j+1][1]-profile[j][1],dr=profile[j+1][0]-profile[j][0],n=norm([Math.cos(a)*dy,-dr,Math.sin(a)*dy]);data.push(r*Math.cos(a),y,r*Math.sin(a),...n,a/(2*Math.PI),b/(profile.length-1));}}return mesh(data);}
// Rounded rectangular glass body, using the collection bottle's 180:250:86 proportions.
function roundedBottle(w,h,d,r){
 const ring=[];for(const [cx,cz,start] of [[w/2-r,d/2-r,0],[-w/2+r,d/2-r,90],[-w/2+r,-d/2+r,180],[w/2-r,-d/2+r,270]])for(let i=0;i<=6;i++){const a=(start+i*15)*Math.PI/180;ring.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}
 const levels=[[0,.92],[.018,1],[h-.035,1],[h,.92]],data=[];
 for(let j=0;j<levels.length-1;j++)for(let i=0;i<ring.length;i++){let next=(i+1)%ring.length;const pts=[[i,j],[next,j],[next,j+1],[i,j+1]];const dx=ring[next][0]-ring[i][0],dz=ring[next][1]-ring[i][1];const normal=norm([dz,0,-dx]);for(const k of [0,1,2,0,2,3]){const[n,l]=pts[k],scale=levels[l][1];data.push(ring[n][0]*scale,levels[l][0],ring[n][1]*scale,...normal,(i+(n===next?1:0))/ring.length,levels[l][0]/h);}}
 for(const top of [false,true]){let y=top?h:0,n=[0,top?1:-1,0];for(let i=0;i<ring.length;i++){let a=ring[i],b=ring[(i+1)%ring.length];for(const q of [[0,0],a,b])data.push(q[0]*.92,y,q[1]*.92,...n,.5,.5);}}
 return mesh(data);
}
const bottleMesh=roundedBottle(.72,1,.344,.046),capMesh=roundedBottle(.368,.26,.28,.018);const cylinder=lathe([[0,0],[.5,0],[.5,1],[0,1]]);
function canvasTexture(c){const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return texture;}
function collectionLabel(p){const c=document.createElement('canvas');c.width=512;c.height=512;const t=c.getContext('2d');t.fillStyle='#f7eee3';t.fillRect(0,0,512,512);t.strokeStyle='#d8c9bb';t.lineWidth=7;t.strokeRect(3,3,506,506);t.fillStyle='#382623';t.textAlign='center';t.font='74px Georgia';t.fillText('VELOUR',256,177);t.fillStyle='#b09b83';t.fillRect(213,219,86,2);t.fillStyle='#382623';t.font='italic 48px Georgia';t.fillText(p.name,256,289);t.font='17px Arial';t.fillText('EAU DE PARFUM · 50 ML',256,375);return canvasTexture(c);}
function collectionGlass(p){const c=document.createElement('canvas');c.width=512;c.height=512;const t=c.getContext('2d'),g=t.createLinearGradient(0,0,0,512);g.addColorStop(0,'#dec4ae');g.addColorStop(.13,'#ead7c2');g.addColorStop(.16,p.color);g.addColorStop(.86,p.dark);g.addColorStop(.95,p.color);g.addColorStop(1,'#dec4ae');t.fillStyle=g;t.fillRect(0,0,512,512);for(const x of[0,122,256,378,505]){const shine=t.createLinearGradient(x-14,0,x+14,0);shine.addColorStop(0,'#ffffff00');shine.addColorStop(.5,'#fff5e390');shine.addColorStop(1,'#ffffff00');t.fillStyle=shine;t.fillRect(x-14,0,28,512);}return canvasTexture(c);}
const bottleAssets=Object.fromEntries(Object.values(products).map(p=>[p.id,{label:collectionLabel(p),glass:collectionGlass(p)}]));

function textTexture(lines,bg='#24191c',fg='#e7cea1'){const c=document.createElement('canvas');c.width=1024;c.height=512;const t=c.getContext('2d');t.fillStyle=bg;t.fillRect(0,0,1024,512);t.textAlign='center';t.fillStyle=fg;lines.forEach((line,i)=>{t.font=(i===0?'110px Georgia':'27px Arial');t.fillText(line,512,i===0?260:345)});let texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return texture;}
const brand=textTexture(['V E L O U R','M A I S O N   D E   P A R F U M']);const label=textTexture(['V E L O U R','E A U   D E   P A R F U M'],'#efe2c9','#443029');const rose=textTexture(['Rose Noire','F L O R A L   /   W O O D Y']);const amber=textTexture(['Golden Hour','A M B E R   /   L U M I N O U S']);const sage=textTexture(['Wild Still','F R E S H   /   G R E E N']);
const gold=[.66,.45,.22],wall=[.27,.19,.18],cream=[.68,.54,.4],dark=[.065,.05,.055],wine=[.35,.08,.14];const objects=[];
function obj(mesh,x,y,z,sx,sy,sz,color,metal=0,glow=0,texture=null,parent=null,ry=0){const o={mesh,x,y,z,sx,sy,sz,color,metal,glow,texture,parent,ry};objects.push(o);return o;}
function box(x,y,z,sx,sy,sz,color=wall,metal=0,glow=0,texture=null,parent=null){return obj(cube,x,y,z,sx,sy,sz,color,metal,glow,texture,parent)}
// Stone paving, facade, gilded architectural trim and the two display windows.
box(0,-.25,0,45,.3,65,[.13,.115,.12],.4);box(0,-.03,3,14,.12,8,[.3,.255,.225],.55);
for(let x=-7;x<=7;x+=1.4)box(x,.04,3,.012,.01,8,[.48,.4,.3],.2);
for(let z=-1;z<=7;z+=1.4)box(0,.045,z,14,.01,.012,[.48,.4,.3],.2);
box(0,5.6,0,14,2.4,.55,dark);box(0,5.5,.32,7.5,2,.03,[1,1,1],0,.2,brand);
for(const x of[-7,-2.25,2.25,7]){box(x,2.3,0,.35,4.7,.6,wall,.15);box(x,2.3,.34,.045,4.7,.06,gold,.8);}
box(0,4.4,.26,14,.1,.2,gold,.7);box(0,.13,0,14,.17,.8,gold,.7);
for(const x of[-4.6,4.6]){box(x,2.25,-.3,4.3,4.3,.15,[.12,.08,.085]);box(x,.65,.05,3.8,1.1,.6,wall);box(x,4.22,.1,4.3,.04,.15,[1,.76,.43],0,1.5);box(x,2.2,.16,4.2,.03,.05,gold,.8);}
// Warm boutique interior with illuminated display niches.
box(0,-.02,-6,14,.12,12,[.48,.35,.27],.8);box(0,3,-12,14,6,.25,wall);box(-7,3,-6,.25,6,12,wall);box(7,3,-6,.25,6,12,wall);box(0,6,-6,14,.18,12,[.12,.08,.09]);
for(let x=-6;x<=6;x+=2){box(x,.055,-6,.015,.012,12,gold,.5);box(x,3,-11.82,.045,5.9,.05,gold,.4);}for(let z=-2;z>=-12;z-=2)box(0,.055,z,14,.012,.015,gold,.5);
box(0,4.5,-11.76,5.5,1.8,.05,[1,1,1],0,.2,brand);
for(const x of[-4.4,0,4.4]){box(x,2.4,-11.65,3.55,2.3,.16,[.105,.058,.066]);for(const y of[1.5,2.65]){box(x,y,-11.1,3.5,.09,1,gold,.5);box(x,y+.045,-10.61,3.4,.025,.025,[1,.73,.36],0,1.8);}}
// Side consoles frame the passage.
for(const side of[-1,1])for(const z of[-3.3,-7.5]){box(side*5.7,.7,z,1.6,1.4,2.3,wall);box(side*5.7,1.44,z,1.7,.08,2.4,gold,.65);box(side*6.83,3,z,.05,2.4,1.9,[.09,.055,.065]);}
// Pendant lights, each a slender brass stem and luminous shade.
for(const x of[-3.6,0,3.6])for(const z of[-3.3,-8]){box(x,5.5,z,.025,1,.025,gold,.8);obj(cylinder,x,4.83,z,.55,.1,.55,gold,.8);obj(cylinder,x,4.82,z,.45,.02,.45,[1,.79,.48],0,2);}
function perfume(x,y,z,s,id,parent=null){
 const assets=bottleAssets[id];
 obj(bottleMesh,x,y,z,s,s,s,[1,1,1],.95,.08,assets.glass,parent);
 // Thick glass base, gold collar, broad dark rectangular cap, ivory face label.
 box(x,y+.022*s,z,.65*s,.028*s,.30*s,[.77,.64,.5],.95,.02,null,parent);
 box(x,y+1.035*s,z,.248*s,.092*s,.19*s,gold,1,0,null,parent);
 obj(capMesh,x,y+1.06*s,z,s,s,s,[.095,.083,.073],.75,0,null,parent);
 box(x,y+.488*s,z+.175*s,.568*s,.504*s,.009*s,[1,1,1],0,.12,assets.label,parent);
 box(x,y+1.174*s,z+.143*s,.026*s,.048*s,.005*s,gold,.85,0,null,parent);
}
for(const x of[-4.6,4.6]){obj(cylinder,x,1.18,.1,1.4,.25,1.4,cream,.6);perfume(x,1.43,.1,1.65,x<0?'rose':'amber');}
const fragranceIds=['rose','amber','sage'];for(let k=0;k<3;k++)for(const y of[1.55,2.7])for(let j=-1;j<=1;j++)perfume((k-1)*4.4+j*.94,y,-10.92,.72,fragranceIds[k]);
for(const side of[-1,1])for(const z of[-3.3,-7.5])for(let j=-1;j<=1;j++)perfume(side*5.7,1.5,z+j*.65,.7,fragranceIds[(j+3)%3]);
// All three discovery-island bottles use the same collection proportions and artwork.
obj(cylinder,0,.06,-8,3.35,1.05,2.2,[.29,.16,.15],.3);obj(cylinder,0,1.12,-8,3.45,.11,2.3,gold,.8);for(let k=0;k<3;k++){const x=(k-1)*1.05;obj(cylinder,x,1.24,-8,.75,.15,.75,cream,.5);perfume(x,1.39,-8,1.15,fragranceIds[k]);box(x,1.28,-6.91,.85,.23,.04,[1,1,1],0,.1,[rose,amber,sage][k]);}
// Doors are modeled around their hinges, not scaled or faded into an overlay.
for(const side of[-1,1]){const parent=side<0?'left':'right',cx=-side*1.05;box(cx,2.18,0,2.07,4.25,.075,[.16,.115,.12],.9,0,null,parent);for(const dx of[-1.04,1.04])box(cx+dx,2.18,.08,.055,4.35,.09,gold,.95,0,null,parent);for(const y of[.06,1.06,4.31])box(cx,y,.08,2.14,.045,.09,gold,.9,0,null,parent);box(cx,2.7,.06,1.8,2.1,.035,[.19,.135,.145],.65,0,null,parent);box(cx-side*.72,2.13,.2,.045,.66,.08,[.9,.66,.3],1,0,null,parent);}
let width=1,height=1,progress=0,running=false,startRequested=false,finished=false,held=matchMedia('(prefers-reduced-motion: reduce)').matches,last=0,elapsed=0,mouse=[0,0],visible=true;
function resize(){let r=root.getBoundingClientRect();width=r.width;height=r.height;let d=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);gl.viewport(0,0,canvas.width,canvas.height);}new ResizeObserver(resize).observe(root);resize();new IntersectionObserver(e=>visible=e[0].isIntersecting).observe(root);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});
root.addEventListener('pointermove',e=>{const r=root.getBoundingClientRect();mouse=[(e.clientX-r.left)/width-.5,(e.clientY-r.top)/height-.5]});root.addEventListener('pointerleave',()=>mouse=[0,0]);
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
function enter(){if(held){finish();return;}progress=0;running=true;finished=false;startRequested=true;root.classList.add('traveling');root.classList.remove('arrived');document.getElementById('cinema-arrival').hidden=true;document.getElementById('enter-boutique').disabled=true;}
function finish(){progress=1;running=false;finished=true;root.classList.remove('traveling');root.classList.add('arrived');document.getElementById('cinema-arrival').hidden=false;document.getElementById('journey-stage').textContent='03 / INSIDE THE MAISON';document.getElementById('journey-progress').style.width='100%';}
document.getElementById('enter-boutique').addEventListener('click',enter);document.getElementById('skip-journey').addEventListener('click',finish);document.getElementById('replay-boutique').addEventListener('click',()=>{if(held){held=false;syncPause()}enter()});
function syncPause(){let b=document.getElementById('pause-journey');b.textContent=held?'▷':'Ⅱ';b.setAttribute('aria-label',held?'Resume 3D animation':'Pause 3D animation');b.setAttribute('aria-pressed',String(held))}document.getElementById('pause-journey').addEventListener('click',()=>{held=!held;syncPause()});syncPause();
let currentMesh=null;
function draw(o,door){if(currentMesh!==o.mesh){currentMesh=o.mesh;gl.bindBuffer(gl.ARRAY_BUFFER,o.mesh.buffer);A.forEach((a,i)=>{gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,i===2?2:3,gl.FLOAT,false,32,i===0?0:i===1?12:24)});}let model=matrix(o.x,o.y,o.z,o.sx,o.sy,o.sz,o.ry);if(o.parent){const side=o.parent==='left'?-1:1;model=mul(matrix(side*2.14,0,0,1,1,1,side*door),model);}gl.uniformMatrix4fv(U.Model,false,model);gl.uniform3fv(U.Color,o.color);gl.uniform1f(U.Metal,o.metal);gl.uniform1f(U.Glow,o.glow);gl.uniform1f(U.Textured,o.texture?1:0);if(o.texture){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,o.texture);gl.uniform1i(U.Texture,0);}gl.drawArrays(gl.TRIANGLES,0,o.mesh.count);}
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.05,(now-(last||now))/1000);last=now;if(!visible||document.hidden)return;if(!held){elapsed+=dt;if(running)progress=Math.min(1,progress+dt/10.5);}if(progress>=1&&!finished)finish();
 const approach=ease(progress/.42),entry=ease((progress-.51)/.49),door=ease((progress-.3)/.24)*1.47;const mobile=width/height<.9,far=mobile?28:18;
 let eye=[mix(1.8,0,approach)+(!held?mouse[0]*.32:0),mix(3.7,2.5,approach),mix(far,5.5,approach)];eye[0]=mix(eye[0],.1,entry);eye[1]=mix(eye[1],2.65,entry);eye[2]=mix(eye[2],-4.7,entry);if(!running&&!finished&&!held){eye[0]+=Math.sin(elapsed*.22)*.3;eye[1]+=Math.sin(elapsed*.33)*.08;}let at=[0,mix(2.6,2.35,entry),mix(-1,-9,entry)];if(finished&&!held){at[0]=mouse[0]*1.25;at[1]-=mouse[1]*.5;}
 gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(U.VP,false,mul(perspective(width/height),look(eye,at)));gl.uniform3fv(U.Eye,eye);currentMesh=null;for(const o of objects)draw(o,door);
 if(running){document.getElementById('journey-progress').style.width=(progress*100)+'%';document.getElementById('journey-stage').textContent=progress<.3?'01 / APPROACHING THE MAISON':progress<.56?'02 / THE DOORS ARE OPENING':'03 / DISCOVER YOUR SIGNATURE';}
}
requestAnimationFrame(frame);
// Start on the first rendered frame; reduced-motion visitors go straight inside.
requestAnimationFrame(()=>{if(!startRequested&&!finished)enter();});
})();
