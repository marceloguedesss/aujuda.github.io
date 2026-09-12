const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

const defaultAnimals = [
  { id: 1, name: 'Nina', species: 'Cachorro', breed: 'SRD', color: 'Caramelo', location: 'Centro — Itajubá, MG', photo: '', status: 'Procurando' },
  { id: 2, name: 'Theo', species: 'Gato', breed: 'Siamês', color: 'Branco e cinza', location: 'Varginha — Itajubá, MG', photo: '', status: 'Procurando' },
  { id: 3, name: 'Luna', species: 'Cachorro', breed: 'Border Collie', color: 'Preto e branco', location: 'Avenida BPS — Itajubá, MG', photo: '', status: 'Procurando' }
];

let animals = JSON.parse(localStorage.getItem('aujuda_animals') || 'null') || defaultAnimals;
let uploadedPhoto = '';

function saveAnimals(){
  try { localStorage.setItem('aujuda_animals', JSON.stringify(animals)); }
  catch { showToast('Foto muito grande', 'Tente usar uma imagem menor para esta demonstração.'); }
}

function normalize(v=''){
  return v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}

function esc(str=''){
  const div = document.createElement('div'); div.textContent = str; return div.innerHTML;
}

function renderAnimals(list = animals){
  const grid = $('#animalGrid');
  const empty = $('#emptyState');
  grid.innerHTML = '';
  $('#resultCount').textContent = list.length;
  $('#heroPetCount').textContent = String(animals.length).padStart(2,'0');
  empty.hidden = list.length !== 0;

  list.forEach((animal, i) => {
    const card = document.createElement('article');
    card.className = 'animal-card';
    card.style.animationDelay = `${i * 70}ms`;
    const photo = animal.photo
      ? `<img src="${animal.photo}" alt="Foto de ${esc(animal.name)}">`
      : `<div class="fallback-paw" aria-hidden="true">${animal.species === 'Gato' ? '🐱' : animal.species === 'Ave' ? '🐦' : '🐶'}</div>`;

    card.innerHTML = `
      <div class="animal-photo">
        ${photo}
        <span class="animal-status">${esc(animal.status || 'Procurando')}</span>
      </div>
      <div class="animal-body">
        <div class="animal-title-row"><h3>${esc(animal.name)}</h3><span class="animal-type">${esc(animal.species)}</span></div>
        <div class="animal-details">
          <div class="detail"><span>Raça</span><strong>${esc(animal.breed || 'Não informada')}</strong></div>
          <div class="detail"><span>Cor</span><strong>${esc(animal.color || 'Não informada')}</strong></div>
        </div>
        <div class="animal-location">⌖ <span>${esc(animal.location)}</span></div>
        <button class="card-action" data-contact="${esc(animal.name)}">Tenho informações</button>
      </div>`;
    grid.appendChild(card);
  });
}

function runSearch(){
  const species = normalize($('#filterSpecies').value);
  const breed = normalize($('#filterBreed').value);
  const color = normalize($('#filterColor').value);
  const location = normalize($('#filterLocation').value);
  const list = animals.filter(a =>
    (!species || normalize(a.species) === species || (species === 'outro' && !['cachorro','gato','ave'].includes(normalize(a.species)))) &&
    (!breed || normalize(a.breed).includes(breed)) &&
    (!color || normalize(a.color).includes(color)) &&
    (!location || normalize(a.location).includes(location))
  );
  renderAnimals(list);
  $('#resultsLabel').textContent = list.length === animals.length ? 'Todos os animais cadastrados' : `Busca filtrada — ${list.length} correspondência${list.length === 1 ? '' : 's'}`;
}

function clearSearch(){
  $('#searchForm').reset();
  $('#resultsLabel').textContent = 'Todos os animais cadastrados';
  renderAnimals();
}

$('#searchForm').addEventListener('submit', e => { e.preventDefault(); runSearch(); });
$('#clearFilters').addEventListener('click', clearSearch);
$('#emptyClear').addEventListener('click', clearSearch);

// Reveal on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.style.setProperty('--delay', `${entry.target.dataset.delay || 0}ms`);
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
},{ threshold:.14 });
$$('.reveal').forEach(el => observer.observe(el));

// Header / mobile menu
const menuBtn = $('.menu-btn');
const mobileMenu = $('.mobile-menu');
menuBtn.addEventListener('click', () => {
  const open = menuBtn.classList.toggle('active');
  mobileMenu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
});
$$('.mobile-menu a, .mobile-menu [data-open]').forEach(el => el.addEventListener('click', () => {
  menuBtn.classList.remove('active'); mobileMenu.classList.remove('open');
}));

// Modal system
const backdrop = $('#modalBackdrop');
let currentModal = null;
function openModal(id){
  const modal = document.getElementById(id);
  if(!modal) return;
  currentModal = modal;
  backdrop.classList.add('open');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  setTimeout(() => modal.querySelector('input,select,button:not(.modal-close)')?.focus(), 240);
}
function closeModal(){
  if(!currentModal) return;
  currentModal.classList.remove('open'); currentModal.setAttribute('aria-hidden','true');
  backdrop.classList.remove('open'); document.body.classList.remove('modal-open'); currentModal = null;
}
$$('[data-open]').forEach(btn => btn.addEventListener('click', () => openModal(btn.dataset.open)));
$$('[data-close]').forEach(btn => btn.addEventListener('click', closeModal));
backdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

