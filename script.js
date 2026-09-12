const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

const defaultAnimals = [
  {
    id: 1,
    name: 'Nina',
    species: 'Cachorro',
    breed: 'SRD',
    color: 'Caramelo',
    location: 'Centro — Itajubá, MG',
    photo: '',
    status: 'Procurando'
  },
  {
    id: 2,
    name: 'Theo',
    species: 'Gato',
    breed: 'Siamês',
    color: 'Branco e cinza',
    location: 'Varginha — Itajubá, MG',
    photo: '',
    status: 'Procurando'
  },
  {
    id: 3,
    name: 'Luna',
    species: 'Cachorro',
    breed: 'Border Collie',
    color: 'Preto e branco',
    location: 'Avenida BPS — Itajubá, MG',
    photo: '',
    status: 'Procurando'
  }
];

let animals =
  JSON.parse(localStorage.getItem('aujuda_animals') || 'null')
  || defaultAnimals;

let uploadedPhoto = '';


function saveAnimals() {

  try {

    localStorage.setItem(
      'aujuda_animals',
      JSON.stringify(animals)
    );

  }

  catch {

    showToast(
      'Foto muito grande',
      'Tente usar uma imagem menor para esta demonstração.'
    );

  }

}


function normalize(v = '') {

  return v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

}


function esc(str = '') {

  const div = document.createElement('div');

  div.textContent = str;

  return div.innerHTML;

}


/* =========================================
   RENDERIZAÇÃO DOS ANIMAIS
   ========================================= */

function renderAnimals(list = animals) {

  const grid = $('#animalGrid');
  const empty = $('#emptyState');

  grid.innerHTML = '';

  $('#resultCount').textContent = list.length;

  $('#heroPetCount').textContent =
    String(animals.length).padStart(2, '0');

  empty.hidden = list.length !== 0;


  list.forEach((animal, i) => {

    const card = document.createElement('article');

    card.className = 'animal-card';

    card.style.animationDelay =
      `${i * 70}ms`;


    const photo = animal.photo

      ? `
        <img
          src="${animal.photo}"
          alt="Foto de ${esc(animal.name)}"
        >
      `

      : `
        <div
          class="fallback-paw"
          aria-hidden="true"
        >
          ${
            animal.species === 'Gato'
              ? '🐱'
              : animal.species === 'Ave'
              ? '🐦'
              : '🐶'
          }
        </div>
      `;


    card.innerHTML = `

      <div class="animal-photo">

        ${photo}

        <span class="animal-status">
          ${esc(animal.status || 'Procurando')}
        </span>

      </div>


      <div class="animal-body">

        <div class="animal-title-row">

          <h3>
            ${esc(animal.name)}
          </h3>

          <span class="animal-type">
            ${esc(animal.species)}
          </span>

        </div>


        <div class="animal-details">

          <div class="detail">

            <span>
              Raça
            </span>

            <strong>
              ${esc(animal.breed || 'Não informada')}
            </strong>

          </div>


          <div class="detail">

            <span>
              Cor
            </span>

            <strong>
              ${esc(animal.color || 'Não informada')}
            </strong>

          </div>

        </div>


        <div class="animal-location">

          ⌖

          <span>
            ${esc(animal.location)}
          </span>

        </div>


        <button
          class="card-action"
          data-contact="${esc(animal.name)}"
        >
          Tenho informações
        </button>

      </div>

    `;


    grid.appendChild(card);

  });

}


/* =========================================
   BUSCA
   ========================================= */

function runSearch() {

  const species =
    normalize($('#filterSpecies').value);

  const breed =
    normalize($('#filterBreed').value);

  const color =
    normalize($('#filterColor').value);

  const location =
    normalize($('#filterLocation').value);


  const especiesConhecidas = [

    'cachorro',
    'gato',
    'ave',
    'coelho',
    'hamster',
    'porquinho-da-india',
    'tartaruga',
    'cavalo'

  ];


  const list = animals.filter(animal => {

    const animalSpecies =
      normalize(animal.species);


    const speciesMatch =

      !species

      ||

      animalSpecies === species

      ||

      (
        species === 'outro'

        &&

        !especiesConhecidas.includes(
          animalSpecies
        )
      );


    const breedMatch =

      !breed

      ||

      normalize(animal.breed)
        .includes(breed);


    const colorMatch =

      !color

      ||

      normalize(animal.color)
        .includes(color);


    const locationMatch =

      !location

      ||

      normalize(animal.location)
        .includes(location);


    return (

      speciesMatch

      &&

      breedMatch

      &&

      colorMatch

      &&

      locationMatch

    );

  });


  renderAnimals(list);


  $('#resultsLabel').textContent =

    list.length === animals.length

      ? 'Todos os animais cadastrados'

      : `Busca filtrada — ${list.length} correspondência${
          list.length === 1 ? '' : 's'
        }`;

}


