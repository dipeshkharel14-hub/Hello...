/* ═══════════════════════════════════════════════════════════════
   NEXUS DIGITAL AGENCY — MAIN JAVASCRIPT
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── UTILITY FUNCTIONS ────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const map = (v, a1, a2, b1, b2) => b1 + ((v - a1) / (a2 - a1)) * (b2 - b1);
const debounce = (fn, ms) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };
const throttle = (fn, ms) => { let t = 0; return (...args) => { const now = Date.now(); if (now - t > ms) { t = now; fn(...args); } }; };
const formatNumber = (n) => n.toLocaleString();
const formatCurrency = (n) => '$' + n.toLocaleString();
const randomBetween = (a, b) => a + Math.random() * (b - a);
const randomInt = (a, b) => Math.floor(randomBetween(a, b));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// ─── STATE ────────────────────────────────────────────────────
const State = {
  theme: localStorage.getItem('theme') || 'dark',
  mobileOpen: false,
  statsAnimated: false,
  skillsAnimated: false,
  chartDrawn: false,
  currentTestimonial: 0,
  totalTestimonials: 3,
  mouseX: 0,
  mouseY: 0,
  cursorX: 0,
  cursorY: 0,
  followerX: 0,
  followerY: 0,
};

// ─── LOADER ───────────────────────────────────────────────────
function initLoader() {
  const loader = $('#loader');
  const counter = $('#loaderCounter');
  const fill = $('#loaderFill');
  if (!loader) return;

  let progress = 0;
  const target = 100;
  const duration = 1800;
  const startTime = performance.now();

  function updateLoader(ts) {
    const elapsed = ts - startTime;
    progress = Math.min(Math.floor((elapsed / duration) * target), target);
    counter.textContent = progress;
    fill.style.width = progress + '%';
    if (progress < target) {
      requestAnimationFrame(updateLoader);
    } else {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        animateHeroLines();
      }, 300);
    }
  }

  document.body.style.overflow = 'hidden';
  requestAnimationFrame(updateLoader);
}

// ─── HERO CANVAS (PARTICLE FIELD) ────────────────────────────
function initHeroCanvas() {
  const canvas = $('#heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], mouseX = 0, mouseY = 0, animId;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.6 + 0.1;
      this.life = 0;
      this.maxLife = randomInt(200, 400);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      // Mouse repulsion
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        this.vx += dx / dist * 0.3;
        this.vy += dy / dist * 0.3;
      }
      this.vx *= 0.98;
      this.vy *= 0.98;
      if (this.x < 0 || this.x > w || this.y < 0 || this.y > h || this.life > this.maxLife) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 77, 0, ${this.opacity})`;
      ctx.fill();
    }
  }

  function createParticles(count = 120) {
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 77, 0, ${(1 - dist / 100) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', debounce(() => { resize(); createParticles(); }, 200));
  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
}

// ─── NEURAL NETWORK CANVAS (WORK SECTION) ────────────────────
function initNeuralCanvas() {
  const canvas = $('#neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layers = [[3, 4], [4, 4], [4, 3], [3, 2]];
  const nodes = [];
  const connections = [];
  let t = 0;

  // Build node positions
  let cols = [2, 3, 5, 8, 14, 24, 38, 62];
  for (let l = 0; l < layers.length; l++) {
    const count = layers[l][0];
    const x = (l / (layers.length - 1)) * (w - 40) + 20;
    for (let n = 0; n < count; n++) {
      const y = ((n + 0.5) / count) * h;
      nodes.push({ x, y, l, n });
    }
  }

  // Build connections
  for (let l = 0; l < layers.length - 1; l++) {
    const thisLayer = nodes.filter(n => n.l === l);
    const nextLayer = nodes.filter(n => n.l === l + 1);
    thisLayer.forEach(a => {
      nextLayer.forEach(b => {
        connections.push({ a, b, weight: Math.random() });
      });
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    t += 0.02;

    connections.forEach(c => {
      const pulse = (Math.sin(t + c.weight * 10) + 1) / 2;
      ctx.beginPath();
      ctx.moveTo(c.a.x, c.a.y);
      ctx.lineTo(c.b.x, c.b.y);
      ctx.strokeStyle = `rgba(0, 212, 255, ${pulse * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    nodes.forEach(n => {
      const pulse = (Math.sin(t + n.l + n.n) + 1) / 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${0.4 + pulse * 0.6})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ─── GROWTH CHART ─────────────────────────────────────────────
function drawGrowthChart() {
  const canvas = $('#growthChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.offsetWidth || 800;
  const h = 200;
  canvas.width = w;
  canvas.height = h;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const datasets = [
    { data: [45,52,48,61,58,72,68,80,76,88,85,92], color: '#ff4d00' },
    { data: [60,68,65,80,78,90,88,100,98,110,108,120], color: '#00d4ff' },
    { data: [80,90,88,102,100,115,112,128,125,140,138,155], color: '#a855f7' },
  ];

  const padL = 40, padR = 20, padT = 20, padB = 40;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxVal = 160;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '10px Space Mono, monospace';
    ctx.fillText(Math.round(maxVal - (i / 4) * maxVal) + 'k', 0, y + 4);
  }

  // Month labels
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '9px Space Mono, monospace';
  months.forEach((m, i) => {
    const x = padL + (i / (months.length - 1)) * chartW;
    ctx.fillText(m, x - 8, h - 8);
  });

  let progress = 0;
  const duration = 1500;
  const startTime = performance.now();

  function animChart(ts) {
    const elapsed = ts - startTime;
    progress = clamp(elapsed / duration, 0, 1);
    const eased = easeOutCubic(progress);

    ctx.clearRect(padL, 0, chartW + padR, h - padB);

    // Redraw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
    }

    datasets.forEach((ds, di) => {
      const pointCount = Math.max(2, Math.round(eased * months.length));
      const points = ds.data.slice(0, pointCount).map((v, i) => ({
        x: padL + (i / (months.length - 1)) * chartW,
        y: padT + (1 - v / maxVal) * chartH,
      }));

      // Area
      const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
      grad.addColorStop(0, ds.color + '30');
      grad.addColorStop(1, ds.color + '00');
      ctx.beginPath();
      points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padT + chartH);
      ctx.lineTo(points[0].x, padT + chartH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Dots
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = ds.color;
        ctx.fill();
      });
    });

    if (progress < 1) requestAnimationFrame(animChart);
  }

  requestAnimationFrame(animChart);
}

// ─── CUSTOM CURSOR ────────────────────────────────────────────
function initCursor() {
  const cursor = $('#cursor');
  const follower = $('#cursorFollower');
  if (!cursor || !follower) return;

  document.addEventListener('mousemove', e => {
    State.mouseX = e.clientX;
    State.mouseY = e.clientY;
  });

  function animateCursor() {
    State.cursorX = lerp(State.cursorX, State.mouseX, 0.9);
    State.cursorY = lerp(State.cursorY, State.mouseY, 0.9);
    State.followerX = lerp(State.followerX, State.mouseX, 0.12);
    State.followerY = lerp(State.followerY, State.mouseY, 0.12);

    cursor.style.left = State.cursorX + 'px';
    cursor.style.top = State.cursorY + 'px';
    follower.style.left = State.followerX + 'px';
    follower.style.top = State.followerY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverTargets = $$('a, button, .service-card, .work-item, .filter-btn, .faq-q, .dot, .team-card, .social-link, .client-logo, .stack-items span, .back-to-top');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      follower.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      follower.classList.remove('hovered');
    });
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '0.5';
  });
}

// ─── NAVIGATION ───────────────────────────────────────────────
function initNav() {
  const nav = $('#nav');
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobileMenu');
  const mobileLinks = $$('.mobile-link');
  if (!nav) return;

  function handleScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', throttle(handleScroll, 50));
  handleScroll();

  hamburger?.addEventListener('click', () => {
    State.mobileOpen = !State.mobileOpen;
    hamburger.classList.toggle('open', State.mobileOpen);
    mobileMenu?.classList.toggle('open', State.mobileOpen);
    document.body.style.overflow = State.mobileOpen ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      State.mobileOpen = false;
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link highlight
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(section => {
      if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
        navLinks.forEach(link => {
          link.classList.toggle('active-nav',
            link.getAttribute('href') === '#' + section.id
          );
        });
      }
    });
  }
  window.addEventListener('scroll', throttle(updateActiveLink, 100));
}

// ─── THEME TOGGLE ─────────────────────────────────────────────
function initTheme() {
  const toggle = $('#themeToggle');
  document.documentElement.setAttribute('data-theme', State.theme);

  toggle?.addEventListener('click', () => {
    State.theme = State.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', State.theme);
    localStorage.setItem('theme', State.theme);
    showToast(`Switched to ${State.theme} mode`, 'success');
  });
}

// ─── SCROLL REVEAL ────────────────────────────────────────────
function initReveal() {
  const reveals = $$('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Trigger specific animations
        const el = entry.target;
        if (el.classList.contains('stats-grid') || el.closest('.stats-grid')) {
          animateCounters();
        }
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));

  // Staggered reveal for service cards
  $$('.service-card').forEach((card, i) => {
    card.style.transitionDelay = (i * 0.08) + 's';
    observer.observe(card);
  });
}

// ─── COUNTER ANIMATION ────────────────────────────────────────
function animateCounters() {
  if (State.statsAnimated) return;
  State.statsAnimated = true;

  $$('.stat-number').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    const start = performance.now();

    function tick(ts) {
      const elapsed = ts - start;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutCubic(progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ─── SKILL BARS ───────────────────────────────────────────────
function initSkillBars() {
  const skillSection = $('.skills-section');
  if (!skillSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !State.skillsAnimated) {
        State.skillsAnimated = true;
        $$('.skill-bar-fill').forEach(bar => {
          const width = bar.getAttribute('data-width');
          bar.style.width = width + '%';
        });
        $$('.skill-pct').forEach(el => {
          const target = parseInt(el.getAttribute('data-pct'), 10);
          const duration = 1500;
          const start = performance.now();
          function tick(ts) {
            const p = clamp((ts - start) / duration, 0, 1);
            el.textContent = Math.round(easeOutCubic(p) * target) + '%';
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });

        // Draw chart too
        if (!State.chartDrawn) {
          State.chartDrawn = true;
          drawGrowthChart();
        }
      }
    });
  }, { threshold: 0.3 });

  observer.observe(skillSection);
}

// ─── WORK FILTER ──────────────────────────────────────────────
function initWorkFilter() {
  const filterBtns = $$('.filter-btn');
  const workItems = $$('.work-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      workItems.forEach((item, i) => {
        const category = item.getAttribute('data-category');
        const show = filter === 'all' || category === filter;
        item.style.display = show ? '' : 'none';
        if (show) {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, i * 60);
        }
      });

      showToast(`Showing: ${filter === 'all' ? 'All Projects' : filter.toUpperCase()}`, 'success');
    });
  });
}

// ─── TESTIMONIALS ─────────────────────────────────────────────
function initTestimonials() {
  const slides = $$('.testimonial-slide');
  const dots = $$('.dot');
  const prev = $('#tPrev');
  const next = $('#tNext');
  if (!slides.length) return;

  function goTo(index) {
    slides[State.currentTestimonial]?.classList.remove('active');
    dots[State.currentTestimonial]?.classList.remove('active');
    State.currentTestimonial = (index + State.totalTestimonials) % State.totalTestimonials;
    slides[State.currentTestimonial]?.classList.add('active');
    dots[State.currentTestimonial]?.classList.add('active');
  }

  prev?.addEventListener('click', () => goTo(State.currentTestimonial - 1));
  next?.addEventListener('click', () => goTo(State.currentTestimonial + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Auto-advance
  let autoInterval = setInterval(() => goTo(State.currentTestimonial + 1), 5000);
  const carousel = $('#testimonialCarousel');
  carousel?.addEventListener('mouseenter', () => clearInterval(autoInterval));
  carousel?.addEventListener('mouseleave', () => {
    autoInterval = setInterval(() => goTo(State.currentTestimonial + 1), 5000);
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(State.currentTestimonial - 1);
    if (e.key === 'ArrowRight') goTo(State.currentTestimonial + 1);
  });
}

// ─── FAQ ACCORDION ────────────────────────────────────────────
function initFAQ() {
  const faqItems = $$('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn?.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

// ─── CONTACT FORM ─────────────────────────────────────────────
function initContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  // Budget slider
  const slider = $('#budgetSlider');
  const display = $('#budgetDisplay');
  slider?.addEventListener('input', () => {
    display.textContent = formatCurrency(parseInt(slider.value));
  });

  // Character counter
  const textarea = form.querySelector('textarea');
  const charCount = $('#charCount');
  textarea?.addEventListener('input', () => {
    const len = textarea.value.length;
    charCount.textContent = len;
    charCount.style.color = len > 450 ? '#ef4444' : '';
  });

  // Validation
  function validateField(input, errorId, rules) {
    const error = $('#' + errorId);
    if (!error) return true;
    let msg = '';
    const val = input.value.trim();
    if (rules.required && !val) msg = 'This field is required';
    else if (rules.email && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Please enter a valid email';
    else if (rules.minLen && val.length < rules.minLen) msg = `Minimum ${rules.minLen} characters`;
    input.classList.toggle('error', !!msg);
    error.textContent = msg;
    return !msg;
  }

  function validateForm() {
    let valid = true;
    valid = validateField(form.name, 'nameError', { required: true, minLen: 2 }) && valid;
    valid = validateField(form.email, 'emailError', { required: true, email: true }) && valid;
    valid = validateField(form.service, 'serviceError', { required: true }) && valid;
    valid = validateField(form.message, 'messageError', { required: true, minLen: 20 }) && valid;
    return valid;
  }

  // Real-time validation
  ['name', 'email', 'service', 'message'].forEach(name => {
    form[name]?.addEventListener('blur', () => {
      const rules = { required: true };
      if (name === 'email') rules.email = true;
      if (name === 'message') rules.minLen = 20;
      if (name === 'name') rules.minLen = 2;
      validateField(form[name], name + 'Error', rules);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }
    const btn = $('#submitBtn');
    const btnText = btn.querySelector('span');
    const successMsg = $('#formSuccess');
    btn.disabled = true;
    btnText.textContent = 'SENDING...';

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1800));

    btn.style.display = 'none';
    successMsg.style.display = 'block';
    form.reset();
    display.textContent = '$25,000';
    charCount.textContent = '0';
    showToast('Message sent successfully! 🎉', 'success');

    setTimeout(() => {
      btn.style.display = '';
      btn.disabled = false;
      btnText.textContent = 'SEND MESSAGE';
      successMsg.style.display = 'none';
    }, 6000);
  });
}

// ─── TOAST NOTIFICATIONS ──────────────────────────────────────
function showToast(message, type = 'default') {
  const container = $('#toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ─── SMOOTH SCROLL ────────────────────────────────────────────
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.offsetTop - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  // Back to top
  const backToTop = $('#backToTop');
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Show/hide back to top based on scroll
  window.addEventListener('scroll', throttle(() => {
    backToTop?.style.setProperty('opacity', window.scrollY > 600 ? '1' : '0.3');
  }, 100));
}

// ─── AI WAVE PREVIEW ──────────────────────────────────────────
function initAIWave() {
  const container = $('#aiWave');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.width = container.offsetWidth || 200;
  canvas.height = 60;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const waves = [
      { amp: 12, freq: 0.04, speed: 2, color: 'rgba(236,72,153,0.8)' },
      { amp: 8, freq: 0.06, speed: 3, color: 'rgba(236,72,153,0.4)' },
      { amp: 15, freq: 0.03, speed: 1.5, color: 'rgba(255,255,255,0.15)' },
    ];

    waves.forEach(wave => {
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + wave.amp * Math.sin(x * wave.freq + t * wave.speed);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    t += 0.05;
    requestAnimationFrame(draw);
  }
  draw();
}

// ─── PARALLAX ─────────────────────────────────────────────────
function initParallax() {
  window.addEventListener('scroll', throttle(() => {
    const scrollY = window.scrollY;
    const heroCanvas = $('#heroCanvas');
    if (heroCanvas) {
      heroCanvas.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, 16));
}

// ─── ANIMATED SECTION TAGS ────────────────────────────────────
function initSectionTags() {
  const tags = $$('.section-tag');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        typewriterEffect(entry.target, entry.target.getAttribute('data-text') || entry.target.textContent);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  tags.forEach(tag => {
    tag.setAttribute('data-text', tag.textContent);
    observer.observe(tag);
  });
}

function typewriterEffect(el, text) {
  let i = 0;
  el.textContent = '';
  const interval = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 30);
}

// ─── HERO TITLE ANIMATION ─────────────────────────────────────
function animateHeroLines() {
  // Triggered after loader
  $$('.hero-title .line').forEach(line => {
    line.style.animationPlayState = 'running';
  });
}

// ─── HOVER TILT EFFECT ────────────────────────────────────────
function initTiltEffect() {
  const cards = $$('.service-card, .stat-card, .work-item');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ─── KEYBOARD ACCESSIBILITY ───────────────────────────────────
function initKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close mobile menu
      if (State.mobileOpen) {
        State.mobileOpen = false;
        $('#hamburger')?.classList.remove('open');
        $('#mobileMenu')?.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
}

// ─── READING PROGRESS ─────────────────────────────────────────
function initReadingProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 2px;
    background: var(--accent); z-index: 9999;
    width: 0%; transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', throttle(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (scrollTop / docHeight * 100) + '%';
  }, 16));
}

// ─── SPOTLIGHT EFFECT ON HERO ─────────────────────────────────
function initHeroSpotlight() {
  const hero = $('.hero');
  if (!hero) return;
  hero.addEventListener('mousemove', throttle((e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,77,0,0.04) 0%, transparent 50%), var(--bg)`;
  }, 30));
  hero.addEventListener('mouseleave', () => {
    hero.style.background = '';
  });
}

// ─── STAGGER ANIMATION FOR LOGOS ──────────────────────────────
function initClientLogos() {
  const logos = $$('.client-logo');
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      logos.forEach((logo, i) => {
        setTimeout(() => {
          logo.style.opacity = '1';
          logo.style.transform = 'translateY(0)';
        }, i * 100);
      });
    }
  }, { threshold: 0.5 });

  logos.forEach(logo => {
    logo.style.opacity = '0';
    logo.style.transform = 'translateY(12px)';
    logo.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const logosSection = $('.client-logos');
  if (logosSection) observer.observe(logosSection);
}

// ─── DYNAMIC YEAR ─────────────────────────────────────────────
function updateYear() {
  const yearEls = $$('[data-year]');
  yearEls.forEach(el => el.textContent = new Date().getFullYear());
}

// ─── RESIZE HANDLER ───────────────────────────────────────────
function initResizeHandler() {
  window.addEventListener('resize', debounce(() => {
    if (State.chartDrawn) drawGrowthChart();
  }, 400));
}

// ─── ANALYTICS (MOCK) ─────────────────────────────────────────
const Analytics = {
  events: [],
  track(event, data = {}) {
    this.events.push({ event, data, ts: Date.now() });
    // In production: send to analytics service
  },
  getEvents() { return this.events; },
};

// Track page interactions
function initAnalytics() {
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Analytics.track('filter_click', { filter: btn.dataset.filter });
    });
  });

  $$('.service-card').forEach((card, i) => {
    card.addEventListener('click', () => {
      Analytics.track('service_click', { index: i });
    });
  });

  $$('.work-link').forEach((link, i) => {
    link.addEventListener('click', () => {
      Analytics.track('work_click', { index: i });
    });
  });

  $('#contactForm')?.addEventListener('submit', () => {
    Analytics.track('form_submit', { ts: Date.now() });
  });

  // Time on page tracking
  const start = Date.now();
  window.addEventListener('beforeunload', () => {
    Analytics.track('page_exit', { duration: Date.now() - start });
  });
}

// ─── INTERSECTION OBSERVER FOR CHART ─────────────────────────
function initChartObserver() {
  const chartSection = $('.chart-section');
  if (!chartSection) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !State.chartDrawn) {
      State.chartDrawn = true;
      setTimeout(drawGrowthChart, 200);
    }
  }, { threshold: 0.4 });
  observer.observe(chartSection);
}

// ─── DYNAMIC TEXT SCRAMBLE ────────────────────────────────────
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const len = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:var(--accent);opacity:0.5">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

function initTextScramble() {
  const badge = $('.hero-badge');
  if (!badge) return;
  const scrambler = new TextScramble(badge);
  const phrases = [
    '● AVAILABLE FOR PROJECTS — 2026',
    '● BUILDING DIGITAL FUTURES',
    '● CRAFTING EXPERIENCES',
    '● AVAILABLE FOR PROJECTS — 2026',
  ];
  let idx = 0;
  function cycle() {
    scrambler.setText(phrases[idx]).then(() => {
      setTimeout(() => {
        idx = (idx + 1) % phrases.length;
        cycle();
      }, 3500);
    });
  }
  setTimeout(cycle, 3000);
}

// ─── SERVICE CARD DETAIL MODAL ────────────────────────────────
const serviceDetails = {
  0: { title: 'Web Development', desc: 'We specialize in React, Next.js, Vue.js, and Node.js. Our teams build performant, scalable, and accessible web applications from scratch or help modernize existing codebases. We follow best practices in CI/CD, testing, and code review.' },
  1: { title: 'UI/UX Design', desc: 'We create user-centered designs backed by research. Our workflow includes discovery, wireframing, prototyping, user testing, and high-fidelity Figma designs with complete handoff-ready specifications.' },
  2: { title: 'AI Integration', desc: 'We integrate large language models, computer vision, and recommendation systems into your products. From OpenAI APIs to custom model fine-tuning and deployment, we handle the full AI engineering lifecycle.' },
  3: { title: 'Brand Identity', desc: 'We craft comprehensive brand identities including logos, color systems, typography, iconography, and brand guidelines. Every brand we create tells a compelling story.' },
  4: { title: 'Performance Audit', desc: 'Our experts audit your site for Core Web Vitals, SEO issues, accessibility, and conversion blockers. You receive a detailed report with prioritized fixes and expected impact estimates.' },
  5: { title: 'Digital Strategy', desc: 'We help you make smart technology decisions. From platform selection to team structure, OKR frameworks to growth playbooks, we align your digital initiatives with business outcomes.' },
};

function initServiceModals() {
  $$('.service-card').forEach((card, i) => {
    card.addEventListener('click', () => {
      const detail = serviceDetails[i];
      if (!detail) return;
      showModal(detail.title, detail.desc);
      Analytics.track('service_detail_view', { service: i });
    });
  });
}

function showModal(title, body) {
  const existing = $('.modal-overlay');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box">
      <button class="modal-close">✕</button>
      <h3>${title}</h3>
      <p>${body}</p>
      <a href="#contact" class="btn btn-primary modal-cta">GET STARTED →</a>
    </div>
  `;
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9000;
    background: rgba(0,0,0,0.7); display: flex;
    align-items: center; justify-content: center;
    padding: 24px; backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease;
  `;
  modal.querySelector('.modal-box').style.cssText = `
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 48px; max-width: 520px; width: 100%;
    position: relative; animation: fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1);
  `;
  modal.querySelector('h3').style.cssText = `
    font-family: var(--font-display); font-size: 1.8rem; font-weight: 700;
    margin-bottom: 16px; color: var(--text);
  `;
  modal.querySelector('p').style.cssText = `
    color: var(--text-2); line-height: 1.7; margin-bottom: 32px; font-size: 0.95rem;
  `;
  modal.querySelector('.modal-close').style.cssText = `
    position: absolute; top: 20px; right: 20px;
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid var(--border); color: var(--text-2);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; cursor: pointer; transition: all 0.3s;
    background: none; font-family: inherit;
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.modal-close');
  const ctaBtn = modal.querySelector('.modal-cta');

  function close() {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  ctaBtn.addEventListener('click', close);
  document.body.style.overflow = 'hidden';

  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', handler); }
  });
}

// ─── SCROLL PROGRESS INDICATOR ────────────────────────────────
function initSectionProgress() {
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed; right: 24px; top: 50%;
    transform: translateY(-50%);
    display: flex; flex-direction: column; gap: 8px;
    z-index: 100;
  `;

  const sectionIds = ['home', 'services', 'work', 'about', 'stats', 'contact'];
  const dots = sectionIds.map(id => {
    const dot = document.createElement('div');
    dot.setAttribute('data-section', id);
    dot.style.cssText = `
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--border); cursor: pointer;
      transition: all 0.3s; border: 1px solid var(--text-3);
    `;
    dot.addEventListener('click', () => {
      const target = document.getElementById(id);
      if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
    indicator.appendChild(dot);
    return dot;
  });

  document.body.appendChild(indicator);

  function updateDots() {
    const scrollY = window.scrollY + window.innerHeight / 2;
    sectionIds.forEach((id, i) => {
      const section = document.getElementById(id);
      if (!section) return;
      const active = scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight;
      dots[i].style.background = active ? 'var(--accent)' : 'var(--border)';
      dots[i].style.transform = active ? 'scale(1.6)' : 'scale(1)';
    });
  }

  window.addEventListener('scroll', throttle(updateDots, 50));
  updateDots();

  // Hide on mobile
  const mq = window.matchMedia('(max-width: 900px)');
  indicator.style.display = mq.matches ? 'none' : 'flex';
  mq.addEventListener('change', e => { indicator.style.display = e.matches ? 'none' : 'flex'; });
}

// ─── MAIN INIT ────────────────────────────────────────────────
function init() {
  initLoader();
  initCursor();
  initNav();
  initTheme();
  initReveal();
  initSkillBars();
  initWorkFilter();
  initTestimonials();
  initFAQ();
  initContactForm();
  initSmoothScroll();
  initParallax();
  initHeroSpotlight();
  initClientLogos();
  initTiltEffect();
  initKeyboardNav();
  initReadingProgress();
  initResizeHandler();
  initAnalytics();
  initTextScramble();
  initServiceModals();
  initSectionProgress();
  initChartObserver();
  initSectionTags();
  updateYear();

  // Canvas inits (defer for performance)
  requestAnimationFrame(() => {
    initHeroCanvas();
    initNeuralCanvas();
    initAIWave();
  });

  // Expose analytics to console for debugging
  window.__nexusAnalytics = Analytics;
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
