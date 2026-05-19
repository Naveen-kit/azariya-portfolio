/* ═══════════════════════════════════════
   CURSOR SYSTEM
═══════════════════════════════════════ */
const curDot = document.getElementById('cur-dot');
const curRing = document.getElementById('cur-ring');
const trailWrap = document.getElementById('cur-trail-wrap');
const hudCoords = document.getElementById('hud-coords');
let cx = 0, cy = 0, rx = 0, ry = 0;
let trailTimeout;

if (window.matchMedia('(hover:hover)').matches) {
  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    curDot.style.left = cx + 'px'; curDot.style.top = cy + 'px';
    // HUD coordinates
    hudCoords.innerHTML = `X: ${cx.toFixed(1).padStart(6,'0')}<br>Y: ${cy.toFixed(1).padStart(6,'0')}<br>Z: 001.00`;
    // Trail particles
    clearTimeout(trailTimeout);
    trailTimeout = setTimeout(() => {
      const t = document.createElement('div');
      t.className = 'cur-trail';
      t.style.left = cx + 'px'; t.style.top = cy + 'px';
      t.style.width = (Math.random() * 4 + 2) + 'px';
      t.style.height = t.style.width;
      t.style.background = ['#ff0055','#00ffcc','#7700ff','#ff6600','#00aaff'][Math.floor(Math.random()*5)];
      trailWrap.appendChild(t);
      setTimeout(() => t.remove(), 600);
    }, 20);
  });
  (function animRing() {
    rx += (cx - rx) * .09; ry += (cy - ry) * .09;
    curRing.style.left = rx + 'px'; curRing.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
}

/* ═══════════════════════════════════════
   LOADER — EXTREME VERSION
═══════════════════════════════════════ */
// Generate data stream columns
const streamWrap = document.getElementById('ld-streams');
const chars = '01アイウエオカキクケコABCDEF0123456789!@#$%^&*(){}[]<>/\\|~';
for (let i = 0; i < 18; i++) {
  const s = document.createElement('div');
  s.className = 'ld-stream';
  s.style.left = (Math.random() * 100) + '%';
  s.style.animationDuration = (Math.random() * 8 + 4) + 's';
  s.style.animationDelay = (Math.random() * 3) + 's';
  s.style.opacity = Math.random() * .15 + .05;
  let txt = '';
  for (let j = 0; j < 40; j++) txt += chars[Math.floor(Math.random() * chars.length)] + '\n';
  s.textContent = txt;
  streamWrap.appendChild(s);
}

const statusMsgs = [
  'INITIALIZING CORE SYSTEMS...',
  'LOADING CREATIVE ASSETS...',
  'CALIBRATING NEON MATRIX...',
  'COMPILING DESIGN PATTERNS...',
  'RENDERING CYBER INTERFACE...',
  'OPTIMIZING ANIMATION PIPELINE...',
  'LOADING PIXEL SHADERS...',
  'SYSTEM READY — WELCOME'
];
let ldPct = 0;
const ldBar = document.getElementById('ld-bar');
const ldPctTxt = document.getElementById('ld-pct-txt');
const ldStatus = document.getElementById('ld-status');
const loader = document.getElementById('loader');

const ldInterval = setInterval(() => {
  ldPct += Math.random() * 5 + 1.5;
  if (ldPct >= 100) { ldPct = 100; clearInterval(ldInterval); setTimeout(() => loader.classList.add('gone'), 700); }
  const p = Math.min(ldPct, 100);
  ldBar.style.width = p + '%';
  ldPctTxt.textContent = Math.floor(p) + '%';
  ldStatus.textContent = statusMsgs[Math.min(Math.floor(p / 13), statusMsgs.length - 1)];
}, 55);

/* ═══════════════════════════════════════
   WEBGL PARTICLE SYSTEM
═══════════════════════════════════════ */
const glCanvas = document.getElementById('gl-canvas');
const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');

if (gl) {
  // Vertex shader
  const vsSource = `
    attribute vec2 a_pos;
    attribute float a_size;
    attribute vec3 a_color;
    attribute float a_alpha;
    uniform vec2 u_res;
    varying vec3 v_color;
    varying float v_alpha;
    void main() {
      vec2 clip = (a_pos / u_res) * 2.0 - 1.0;
      gl_Position = vec4(clip.x, -clip.y, 0, 1);
      gl_PointSize = a_size;
      v_color = a_color;
      v_alpha = a_alpha;
    }
  `;
  // Fragment shader — glowing circles
  const fsSource = `
    precision mediump float;
    varying vec3 v_color;
    varying float v_alpha;
    void main() {
      float d = distance(gl_PointCoord, vec2(0.5));
      if (d > 0.5) discard;
      float glow = 1.0 - smoothstep(0.0, 0.5, d);
      gl_FragColor = vec4(v_color, v_alpha * glow);
    }
  `;
  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s); return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog); gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const NUM = 280;
  const colors = [[1,0,.33],[0,1,.8],[.47,0,1],[1,.4,0],[0,.67,1],[1,.8,0]];
  let W2, H2;
  const pts2 = [];
  function resizeGL() {
    W2 = glCanvas.width = window.innerWidth;
    H2 = glCanvas.height = window.innerHeight;
    gl.viewport(0, 0, W2, H2);
  }
  resizeGL();
  window.addEventListener('resize', resizeGL);

  for (let i = 0; i < NUM; i++) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    pts2.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .5,
      vy: (Math.random() - .5) * .5,
      size: Math.random() * 4 + 1,
      color: c,
      alpha: Math.random() * .6 + .1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * .02 + .005
    });
  }

  const posLoc = gl.getAttribLocation(prog, 'a_pos');
  const sizeLoc = gl.getAttribLocation(prog, 'a_size');
  const colorLoc = gl.getAttribLocation(prog, 'a_color');
  const alphaLoc = gl.getAttribLocation(prog, 'a_alpha');
  const resLoc = gl.getUniformLocation(prog, 'u_res');

  const posBuf = gl.createBuffer();
  const sizeBuf = gl.createBuffer();
  const colorBuf = gl.createBuffer();
  const alphaBuf = gl.createBuffer();

  let glTime = 0;
  function renderGL() {
    glTime += .016;
    W2 = glCanvas.width; H2 = glCanvas.height;
    gl.viewport(0, 0, W2, H2);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(resLoc, W2, H2);

    const pos = new Float32Array(NUM * 2);
    const sizes = new Float32Array(NUM);
    const colorArr = new Float32Array(NUM * 3);
    const alphas = new Float32Array(NUM);

    pts2.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W2; if (p.x > W2) p.x = 0;
      if (p.y < 0) p.y = H2; if (p.y > H2) p.y = 0;
      const flicker = .5 + .5 * Math.sin(glTime * p.speed * 60 + p.phase);
      pos[i*2] = p.x; pos[i*2+1] = p.y;
      sizes[i] = p.size * (.7 + .3 * flicker);
      colorArr[i*3] = p.color[0]; colorArr[i*3+1] = p.color[1]; colorArr[i*3+2] = p.color[2];
      alphas[i] = p.alpha * flicker;
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, colorArr, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
    gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(alphaLoc);
    gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, NUM);
    requestAnimationFrame(renderGL);
  }
  renderGL();
} else {
  // Canvas2D fallback
  glCanvas.style.display = 'none';
}