function clearSearch() {

  $('#searchForm').reset();

  $('#resultsLabel').textContent =
    'Todos os animais cadastrados';

  renderAnimals();

}


$('#searchForm')
  .addEventListener(
    'submit',
    e => {

      e.preventDefault();

      runSearch();

    }
  );


$('#clearFilters')
  .addEventListener(
    'click',
    clearSearch
  );


$('#emptyClear')
  .addEventListener(
    'click',
    clearSearch
  );


/* =========================================
   ANIMAÇÃO AO ROLAR
   MESMO PADRÃO DO PORTFÓLIO
   ========================================= */

if ('IntersectionObserver' in window) {

  /*
    O conteúdo só fica escondido
    quando sabemos que o navegador
    suporta IntersectionObserver.
  */

  document.documentElement
    .classList.add('motion-ready');


  const revealObserver =
    new IntersectionObserver(

      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target
              .classList.add('visible');

            revealObserver
              .unobserve(entry.target);

          }

        });

      },

      {

        threshold: 0.12,

        rootMargin:
          '0px 0px -35px 0px'

      }

    );


  $$('.reveal')
    .forEach((el, i) => {

      /*
        Caso exista data-delay no HTML,
        ele é respeitado.

        Caso contrário:
        0ms
        90ms
        180ms
        270ms
      */

      const customDelay =
        el.dataset.delay;


      const automaticDelay =
        Math.min(i % 4, 3) * 90;


      const delay =

        customDelay !== undefined

          ? Number(customDelay)

          : automaticDelay;


      el.style.setProperty(
        '--delay',
        `${delay}ms`
      );


      revealObserver.observe(el);

    });

}

else {

  /*
    Se o navegador não suportar,
    o conteúdo continua aparecendo.
  */

  $$('.reveal')
    .forEach(el => {

      el.classList.add('visible');

    });

}


/* =========================================
   MENU MOBILE
   ========================================= */

const menuBtn =
  $('.menu-btn');

const mobileMenu =
  $('.mobile-menu');


menuBtn.addEventListener(
  'click',
  () => {

    const open =
      menuBtn
        .classList
        .toggle('active');


    mobileMenu
      .classList
      .toggle(
        'open',
        open
      );


    menuBtn
      .setAttribute(
        'aria-expanded',
        open
      );


    mobileMenu
      .setAttribute(
        'aria-hidden',
        !open
      );

  }
);


$$(
  '.mobile-menu a, .mobile-menu [data-open]'
)

.forEach(el => {

  el.addEventListener(
    'click',
    () => {

      menuBtn
        .classList
        .remove('active');


      mobileMenu
        .classList
        .remove('open');

    }
  );

});


/* =========================================
   MODAIS
   ========================================= */

const backdrop =
  $('#modalBackdrop');

let currentModal =
  null;


function openModal(id) {

  const modal =
    document.getElementById(id);


  if (!modal)
    return;


  currentModal =
    modal;


  backdrop
    .classList
    .add('open');


  modal
    .classList
    .add('open');


  modal
    .setAttribute(
      'aria-hidden',
      'false'
    );


  document.body
    .classList
    .add('modal-open');


  setTimeout(
    () => {

      modal
        .querySelector(
          'input,select,button:not(.modal-close)'
        )
        ?.focus();

    },

    240
  );

}


function closeModal() {

  if (!currentModal)
    return;


  currentModal
    .classList
    .remove('open');


  currentModal
    .setAttribute(
      'aria-hidden',
      'true'
    );


  backdrop
    .classList
    .remove('open');


  document.body
    .classList
    .remove('modal-open');


  currentModal =
    null;

}


$$('[data-open]')
  .forEach(btn => {

    btn.addEventListener(
      'click',
      () => {

        openModal(
          btn.dataset.open
        );

      }
    );

  });


$$('[data-close]')
  .forEach(btn => {

    btn.addEventListener(
      'click',
      closeModal
    );

  });


backdrop
  .addEventListener(
    'click',
    closeModal
  );


document
  .addEventListener(
    'keydown',
    e => {

      if (e.key === 'Escape') {

        closeModal();

      }

    }
  );


/* =========================================
   ESPÉCIE PERSONALIZADA
   ========================================= */

const petSpecies =
  $('#petSpecies');

const customSpeciesWrap =
  $('#customSpeciesWrap');

const customSpecies =
  $('#customSpecies');


function updateSpeciesField() {

  if (
    petSpecies.value === 'Outro'
  ) {

    customSpeciesWrap.hidden =
      false;

    customSpecies.required =
      true;


    setTimeout(
      () => {

        customSpecies.focus();

      },

      100
    );

  }

  else {

    customSpeciesWrap.hidden =
      true;

    customSpecies.required =
      false;

    customSpecies.value =
      '';

  }

}


