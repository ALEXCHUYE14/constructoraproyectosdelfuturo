// ===== GOOGLE ANALYTICS: EVENTOS =====
// gtag() se define en <head>. Si el ID de GA aún no está configurado, los eventos solo quedan en dataLayer.
function track(name, params) {
  if (typeof gtag === 'function') gtag('event', name, params || {});
}

document.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href') || '';
  const where = link.closest('section, header, footer')?.id || link.className || 'pagina';
  if (href.includes('wa.me')) track('whatsapp_click', { link_location: where });
  else if (href.startsWith('tel:')) track('phone_click', { link_location: where });
});

const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
if (motionOK) document.documentElement.classList.add('motion');

// ===== TÍTULO DEL HERO: PALABRA POR PALABRA =====
document.querySelectorAll('[data-split]').forEach(el => {
  if (!motionOK) return;
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words
    .map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`)
    .join(' ');
});

// ===== CIFRAS ANIMADAS =====
// El número real ya está en el HTML (lo lee Google); la animación solo lo recorre desde 0.
function countUp(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1600;
  const start = performance.now();
  const step = now => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if (motionOK) {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(el => { el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || ''); });
  // Esperar a que termine la entrada del hero
  setTimeout(() => counters.forEach(countUp), 1200);
}

// ===== REVELADO AL HACER SCROLL =====
const revealGroups = [
  ['.section-head', 'up'],
  ['.service', 'up', true],
  ['.ba', 'left'],
  ['.quality-photo', 'mask'],
  ['.quality-copy > h2, .quality-copy > p', 'up', true],
  ['.checks li', 'up', true],
  ['.project, .project-cta', 'mask', true],
  ['.steps li', 'up', true],
  ['.quote', 'up', true],
  ['.faq details', 'up', true],
  ['.quote-intro', 'up'],
  ['.form-card', 'up']
];

if (motionOK && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealGroups.forEach(([selector, type, stagger]) => {
    document.querySelectorAll(selector).forEach(el => {
      el.dataset.reveal = type;
      if (stagger) {
        const index = [...el.parentElement.children].indexOf(el);
        el.style.setProperty('--d', `${(index % 3) * 0.1}s`);
      }
      io.observe(el);
    });
  });
}

// ===== HEADER, PROGRESO, PARALLAX Y LÍNEA DEL PROCESO =====
const header = document.getElementById('header');
const progress = document.getElementById('scrollProgress');
const heroMedia = document.querySelector('.hero-media');
const qualityImg = document.querySelector('.quality-photo img');
const steps = document.querySelector('.steps');
const stepItems = steps ? [...steps.children] : [];
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  header.classList.toggle('is-scrolled', y > 40);

  const max = document.documentElement.scrollHeight - vh;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  if (motionOK) {
    if (heroMedia && y < vh) heroMedia.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    if (qualityImg) {
      const r = qualityImg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const shift = ((r.top + r.height / 2) - vh / 2) / vh; // -1..1
        qualityImg.style.transform = `scale(1.12) translate3d(0, ${shift * -40}px, 0)`;
      }
    }
  }

  if (steps) {
    const r = steps.getBoundingClientRect();
    const p = Math.min(Math.max((vh * 0.75 - r.top) / (r.height + vh * 0.25), 0), 1);
    steps.style.setProperty('--p', p.toFixed(3));
    stepItems.forEach((li, i) => li.classList.toggle('is-done', p >= i / stepItems.length + 0.05));
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// ===== COMPARADOR "DEL PLANO A LA OBRA" =====
const ba = document.getElementById('ba');
if (ba) {
  const range = ba.querySelector('.ba-range');
  const setPos = v => ba.style.setProperty('--pos', v + '%');
  let used = false;
  range.addEventListener('input', () => {
    setPos(range.value);
    if (!used) { used = true; track('compare_slider', { section: 'plano' }); }
  });

  // Barrido de demostración la primera vez que se ve, para invitar a deslizar
  if (motionOK) {
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const keys = [[0, 50], [700, 18], [1600, 82], [2400, 50]];
      const start = performance.now();
      const anim = now => {
        if (used) return;
        const t = now - start;
        let i = keys.findIndex(k => k[0] > t);
        if (i === -1) { setPos(50); range.value = 50; return; }
        const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
        const k = (t - t0) / (t1 - t0);
        const v = v0 + (v1 - v0) * (0.5 - Math.cos(Math.PI * k) / 2);
        setPos(v); range.value = v;
        requestAnimationFrame(anim);
      };
      setTimeout(() => requestAnimationFrame(anim), 600);
    }, { threshold: 0.5 }).observe(ba);
  }
}

// ===== MENÚ MÓVIL =====
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  nav.classList.toggle('is-open', open);
}

menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ===== FILTRO DE PROYECTOS =====
const projectsGrid = document.getElementById('projects');

document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    document.querySelectorAll('.filter').forEach(b => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    projectsGrid.classList.toggle('is-filtered', cat !== 'todos');
    projectsGrid.querySelectorAll('.project').forEach(card => {
      card.hidden = cat !== 'todos' && card.dataset.cat !== cat;
      card.classList.remove('is-entering');
      if (!card.hidden && motionOK) {
        void card.offsetWidth; // reinicia la animación
        card.classList.add('is-entering');
      }
    });
    track('filter_projects', { category: cat });
  });
});

// ===== TESTIMONIOS =====
const quotes = document.getElementById('quotes');

function scrollQuotes(dir) {
  const card = quotes.querySelector('.quote');
  const step = card.offsetWidth + parseFloat(getComputedStyle(quotes).columnGap || 0);
  quotes.scrollBy({ left: dir * step, behavior: 'smooth' });
}

document.getElementById('prevBtn').addEventListener('click', () => scrollQuotes(-1));
document.getElementById('nextBtn').addEventListener('click', () => scrollQuotes(1));

// ===== "COTIZAR ESTE SERVICIO" PRESELECCIONA EL TIPO =====
document.querySelectorAll('[data-tipo]').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('tipo').value = link.dataset.tipo;
    track('select_service', { service: link.dataset.tipo });
  });
});

// ===== PRESUPUESTO =====
const budget = document.getElementById('budget');
const budgetVal = document.getElementById('budgetVal');

function formatBudget(num) {
  return 'S/ ' + num.toLocaleString('es-PE') + (num >= 500000 ? ' o más' : '');
}

function updateBudget() {
  const num = parseInt(budget.value, 10);
  const pct = ((num - budget.min) / (budget.max - budget.min)) * 100;
  budget.style.background = `linear-gradient(to right, var(--algarrobo) ${pct}%, var(--linea) ${pct}%)`;
  budgetVal.textContent = formatBudget(num);
}

budget.addEventListener('input', updateBudget);
updateBudget();

// ===== ENVIAR COTIZACIÓN POR WHATSAPP =====
const form = document.getElementById('quoteForm');
const formError = document.getElementById('formError');
let formStarted = false;

form.addEventListener('input', () => {
  if (!formStarted) { formStarted = true; track('form_start', { form_id: 'cotizacion' }); }
});

form.addEventListener('submit', e => {
  e.preventDefault();

  const required = ['nombre', 'celular', 'distrito', 'tipo'].map(id => document.getElementById(id));
  const missing = required.filter(el => !el.value.trim());
  required.forEach(el => el.setAttribute('aria-invalid', String(missing.includes(el))));

  if (missing.length) {
    const names = missing.map(el => form.querySelector(`label[for="${el.id}"]`).textContent.trim().toLowerCase());
    formError.textContent = 'Completa estos campos para enviar tu solicitud: ' + names.join(', ') + '.';
    formError.hidden = false;
    missing[0].focus();
    return;
  }
  formError.hidden = true;

  const val = id => document.getElementById(id).value.trim();
  // Línea opcional: se omite si el campo está vacío
  const opt = (value, label) => value ? `${label}: ${value}` : null;
  const servicios = [...form.querySelectorAll('input[name="servicio"]:checked')].map(c => c.value).join(', ');
  const num = parseInt(budget.value, 10);

  const lines = [
    '*Nueva solicitud de cotización*',
    '',
    `Nombre: ${val('nombre')}`,
    `Celular: ${val('celular')}`,
    opt(val('email'), 'Correo'),
    `Ubicación: ${val('distrito')}`,
    '',
    `Tipo de proyecto: ${val('tipo')}`,
    opt(val('area') && `${val('area')} m²`, 'Área estimada'),
    opt(val('plazo'), 'Inicio deseado'),
    `Presupuesto aproximado: ${formatBudget(num)}`,
    opt(servicios, 'Servicios'),
    opt(val('descripcion'), 'Descripción'),
    '',
    '_Enviado desde la web_'
  ].filter(line => line !== null);

  track('generate_lead', {
    form_id: 'cotizacion',
    project_type: val('tipo'),
    value: num,
    currency: 'PEN'
  });

  window.open(`https://wa.me/51944455738?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');

  form.hidden = true;
  const done = document.getElementById('formDone');
  done.hidden = false;
  done.focus();
});

// ===== AÑO =====
document.getElementById('year').textContent = new Date().getFullYear();
