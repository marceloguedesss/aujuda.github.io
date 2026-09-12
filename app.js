'use strict';
const initialAnimals = [
  {id:1,name:'Bento',species:'Cachorro',breed:'Sem raça definida',color:'Caramelo',location:'Centro, Itajubá — MG',photo:'dog.png'},
  {id:2,name:'Luna',species:'Gato',breed:'Sem raça definida',color:'Preto e branco',location:'Varginha, Itajubá — MG'},
  {id:3,name:'Theo',species:'Cachorro',breed:'Poodle',color:'Branco',location:'Boa Vista, Itajubá — MG'}
];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled=!reducedMotion.matches;
let motionChosen=false;
const revealTargets=new Set();
function animateEntry(el){
 if(!motionEnabled||typeof el.animate!=='function')return;
 el.getAnimations().forEach(a=>a.cancel());
 const side=el.classList.contains('intro-photo')?40:0;
 el.animate([{opacity:0,transform:`translate(${side}px, 55px) scale(.96)`,filter:'blur(7px)'},{opacity:1,transform:'translate(0,0) scale(1)',filter:'blur(0)'}],{duration:1100,delay:Number(el.dataset.delay||0),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
}
const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){if(!entry.target.dataset.inView){entry.target.dataset.inView='1';animateEntry(entry.target);}}else delete entry.target.dataset.inView;}},{threshold:.12}):null;
function watchReveal(el){revealTargets.add(el);if(revealObserver)revealObserver.observe(el);else animateEntry(el);}
function setMotion(enabled){motionEnabled=enabled;document.body.classList.toggle('motion-enabled',enabled);const button=document.querySelector('#motion-toggle');button.textContent=enabled?'Animações: ativadas':'Ativar animações';button.setAttribute('aria-pressed',String(enabled));if(!enabled){document.getAnimations().forEach(a=>a.cancel());}else{for(const el of revealTargets){const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)animateEntry(el);}}}
let animals = initialAnimals.map(a=>({...a}));
let nextId = 4;
const $ = s=>document.querySelector(s);
const clean = s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
function filtered(){const f=new FormData($('#search-form'));return animals.filter(a=>['species','breed','color','location'].every(k=>clean(a[k]).includes(clean(f.get(k)||''))));}
function render(){
  const list=filtered();const grid=$('#results');for(const el of grid.children){revealObserver?.unobserve(el);revealTargets.delete(el);}grid.replaceChildren();
  $('#result-count').replaceChildren(node('strong','',String(list.length)),document.createTextNode(list.length===1?' animal na demonstração':' animais na demonstração'));
  $('#empty-state').hidden=!!list.length;
  list.forEach((a,i)=>{
    const card=node('article','animal-card');card.dataset.delay=String(Math.min(i,5)*140);
    const visual=node('div','card-visual'+(!a.photo?' no-photo'+(a.species==='Gato'?' cat':''):''));
    if(a.photo){const img=node('img');img.src=a.photo;img.alt=a.photo==='dog.png'?'Fotografia ilustrativa de um cachorro':`Foto de ${a.name}`;img.loading='lazy';visual.append(img);}else{visual.append(node('span','no-photo-letter',a.name.charAt(0).toUpperCase()),node('span','no-photo-text','Cadastro sem foto'));}
    visual.append(node('span','card-badge','Exemplo fictício'));
    const content=node('div','card-content'),top=node('div','card-top');top.append(node('h3','',a.name),node('span','species',a.species));
    const loc=node('div','location');const pin=node('span','','⌖');pin.setAttribute('aria-hidden','true');loc.append(pin,node('span','',a.location));
    const action=node('button','card-action');action.type='button';action.append(document.createTextNode('Ver detalhes'),node('span','','↗'));action.setAttribute('aria-label',`Ver detalhes de ${a.name}`);action.addEventListener('click',()=>showDetails(a.id));
    content.append(top,node('p','traits',`${a.breed} · ${a.color}`),loc,action);card.append(visual,content);grid.append(card);watchReveal(card);
  });
}
function showDetails(id){const a=animals.find(x=>x.id===id);if(!a)throw new Error('Animal não encontrado');$('#detail-title').textContent=a.name;const photo=$('#detail-photo');photo.hidden=!a.photo;if(a.photo){photo.src=a.photo;photo.alt=`Foto de ${a.name}`;}else{photo.removeAttribute('src');photo.alt='';}const dl=$('#detail-fields');dl.replaceChildren();[['Espécie','species'],['Raça','breed'],['Cor','color'],['Último local visto','location']].forEach(([label,k])=>{const row=node('div');row.append(node('dt','',label),node('dd','',a[k]));dl.append(row)});$('#detail-dialog').showModal();}
function resetFilters(){$('#search-form').reset();render();}
$('#search-form').addEventListener('submit',e=>{e.preventDefault();render();});
$('#search-form').addEventListener('input',render);
$('#search-form').addEventListener('change',render);
$('#reset-filters').addEventListener('click',resetFilters);$('#empty-reset').addEventListener('click',resetFilters);
document.querySelectorAll('[data-register]').forEach(b=>b.addEventListener('click',()=>{$('#form-error').textContent='';$('#register-dialog').showModal();}));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
for(const s of ['#about-open','#footer-about'])$(s).addEventListener('click',()=>$('#about-dialog').showModal());
let toastTimer;
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,6500);}
let selectedPhoto=null,photoLoading=false,photoRequest=0;
function clearPhoto(){photoRequest++;if(selectedPhoto)URL.revokeObjectURL(selectedPhoto);selectedPhoto=null;photoLoading=false;$('#animal-photo').value='';$('#photo-preview-wrap').hidden=true;$('#photo-preview').removeAttribute('src');$('#photo-error').textContent='';$('#register-form button[type="submit"]').disabled=false;}
function validatePhotoFile(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Escolha uma foto JPG, PNG ou WebP.');if(file.size>8*1024*1024)throw new Error('A foto deve ter no máximo 8 MB.');if(!file.size)throw new Error('O arquivo está vazio. Escolha outra foto.');}
$('#remove-photo').addEventListener('click',clearPhoto);
$('#animal-photo').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file)return;
 clearPhoto();const request=photoRequest;let url;
 try{validatePhotoFile(file);photoLoading=true;$('#register-form button[type="submit"]').disabled=true;url=URL.createObjectURL(file);const image=new Image();image.src=url;await image.decode();if(request!==photoRequest){URL.revokeObjectURL(url);return;}if(!image.naturalWidth||image.naturalWidth*image.naturalHeight>24000000)throw new Error('Escolha uma foto com até 24 megapixels.');selectedPhoto=url;$('#photo-preview').src=url;$('#photo-preview-wrap').hidden=false;
 }catch(error){if(url)URL.revokeObjectURL(url);if(request===photoRequest)$('#photo-error').textContent=error instanceof DOMException?'Não foi possível abrir essa imagem. Escolha outra foto.':error.message;
 }finally{if(request===photoRequest){photoLoading=false;$('#register-form button[type="submit"]').disabled=false;}}
});
$('#register-form').addEventListener('submit' ,e=>{
 e.preventDefault();if(animals.length>=100){$('#form-error').textContent='O limite de 100 animais desta sessão foi atingido.';return;}
 const data=new FormData(e.currentTarget),a={id:nextId};
 for(const k of ['name','species','breed','color','location']){a[k]=String(data.get(k)||'').trim();if(!a[k]){$('#form-error').textContent='Preencha todos os campos, sem usar apenas espaços.';return;}}
 if(photoLoading){$('#form-error').textContent='Aguarde a foto terminar de carregar.';return;}
 if(selectedPhoto){a.photo=selectedPhoto;selectedPhoto=null;}
 clearPhoto();
 animals.unshift(a);nextId++;resetFilters();e.currentTarget.reset();$('#register-dialog').close();$('#busca').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});notify(`${a.name} foi cadastrado nesta demonstração. Já aparece nas buscas!`);
});
document.querySelectorAll('.intro-copy,.intro-photo,.section-heading,.filters,.register-strip,footer').forEach(watchReveal);
reducedMotion.addEventListener('change',()=>{if(!motionChosen)setMotion(!reducedMotion.matches);});
$('#motion-toggle').addEventListener('click',()=>{motionChosen=true;setMotion(!motionEnabled);});
setMotion(motionEnabled);
document.addEventListener('click',event=>{const button=event.target.closest('button,.text-link');if(!button||!motionEnabled)return;const rect=button.getBoundingClientRect();const pulse=node('span','click-pulse');pulse.setAttribute('aria-hidden','true');pulse.style.left=`${event.detail?event.clientX-rect.left:rect.width/2}px`;pulse.style.top=`${event.detail?event.clientY-rect.top:rect.height/2}px`;button.append(pulse);if(pulse.animate){pulse.animate([{transform:'translate(-50%,-50%) scale(0)',opacity:.7},{transform:'translate(-50%,-50%) scale(40)',opacity:0}],{duration:800,easing:'ease-out'});button.animate([{transform:'scale(1)'},{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:360,easing:'ease-out'});}setTimeout(()=>pulse.remove(),800);});
let scrollPending=false;
function updateScroll(){const max=document.documentElement.scrollHeight-innerHeight;$('#scroll-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;scrollPending=false;}
window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateScroll);}},{passive:true});
updateScroll();
render();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'filter_demo_animals',title:'Filtrar animais da demonstração',description:'Atualiza os filtros visíveis e retorna os animais fictícios correspondentes.',inputSchema:{type:'object',properties:{species:{type:'string',maxLength:49},breed:{type:'string',maxLength:49},color:{type:'string',maxLength:49},location:{type:'string',maxLength:119}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Objeto esperado');for(const [k,v]of Object.entries(input)){if(!['species','breed','color','location'].includes(k)||typeof v!=='string'||v.length>(k==='location'?119:49))throw new Error('Filtro inválido');}for(const k of ['species','breed','color','location'])$(`#${k}-filter`).value=input[k]||'';render();return {animals:filtered().map(({id,name,species,breed,color,location})=>({id,name,species,breed,color,location}))};}})).catch(()=>{});}catch{}}