/* ═══════════════════════════════════════
   NAVBAR
═══════════════════════════════════════ */
const mainNav = document.getElementById('main-nav');
let lastY2 = 0;
window.addEventListener('scroll', () => {
  const y = scrollY;
  mainNav.classList.toggle('solid', y > 50);
  if (y > lastY2 + 8 && y > 120) mainNav.classList.add('hide');
  else if (y < lastY2 - 5) mainNav.classList.remove('hide');
  lastY2 = y;
}, { passive: true });

/* ═══════════════════════════════════════
   MOBILE DRAWER
═══════════════════════════════════════ */
const burgerBtn = document.getElementById('burger');
const mobNavEl = document.getElementById('mob-nav');
let navOpen = false;
const toggleNav = v => {
  navOpen = v;
  burgerBtn.classList.toggle('open', v);
  mobNavEl.classList.toggle('open', v);
  burgerBtn.setAttribute('aria-expanded', v);
  document.body.style.overflow = v ? 'hidden' : '';
};
burgerBtn.addEventListener('click', () => toggleNav(!navOpen));
mobNavEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleNav(false)));

/* ═══════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════ */
const twPhrases = [
  'Designing the Future',
  'Building Beautiful UIs',
  'Crafting Brand Identity',
  'Animating the Web',
  'Creating Digital Magic',
  'Turning Ideas into Reality',
  'Pushing Creative Limits'
];
let twI = 0, twC = 0, twDel = false;
const twEl = document.getElementById('az-tw');
function tw() {
  const phrase = twPhrases[twI];
  twEl.textContent = twDel ? phrase.slice(0, --twC) : phrase.slice(0, ++twC);
  if (!twDel && twC === phrase.length) { twDel = true; setTimeout(tw, 1800); return; }
  if (twDel && twC === 0) { twDel = false; twI = (twI + 1) % twPhrases.length; }
  setTimeout(tw, twDel ? 45 : 85);
}
tw();

/* ═══════════════════════════════════════
   MANIFESTO PARTICLES
═══════════════════════════════════════ */
const mPWrap = document.getElementById('manifesto-particles');
if (mPWrap) {
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'manifesto-particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.width = (Math.random() * 3 + 1) + 'px';
    p.style.height = p.style.width;
    p.style.setProperty('--px', ((Math.random() - .5) * 60) + 'px');
    p.style.animationDuration = (Math.random() * 4 + 3) + 's';
    p.style.animationDelay = (Math.random() * 4) + 's';
    p.style.background = ['#ff0055','#00ffcc','#7700ff','#ff6600'][Math.floor(Math.random()*4)];
    mPWrap.appendChild(p);
  }
}

