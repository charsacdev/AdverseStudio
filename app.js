/* =============================================
   ADVERSE STUDIO — APP JAVASCRIPT
   ============================================= */

// ── NAV SCROLL EFFECT ──────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ── HAMBURGER MENU ─────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── SCROLL REVEAL ──────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// ── COUNTER ANIMATION ──────────────────────────
function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target, parseInt(entry.target.dataset.count, 10));
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.hstat-num').forEach(el => counterObserver.observe(el));

// ── VAPOR CANVAS ───────────────────────────────
const canvas = document.getElementById('particleCanvas');
const ctx    = canvas.getContext('2d');
let width, height;

function resize() {
  // Use the hero section dimensions, not the canvas element (avoids scroll-triggered resize bugs)
  const hero = canvas.parentElement;
  width  = canvas.width  = hero.offsetWidth;
  height = canvas.height = hero.offsetHeight;
}

// Debounce resize so it never fires mid-scroll on iOS Safari
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
});
resize();

// Vapor puff — large soft radial gradient blob drifting upward
const VAPOR_COLORS = [
  { r: 124, g: 58,  b: 237 },  // violet
  { r: 168, g: 85,  b: 247 },  // purple
  { r: 236, g: 72,  b: 153 },  // pink
  { r: 14,  g: 165, b: 233 },  // sky
  { r: 99,  g: 102, b: 241 },  // indigo
  { r: 245, g: 158, b: 11  },  // amber (sparse)
];

class Vapor {
  constructor(initial) { this.init(initial); }

  init(initial = false) {
    const c = VAPOR_COLORS[Math.floor(Math.random() * VAPOR_COLORS.length)];
    this.cx   = c;
    this.x    = Math.random() * width;
    this.y    = initial ? Math.random() * height : height + 120;
    this.r    = 80 + Math.random() * 200;          // blob radius
    this.vy   = -(0.18 + Math.random() * 0.38);   // slow upward drift
    this.vx   = (Math.random() - 0.5) * 0.25;
    this.spin = (Math.random() - 0.5) * 0.003;    // gentle horizontal wobble
    this.t    = Math.random() * Math.PI * 2;        // wobble phase

    // Life cycle
    this.life     = 0;
    this.maxLife  = 420 + Math.random() * 300;
    this.fadeLen  = 120;                            // frames to fade in/out
    this.alpha    = 0;
    this.peakAlpha = 0.055 + Math.random() * 0.09; // keep subtle
  }

  update() {
    this.life++;
    this.t += this.spin;
    this.x += this.vx + Math.sin(this.t) * 0.3;
    this.y += this.vy;
    this.r += 0.15;                                // puff expands slightly

    // Fade in
    if (this.life < this.fadeLen) {
      this.alpha = (this.life / this.fadeLen) * this.peakAlpha;
    // Fade out
    } else if (this.life > this.maxLife - this.fadeLen) {
      this.alpha = ((this.maxLife - this.life) / this.fadeLen) * this.peakAlpha;
    } else {
      this.alpha = this.peakAlpha;
    }

    if (this.life >= this.maxLife || this.y + this.r < 0) this.init();
  }

  draw() {
    const { r: cr, g, b } = this.cx;
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    grad.addColorStop(0,   `rgba(${cr},${g},${b},${this.alpha})`);
    grad.addColorStop(0.4, `rgba(${cr},${g},${b},${this.alpha * 0.55})`);
    grad.addColorStop(1,   `rgba(${cr},${g},${b},0)`);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }
}

// Tiny bright sparkle dots riding through the vapor
class Sparkle {
  constructor(initial) { this.init(initial); }
  init(initial = false) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : height + 5;
    this.r = 0.5 + Math.random() * 1.5;
    this.vy = -(0.3 + Math.random() * 0.6);
    this.vx = (Math.random() - 0.5) * 0.3;
    this.alpha = 0;
    this.peak  = 0.3 + Math.random() * 0.5;
    this.life  = 0;
    this.max   = 200 + Math.random() * 200;
    this.color = VAPOR_COLORS[Math.floor(Math.random() * VAPOR_COLORS.length)];
  }
  update() {
    this.life++;
    const p = this.life / this.max;
    this.alpha = p < 0.2 ? (p / 0.2) * this.peak
               : p > 0.8 ? ((1 - p) / 0.2) * this.peak
               : this.peak;
    this.x += this.vx;
    this.y += this.vy;
    if (this.life >= this.max || this.y < -5) this.init();
  }
  draw() {
    const { r, g, b } = this.color;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.globalCompositeOperation = 'screen';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgb(${r},${g},${b})`;
    ctx.fill();
    ctx.restore();
  }
}

const vapors   = Array.from({ length: 55 }, () => new Vapor(true));
const sparkles = Array.from({ length: 80 }, () => new Sparkle(true));

let lastTime = 0;

(function animate(ts = 0) {
  requestAnimationFrame(animate);

  // If tab was hidden, rAF resumes with a huge elapsed gap — skip that frame
  // so vapors don't jump positions or go invisible from a stacked trail fill
  const delta = ts - lastTime;
  lastTime = ts;
  if (delta > 200) return; // gap > 200ms means tab was suspended — skip

  // clearRect each frame — no accumulated dark fill that eats the vapor
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, width, height);

  // Dark background drawn fresh — vapor overlays on top
  ctx.fillStyle = '#04040a';
  ctx.fillRect(0, 0, width, height);

  vapors.forEach(v   => { v.update(); v.draw(); });
  sparkles.forEach(s => { s.update(); s.draw(); });
})();

// ── 3D TILT ON COLLECTION CARDS ───────────────
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    card.style.transition = 'transform 0.1s ease';
    card.style.transform = `perspective(600px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateZ(10px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.5s ease';
    card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateZ(0)';
  });
});

// ── ACTIVE NAV LINK ON SCROLL ─────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${entry.target.id}` ? '#a855f7' : '';
      });
    }
  });
}, { threshold: 0.4 }).observe;

sections.forEach(s => {
  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${entry.target.id}` ? '#a855f7' : '';
        });
      }
    });
  }, { threshold: 0.4 }).observe(s);
});

// ── CURSOR GLOW ────────────────────────────────
const cursor = document.createElement('div');
cursor.style.cssText = `
  position:fixed;width:320px;height:320px;border-radius:50%;
  pointer-events:none;z-index:9999;
  background:radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%);
  transform:translate(-50%,-50%);mix-blend-mode:screen;
`;
document.body.appendChild(cursor);

let mouseX = -9999, mouseY = -9999, curX = -9999, curY = -9999;
window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
(function moveCursor() {
  curX += (mouseX - curX) * 0.1;
  curY += (mouseY - curY) * 0.1;
  cursor.style.left = curX + 'px';
  cursor.style.top  = curY + 'px';
  requestAnimationFrame(moveCursor);
})();
