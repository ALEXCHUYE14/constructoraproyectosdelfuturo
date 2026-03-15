
  // ===== TESTIMONIALS CAROUSEL =====
  (function() {
    const track = document.getElementById('testimonialsTrack');
    const dotsContainer = document.getElementById('carouselDots');
    const progressBar = document.getElementById('progressBar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;
    let current = 0;
    let autoTimer = null;
    let progressTimer = null;
    const INTERVAL = 3000;
    let progressStart = null;

    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Ir al testimonio ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function updateDots() {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      updateDots();
      resetProgress();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Progress bar animation
    function resetProgress() {
      clearInterval(progressTimer);
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      progressStart = Date.now();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.transition = `width ${INTERVAL}ms linear`;
          progressBar.style.width = '100%';
        });
      });

      clearInterval(autoTimer);
      autoTimer = setTimeout(() => {
        next();
      }, INTERVAL);
    }

    prevBtn.addEventListener('click', () => { prev(); });
    nextBtn.addEventListener('click', () => { next(); });

    // Pause on hover
    const wrap = track.closest('.testimonials-wrap');
    wrap.addEventListener('mouseenter', () => {
      clearTimeout(autoTimer);
      clearInterval(progressTimer);
      const elapsed = Date.now() - (progressStart || Date.now());
      const remaining = INTERVAL - elapsed;
      const pct = (elapsed / INTERVAL) * 100;
      progressBar.style.transition = 'none';
      progressBar.style.width = Math.min(pct, 100) + '%';
    });

    wrap.addEventListener('mouseleave', () => {
      resetProgress();
    });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      const section = document.getElementById('testimonios');
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      }
    });

    // Start
    resetProgress();
  })();

  // NAVBAR SCROLL
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  // MOBILE MENU
  function toggleMenu() {
    const h = document.getElementById('hamburger');
    const m = document.getElementById('mobileMenu');
    const o = document.getElementById('overlay');
    h.classList.toggle('open');
    m.classList.toggle('open');
    o.classList.toggle('open');
    document.body.style.overflow = m.classList.contains('open') ? 'hidden' : '';
  }

  // COUNTER ANIMATION
  function animateCounter(el, target, suffix = '') {
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current + suffix;
    }, 20);
  }

  // SCROLL REVEAL
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate counters
        if (entry.target.id === 'hero') {
          document.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            const suffix = el.textContent.includes('%') ? '%' : '+';
            animateCounter(el, target, el.dataset.count === '98' ? '%' : '+');
          });
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Hero counter trigger
  const heroObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(() => {
        document.querySelectorAll('[data-count]').forEach(el => {
          const target = parseInt(el.dataset.count);
          animateCounter(el, target, el.dataset.count === '98' ? '%' : '+');
        });
      }, 1000);
      heroObserver.disconnect();
    }
  });
  heroObserver.observe(document.getElementById('hero'));

  // FILTER PROJECTS
  function filterProjects(cat, btn) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.project-card').forEach(card => {
      const cardCat = card.dataset.cat;
      const show = cat === 'todos' || cardCat === cat;
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      if (show) {
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
        card.style.display = 'block';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => { if (!show) card.style.display = 'none'; }, 300);
      }
    });
    // Fix first card span
    const firstVisible = [...document.querySelectorAll('.project-card')].find(c => c.style.display !== 'none');
    document.querySelectorAll('.project-card').forEach((c, i) => {
      c.style.gridColumn = '';
      c.style.gridRow = '';
    });
    if (cat === 'todos' && firstVisible) {
      firstVisible.style.gridColumn = 'span 2';
    }
  }

  // BUDGET SLIDER
  function updateBudget(val) {
    const num = parseInt(val);
    const slider = document.getElementById('budget');
    const pct = ((num - 10000) / (500000 - 10000)) * 100;
    slider.style.background = `linear-gradient(to right, var(--gold) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
    document.getElementById('budgetVal').textContent = 'S/. ' + num.toLocaleString('es-PE') + (num >= 500000 ? '+' : '');
  }

  updateBudget(50000);

  // SEND FORM TO WHATSAPP
  function enviarCotizacion() {
    const nombre = document.getElementById('nombre').value.trim();
    const celular = document.getElementById('celular').value.trim();
    const distrito = document.getElementById('distrito').value.trim();
    const tipo = document.getElementById('tipo').value;

    if (!nombre || !celular || !distrito || !tipo) {
      alert('Por favor completa los campos obligatorios: Nombre, Celular, Distrito y Tipo de Proyecto.');
      return;
    }

    const email = document.getElementById('email').value.trim();
    const area = document.getElementById('area').value.trim();
    const plazo = document.getElementById('plazo').value;
    const descripcion = document.getElementById('descripcion').value.trim();
    const budget = document.getElementById('budget').value;

    const servicios = [...document.querySelectorAll('input[name="servicio"]:checked')]
      .map(c => c.value).join(', ') || 'No especificado';

    const msg = `🏗️ *NUEVA COTIZACIÓN - Miguel Flores Construcciones*

👤 *Datos del Cliente:*
• Nombre: ${nombre}
• Celular: ${celular}
${email ? `• Email: ${email}` : ''}
• Distrito: ${distrito}

🏠 *Detalles del Proyecto:*
• Tipo: ${tipo}
${area ? `• Área: ${area} m²` : ''}
${plazo ? `• Plazo deseado: ${plazo}` : ''}
• Presupuesto estimado: S/. ${parseInt(budget).toLocaleString('es-PE')}${budget >= 500000 ? '+' : ''}

🔧 *Servicios de Interés:*
${servicios}

📝 *Descripción:*
${descripcion || 'Sin descripción adicional'}

_Enviado desde el sitio web de Miguel Flores Construcciones_`;

    const url = `https://wa.me/51944455738?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');

    document.getElementById('formBody').style.display = 'none';
    document.getElementById('successMsg').classList.add('show');
  }

  // SMOOTH LINKS
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // PARALLAX SUBTLE
  window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-bg');
    if (hero) {
      hero.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }
  });
