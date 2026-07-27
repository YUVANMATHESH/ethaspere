/* ==========================================================================
   ETHASPHERE — script.js
   No frameworks, no backend. Pure DOM + Canvas.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initGridCanvas();
  initTerminal();
  initRevealOnScroll();
  initOpsSplit();
  initBackToTop();
  initContactForm();
});

/* --------------------------------------------------------------------------
   Sticky nav: scrolled state + mobile hamburger menu
   -------------------------------------------------------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu after tapping a link
  links.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --------------------------------------------------------------------------
   Animated cyber grid background — lightweight canvas particle/grid effect
   -------------------------------------------------------------------------- */
function initGridCanvas() {
  const canvas = document.getElementById('grid-canvas');
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, particles;
  const SPACING = 42;
  const PARTICLE_COUNT = 46;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makeParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.4,
    }));
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(13, 252, 255, 0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += SPACING) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += SPACING) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(13, 252, 255, 0.55)';
      ctx.fill();
    });
  }

  function frame() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawParticles();
    requestAnimationFrame(frame);
  }

  resize();
  makeParticles();
  window.addEventListener('resize', () => {
    resize();
    makeParticles();
  });

  if (prefersReducedMotion) {
    // Static single frame — respect reduced motion preference
    drawGrid();
  } else {
    frame();
  }
}

/* --------------------------------------------------------------------------
   Hero terminal — typewriter boot sequence, loops
   -------------------------------------------------------------------------- */
function initTerminal() {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const lines = [
    { text: '$ ethasphere --init', cls: '' },
    { text: 'Loading threat intelligence modules...', cls: '' },
    { text: '[OK] Network monitor online', cls: 'terminal__line--ok' },
    { text: '[OK] Firewall rules synced', cls: 'terminal__line--ok' },
    { text: 'Scanning perimeter...', cls: '' },
    { text: '[ALERT] Unusual traffic pattern detected', cls: 'terminal__line--warn' },
    { text: '[OK] Threat isolated & contained', cls: 'terminal__line--ok' },
    { text: '$ status: SECURE', cls: 'terminal__line--ok' },
  ];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    body.innerHTML = lines.map((l) => `<div class="${l.cls}">${l.text}</div>`).join('');
    return;
  }

  let lineIndex = 0;

  function typeLine() {
    if (lineIndex >= lines.length) {
      setTimeout(() => {
        body.innerHTML = '';
        lineIndex = 0;
        typeLine();
      }, 2200);
      return;
    }

    const { text, cls } = lines[lineIndex];
    const row = document.createElement('div');
    if (cls) row.className = cls;
    body.appendChild(row);

    let charIndex = 0;
    const typeChar = () => {
      if (charIndex <= text.length) {
        row.textContent = text.slice(0, charIndex);
        charIndex++;
        setTimeout(typeChar, 18 + Math.random() * 22);
      } else {
        lineIndex++;
        setTimeout(typeLine, 260);
      }
    };
    typeChar();
  }

  typeLine();

  // Blinking cursor pinned to the terminal body
  const cursor = document.createElement('span');
  cursor.className = 'terminal__cursor';
  body.appendChild(cursor);
}

/* --------------------------------------------------------------------------
   Scroll reveal animations (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initRevealOnScroll() {
  const groups = [
    '#reveal-domains',
    '#reveal-projects',
    '#reveal-team',
    '#reveal-stack',
  ];

  const targets = [];
  groups.forEach((sel) => {
    const parent = document.querySelector(sel);
    if (!parent) return;
    Array.from(parent.children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
      targets.push(child);
    });
  });

  const aboutCards = document.querySelectorAll('.about__card');
  aboutCards.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 80}ms`;
    targets.push(el);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((t) => observer.observe(t));
}

/* --------------------------------------------------------------------------
   Red Team / Blue Team draggable split divider
   -------------------------------------------------------------------------- */
function initOpsSplit() {
  const split = document.getElementById('ops-split');
  const handle = document.getElementById('ops-handle');
  const red = split ? split.querySelector('.ops__side--red') : null;
  const blue = split ? split.querySelector('.ops__side--blue') : null;
  if (!split || !handle || !red || !blue) return;

  let dragging = false;

  function setPosition(percent) {
    const clamped = Math.min(90, Math.max(10, percent));
    red.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
    blue.style.clipPath = `inset(0 0 0 ${clamped}%)`;
    handle.style.left = `${clamped}%`;
    handle.setAttribute('aria-valuenow', Math.round(clamped));
  }

  function percentFromClientX(clientX) {
    const rect = split.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  function onMove(clientX) {
    setPosition(percentFromClientX(clientX));
  }

  handle.addEventListener('pointerdown', (e) => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', (e) => {
    if (dragging) onMove(e.clientX);
  });
  handle.addEventListener('pointerup', () => { dragging = false; });
  handle.addEventListener('pointercancel', () => { dragging = false; });

  split.addEventListener('pointerdown', (e) => {
    if (e.target === handle) return;
    onMove(e.clientX);
  });

  // Keyboard accessibility
  handle.addEventListener('keydown', (e) => {
    const current = parseFloat(handle.style.left) || 50;
    if (e.key === 'ArrowLeft') setPosition(current - 5);
    if (e.key === 'ArrowRight') setPosition(current + 5);
  });

  setPosition(50);
}

/* --------------------------------------------------------------------------
   Back to top button
   -------------------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener(
    'scroll',
    () => {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    },
    { passive: true }
  );

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --------------------------------------------------------------------------
   Contact form — UI only, no backend
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const note = document.getElementById('contact-note');
  if (!form || !note) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.textContent = '> message queued — we\'ll respond within 24 hours.';
    form.reset();
    setTimeout(() => { note.textContent = ''; }, 5000);
  });
}