petSpecies
  .addEventListener(
    'change',
    updateSpeciesField
  );


updateSpeciesField();


/* =========================================
   FOTO
   ========================================= */

$('#photoUpload')
  .addEventListener(
    'click',
    () => {

      $('#petPhoto').click();

    }
  );


$('#petPhoto')
  .addEventListener(
    'change',
    e => {

      const file =
        e.target.files[0];


      if (!file)
        return;


      if (
        file.size
        >
        2.5 * 1024 * 1024
      ) {

        showToast(
          'Imagem muito grande',
          'Use uma foto de até 2,5 MB para esta demo.'
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        () => {

          uploadedPhoto =
            reader.result;


          $('#photoPreview')
            .innerHTML = `

              <img
                src="${uploadedPhoto}"
                alt="Prévia da foto"
              >

            `;

        };


      reader
        .readAsDataURL(file);

    }
  );


/* =========================================
   CADASTRO DO ANIMAL
   ========================================= */

$('#petForm')
  .addEventListener(
    'submit',
    e => {

      e.preventDefault();


      const fd =
        new FormData(e.target);


      let species =
        fd.get('species');


      if (
        species === 'Outro'
      ) {

        species =
          $('#customSpecies')
            .value
            .trim();

      }


      const animal = {

        id:
          Date.now(),

        name:
          fd.get('name')
            .trim(),

        species,

        breed:
          fd.get('breed')
            .trim()
          ||
          'Não informada',

        color:
          fd.get('color')
            .trim(),

        location:
          fd.get('location')
            .trim(),

        photo:
          uploadedPhoto,

        status:
          'Procurando'

      };


      animals.unshift(animal);


      saveAnimals();


      renderAnimals();


      e.target.reset();


      $('#customSpeciesWrap').hidden =
        true;


      uploadedPhoto =
        '';


      $('#photoPreview')
        .innerHTML = `

          <span>
            ＋
          </span>

          <small>
            Adicionar foto
          </small>

        `;


      closeModal();


      showToast(
        'Animal cadastrado!',
        `${animal.name} já aparece na busca desta demonstração.`
      );


      setTimeout(
        () => {

          document
            .querySelector('#buscar')
            .scrollIntoView({
              behavior: 'smooth'
            });

        },

        300
      );

    }
  );


/* =========================================
   USUÁRIO / LOGIN
   ========================================= */

function updateUserHeader() {

  const user =
    JSON.parse(
      localStorage.getItem(
        'aujuda_user'
      )
      ||
      'null'
    );


  const loggedIn =
    localStorage.getItem(
      'aujuda_logged_in'
    )
    ===
    'true';


  const loginButton =
    $('#loginButton');

  const userGreeting =
    $('#userGreeting');

  const userFirstName =
    $('#userFirstName');


  if (
    user
    &&
    loggedIn
    &&
    user.name
  ) {

    const firstName =
      user.name
        .trim()
        .split(' ')[0];


    loginButton.hidden =
      true;


    userGreeting.hidden =
      false;


    userFirstName.textContent =
      firstName;

  }

  else {

    loginButton.hidden =
      false;


    userGreeting.hidden =
      true;


    userFirstName.textContent =
      '';

  }

}


/* =========================================
   ABAS LOGIN / CRIAR CONTA
   ========================================= */

$$('[data-auth-tab]')
  .forEach(tab => {

    tab.addEventListener(
      'click',
      () => {

        $$('[data-auth-tab]')
          .forEach(t => {

            t.classList.toggle(
              'active',
              t === tab
            );

          });


        $$('[data-auth-panel]')
          .forEach(p => {

            p.classList.toggle(

              'active',

              p.dataset.authPanel
              ===
              tab.dataset.authTab

            );

          });

      }
    );

  });


/* =========================================
   CRIAR CONTA
   ========================================= */

$('#signupForm')
  .addEventListener(
    'submit',
    e => {

      e.preventDefault();


      const inputs =
        e.target
          .querySelectorAll('input');


      const user = {

        name:
          inputs[0]
            .value
            .trim(),

        email:
          inputs[1]
            .value
            .trim(),

        password:
          inputs[2]
            .value

      };


      localStorage.setItem(

        'aujuda_user',

        JSON.stringify(user)

      );


      /*
        Após criar a conta,
        o usuário já fica logado.
      */

      localStorage.setItem(
        'aujuda_logged_in',
        'true'
      );


      e.target.reset();


      updateUserHeader();


      closeModal();


      showToast(

        'Conta criada!',

        `Bem-vindo(a), ${
          user.name.split(' ')[0]
        }.`

      );

    }
  );


/* =========================================
   LOGIN
   ========================================= */

$('#loginForm')
  .addEventListener(
    'submit',
    e => {

      e.preventDefault();


      const [
        email,
        password
      ] = [

        ...e.target
          .querySelectorAll('input')

      ]

      .map(
        input =>
          input.value
      );


      const user =
        JSON.parse(

          localStorage.getItem(
            'aujuda_user'
          )

          ||

          'null'

        );


      if (

        user

        &&

        user.email ===
          email

        &&

        user.password ===
          password

      ) {

        localStorage.setItem(
          'aujuda_logged_in',
          'true'
        );


        updateUserHeader();


        closeModal();


        showToast(

          'Login realizado',

          `Bem-vindo(a) de volta, ${
            user.name
              .split(' ')[0]
          }.`

        );


        e.target.reset();

      }

      else {

        showToast(

          'Não foi possível entrar',

          'Confira os dados ou crie uma conta na demonstração.'

        );

      }

    }
  );


/* =========================================
   BOTÃO DE CONTATO
   ========================================= */

$('#animalGrid')
  .addEventListener(
    'click',
    e => {

      const btn =
        e.target.closest(
          '[data-contact]'
        );


      if (!btn)
        return;


      showToast(

        'Contato da demonstração',

        `Em uma versão com backend, aqui seriam exibidos os meios de contato do responsável por ${btn.dataset.contact}.`

      );

    }
  );


/* =========================================
   TOAST
   ========================================= */

let toastTimer;


function showToast(
  title,
  message
) {

  $('#toastTitle')
    .textContent =
    title;


  $('#toastMessage')
    .textContent =
    message;


  $('#toast')
    .classList
    .add('show');


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(

      () => {

        $('#toast')
          .classList
          .remove('show');

      },

      3600

    );

}


/* =========================================
   EFEITO RIPPLE NOS BOTÕES
   ========================================= */

$$('.btn')
  .forEach(button => {

    button.addEventListener(
      'click',
      function(e) {

        const r =
          document.createElement(
            'span'
          );


        r.className =
          'ripple';


        const rect =
          this.getBoundingClientRect();


        const size =
          Math.max(
            rect.width,
            rect.height
          );


        r.style.width =
          `${size}px`;

        r.style.height =
          `${size}px`;


        r.style.left =
          `${
            e.clientX
            -
            rect.left
            -
            size / 2
          }px`;


        r.style.top =
          `${
            e.clientY
            -
            rect.top
            -
            size / 2
          }px`;


        this.appendChild(r);


        setTimeout(

          () =>
            r.remove(),

          650

        );

      }
    );

  });


/* =========================================
   BOTÕES MAGNÉTICOS
   ========================================= */

$$('.magnetic')
  .forEach(btn => {

    btn.addEventListener(
      'mousemove',
      e => {

        const r =
          btn.getBoundingClientRect();


        const x =
          e.clientX
          -
          r.left
          -
          r.width / 2;


        const y =
          e.clientY
          -
          r.top
          -
          r.height / 2;


        btn.style.transform =
          `translate(${x * .08}px, ${y * .12}px)`;

      }
    );


    btn.addEventListener(
      'mouseleave',
      () => {

        btn.style.transform =
          '';

      }
    );

  });


/* =========================================
   CARD 3D DO HERO
   ========================================= */

const tilt =
  $('.tilt-card');


if (tilt) {

  tilt.addEventListener(
    'mousemove',
    e => {

      const r =
        tilt
          .getBoundingClientRect();


      const x =
        (
          e.clientX
          -
          r.left
        )
        /
        r.width
        -
        .5;


      const y =
        (
          e.clientY
          -
          r.top
        )
        /
        r.height
        -
        .5;


      tilt.style.transform =
        `
          rotateY(${x * 7}deg)
          rotateX(${-y * 7}deg)
          translateY(-3px)
        `;

    }
  );


  tilt.addEventListener(
    'mouseleave',
    () => {

      tilt.style.transform =
        '';

    }
  );

}


/* =========================================
   LUZ DO CURSOR
   ========================================= */

const glow =
  $('.cursor-glow');


window.addEventListener(
  'mousemove',
  e => {

    glow.style.left =
      `${e.clientX}px`;

    glow.style.top =
      `${e.clientY}px`;

    glow.style.opacity =
      '1';

  },

  {
    passive: true
  }

);


/* =========================================
   EFEITO DO HEADER AO ROLAR
   ========================================= */

window.addEventListener(
  'scroll',
  () => {

    $('.site-header')
      .style
      .boxShadow =

      scrollY > 20

        ? '0 18px 55px rgba(34,69,80,.13)'

        : '0 14px 50px rgba(34,69,80,.08)';

  },

  {
    passive: true
  }

);


/* =========================================
   INICIALIZAÇÃO
   ========================================= */

document
  .getElementById('year')
  .textContent =
  new Date()
    .getFullYear();


updateUserHeader();

renderAnimals();