// Species custom input
$('#petSpecies').addEventListener('change', e => {
  const custom = $('#customSpeciesWrap');
  const input = $('#customSpecies');
  custom.hidden = e.target.value !== 'Outro';
  input.required = e.target.value === 'Outro';
  if(input.required) input.focus();
});

// Photo upload
$('#photoUpload').addEventListener('click', () => $('#petPhoto').click());
$('#petPhoto').addEventListener('change', e => {
  const file = e.target.files[0];
  if(!file) return;
  if(file.size > 2.5 * 1024 * 1024){ showToast('Imagem muito grande', 'Use uma foto de até 2,5 MB para esta demo.'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    uploadedPhoto = reader.result;
    $('#photoPreview').innerHTML = `<img src="${uploadedPhoto}" alt="Prévia da foto">`;
  };
  reader.readAsDataURL(file);
});

// Pet form
$('#petForm').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  let species = fd.get('species');
  if(species === 'Outro') species = $('#customSpecies').value.trim();
  const animal = {
    id: Date.now(), name: fd.get('name').trim(), species,
    breed: fd.get('breed').trim() || 'Não informada', color: fd.get('color').trim(),
    location: fd.get('location').trim(), photo: uploadedPhoto, status: 'Procurando'
  };
  animals.unshift(animal); saveAnimals(); renderAnimals();
  e.target.reset(); $('#customSpeciesWrap').hidden = true; uploadedPhoto = '';
  $('#photoPreview').innerHTML = '<span>＋</span><small>Adicionar foto</small>';
  closeModal();
  showToast('Animal cadastrado!', `${animal.name} já aparece na busca desta demonstração.`);
  setTimeout(() => document.querySelector('#buscar').scrollIntoView({behavior:'smooth'}), 300);
});

// Auth demo
$$('[data-auth-tab]').forEach(tab => tab.addEventListener('click', () => {
  $$('[data-auth-tab]').forEach(t => t.classList.toggle('active', t === tab));
  $$('[data-auth-panel]').forEach(p => p.classList.toggle('active', p.dataset.authPanel === tab.dataset.authTab));
}));
$('#signupForm').addEventListener('submit', e => {
  e.preventDefault();
  const inputs = e.target.querySelectorAll('input');
  const user = { name: inputs[0].value, email: inputs[1].value, password: inputs[2].value };
  localStorage.setItem('aujuda_user', JSON.stringify(user)); e.target.reset(); closeModal();
  showToast('Conta criada!', `Bem-vindo(a), ${user.name.split(' ')[0]}.`);
});
$('#loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const [email,password] = [...e.target.querySelectorAll('input')].map(i => i.value);
  const user = JSON.parse(localStorage.getItem('aujuda_user') || 'null');
  if(user && user.email === email && user.password === password){ closeModal(); showToast('Login realizado', `Bem-vindo(a) de volta, ${user.name.split(' ')[0]}.`); e.target.reset(); }
  else showToast('Não foi possível entrar', 'Confira os dados ou crie uma conta na demonstração.');
});

// Contact demo
$('#animalGrid').addEventListener('click', e => {
  const btn = e.target.closest('[data-contact]');
  if(!btn) return;
  showToast('Contato da demonstração', `Em uma versão com backend, aqui seriam exibidos os meios de contato do responsável por ${btn.dataset.contact}.`);
});

// Toast
let toastTimer;
function showToast(title, message){
  $('#toastTitle').textContent = title; $('#toastMessage').textContent = message;
  $('#toast').classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3600);
}

// Ripple clicks
$$('.btn').forEach(button => button.addEventListener('click', function(e){
  const r = document.createElement('span'); r.className = 'ripple';
  const rect = this.getBoundingClientRect(); const size = Math.max(rect.width, rect.height);
  r.style.width = r.style.height = `${size}px`;
  r.style.left = `${e.clientX - rect.left - size/2}px`; r.style.top = `${e.clientY - rect.top - size/2}px`;
  this.appendChild(r); setTimeout(() => r.remove(), 650);
}));

// Magnetic buttons
$$('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect(); const x = e.clientX - r.left - r.width/2; const y = e.clientY-r.top-r.height/2;
    btn.style.transform = `translate(${x*.08}px,${y*.12}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

// Tilt hero card
const tilt = $('.tilt-card');
if(tilt){
  tilt.addEventListener('mousemove', e => {
    const r = tilt.getBoundingClientRect(); const x = (e.clientX-r.left)/r.width-.5; const y = (e.clientY-r.top)/r.height-.5;
    tilt.style.transform = `rotateY(${x*7}deg) rotateX(${-y*7}deg) translateY(-3px)`;
  });
  tilt.addEventListener('mouseleave', () => tilt.style.transform = '');
}

// Cursor ambient glow
const glow = $('.cursor-glow');
window.addEventListener('mousemove', e => {
  glow.style.left = `${e.clientX}px`; glow.style.top = `${e.clientY}px`; glow.style.opacity = '1';
},{passive:true});

// Small header effect
window.addEventListener('scroll', () => {
  $('.site-header').style.boxShadow = scrollY > 20 ? '0 18px 55px rgba(34,69,80,.13)' : '0 14px 50px rgba(34,69,80,.08)';
},{passive:true});

document.getElementById('year').textContent = new Date().getFullYear();
renderAnimals();