/* ═══════════════════════════════════════
   SERVICE ITEMS STAGGER ANIMATION
═══════════════════════════════════════ */
document.querySelectorAll('.srv-item').forEach((item, i) => {
  item.style.opacity = '0';
  item.style.transform = 'translateX(-20px)';
  item.style.transition = `opacity .6s ease ${i * .08}s, transform .6s ease ${i * .08}s, border-color .4s, box-shadow .4s`;
});
const srvObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.srv-item').forEach(item => {
      item.style.opacity = '1'; item.style.transform = 'none';
    });
    srvObs.unobserve(e.target);
  });
}, { threshold: .1 });
document.querySelectorAll('.srv-list').forEach(el => srvObs.observe(el));

/* ═══════════════════════════════════════
   CIRCULAR SKILL RINGS
═══════════════════════════════════════ */
function animateRing(el, pct) {
  const circumference = 2 * Math.PI * 20; // r=20
  const offset = circumference * (1 - pct / 100);
  el.style.strokeDashoffset = offset;
}
const ringObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.sk-ring-fill').forEach(ring => {
      const pct = +ring.dataset.pct;
      setTimeout(() => animateRing(ring, pct), 300);
    });
    e.target.querySelectorAll('.sk-bar-fill').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.w + '%'; }, 300);
    });
    ringObs.unobserve(e.target);
  });
}, { threshold: .15 });
document.querySelectorAll('.sk-card').forEach(c => ringObs.observe(c));

/* ═══════════════════════════════════════
   MASTER REVEAL + COUNTERS
═══════════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    // Counters
    e.target.querySelectorAll('[data-target]').forEach(el => {
      const target = +el.dataset.target, dur = 1500;
      let start = null;
      (function count(ts) {
        if (!start) start = ts;
        const prog = Math.min((ts - start) / dur, 1);
        el.textContent = Math.floor(prog * target);
        if (prog < 1) requestAnimationFrame(count);
        else el.textContent = target;
      })(performance.now());
    });
    revObs.unobserve(e.target);
  });
}, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.rv,.rv-l,.rv-r').forEach(el => revObs.observe(el));

/* ═══════════════════════════════════════
   PROFILE — 3D PARALLAX
═══════════════════════════════════════ */
const profileBubble = document.querySelector('.profile-bubble');
if (profileBubble && window.matchMedia('(hover:hover)').matches) {
  document.addEventListener('mousemove', e => {
    const rx2 = (e.clientX / innerWidth - .5) * 12;
    const ry2 = (e.clientY / innerHeight - .5) * 12;
    profileBubble.style.transform = `translateY(${Math.sin(Date.now()*.001)*10}px) perspective(600px) rotateY(${rx2}deg) rotateX(${-ry2}deg)`;
  });
}

/* ═══════════════════════════════════════
   PROJECT CARDS — 3D TILT
═══════════════════════════════════════ */
document.querySelectorAll('.pj-card').forEach(card => {
  if (!window.matchMedia('(hover:hover)').matches) return;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `translateY(-12px) rotateX(2deg) perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.01)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ═══════════════════════════════════════
   ABOUT CARDS — GLITCH ON HOVER
═══════════════════════════════════════ */
document.querySelectorAll('.abt-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.setProperty('--glitch-active', '1');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--glitch-active', '0');
  });
});

/* ═══════════════════════════════════════
   HERO PARALLAX RINGS
═══════════════════════════════════════ */
const heroRings = document.querySelectorAll('.hero-ring');
document.addEventListener('mousemove', e => {
  if (!window.matchMedia('(hover:hover)').matches) return;
  const dx = (e.clientX / innerWidth - .5) * 20;
  const dy = (e.clientY / innerHeight - .5) * 20;
  heroRings.forEach((ring, i) => {
    const factor = (i + 1) * .15;
    ring.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
  });
});

/* ═══════════════════════════════════════
   LIVE CLOCK IN HUD
═══════════════════════════════════════ */
function updateTime() {
  const now = new Date();
  const t = now.toTimeString().slice(0,8);
  const statusEl = document.querySelector('.hud-sb-item');
  if (statusEl && !statusEl.dataset.orig) statusEl.dataset.orig = statusEl.textContent;
}
setInterval(updateTime, 1000);

/* ═══════════════════════════════════════
   SECTION ACTIVE HIGHLIGHT
═══════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-links a');
const activeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinkEls.forEach(a => a.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.style.color = '#ff0055';
    }
  });
}, { threshold: .5 });
sections.forEach(s => activeObs.observe(s));

/* ═══════════════════════════════════════
   ACHIEVEMENT GLOW PULSE
═══════════════════════════════════════ */
document.querySelectorAll('.ach-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.boxShadow = '0 0 40px var(--card-glow, rgba(255,0,85,.2)), 0 20px 40px rgba(0,0,0,.4)';
  });
  card.addEventListener('mouseleave', () => { card.style.boxShadow = ''; });
});
