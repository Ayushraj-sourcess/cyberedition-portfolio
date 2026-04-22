/* ═══════════════════════════════════════════════════
   CYBER EDITION — main.js
   Three.js scene, GSAP animations, cursor, carousel
═══════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────────── */
(function initLoader() {
  const bar    = document.getElementById('loader-bar');
  const pct    = document.getElementById('loader-pct');
  const loader = document.getElementById('loader');
  let prog = 0;

  const iv = setInterval(() => {
    prog += Math.random() * 12;
    if (prog >= 100) { prog = 100; clearInterval(iv); }
    bar.style.width  = prog + '%';
    pct.textContent  = Math.floor(prog) + '%';

    if (prog >= 100) {
      setTimeout(() => {
        loader.style.transition = 'opacity 0.6s';
        loader.style.opacity    = '0';
        setTimeout(() => {
          loader.style.display = 'none';
          initHeroAnimations(); // kick off hero entrance
        }, 600);
      }, 300);
    }
  }, 60);
})();

/* ─────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─────────────────────────────────────────────
   THREE.JS — HERO BACKGROUND
───────────────────────────────────────────── */
(function initThree() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 18);

  /* ── Cyber Grid Floor ── */
  const grid = new THREE.GridHelper(80, 40, 0x002244, 0x001133);
  grid.position.y = -8;
  scene.add(grid);

  /* ── Floating Particles ── */
  const count = 1800;
  const pos   = new Float32Array(count * 3);
  const col   = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 120;
    pos[i*3+1] = (Math.random() - 0.5) * 80;
    pos[i*3+2] = (Math.random() - 0.5) * 80;
    const t = Math.random();
    col[i*3]   = t < 0.5 ? 0.0 : 0.7;
    col[i*3+1] = t < 0.5 ? 0.83 : 0.31;
    col[i*3+2] = 1.0;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const pMat     = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.7 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── Wireframe Torus Knot ── */
  const tGeo  = new THREE.TorusKnotGeometry(4, 1, 100, 16);
  const tMat  = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.12 });
  const torus = new THREE.Mesh(tGeo, tMat);
  torus.position.set(10, 0, -10);
  scene.add(torus);

  /* ── Wireframe Icosahedron ── */
  const iGeo = new THREE.IcosahedronGeometry(3, 1);
  const iMat = new THREE.MeshBasicMaterial({ color: 0xb44fff, wireframe: true, transparent: true, opacity: 0.1 });
  const ico  = new THREE.Mesh(iGeo, iMat);
  ico.position.set(-12, 2, -8);
  scene.add(ico);

  /* ── Vertical Light Beams ── */
  for (let i = 0; i < 12; i++) {
    const h   = Math.random() * 12 + 4;
    const bGeo = new THREE.CylinderGeometry(0.02, 0.02, h, 4);
    const bMat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0x00d4ff : 0xb44fff,
      transparent: true, opacity: 0.2 + Math.random() * 0.3
    });
    const beam = new THREE.Mesh(bGeo, bMat);
    beam.position.set(
      (Math.random() - 0.5) * 40,
      -8 + h / 2,
      (Math.random() - 0.5) * 20 - 10
    );
    scene.add(beam);
  }

  /* ── Mouse Camera Parallax ── */
  let targetX = 0, targetY = 0, currX = 0, currY = 0;
  document.addEventListener('mousemove', e => {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * -1;
  });

  /* ── Resize Handler ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Render Loop ── */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    currX += (targetX - currX) * 0.04;
    currY += (targetY - currY) * 0.04;
    camera.position.x = currX * 3;
    camera.position.y = 2 + currY * 2;
    camera.lookAt(0, 0, 0);

    particles.rotation.y = t * 0.06;
    particles.rotation.x = t * 0.02;
    torus.rotation.x     = t * 0.4;
    torus.rotation.y     = t * 0.6;
    ico.rotation.y       = -t * 0.5;
    ico.rotation.x       = t * 0.3;
    grid.position.z      = (t * 2) % 2;

    renderer.render(scene, camera);
  }
  animate();
})();

/* ─────────────────────────────────────────────
   GSAP — HERO ENTRANCE + SCROLL REVEALS
───────────────────────────────────────────── */
function initHeroAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  /* Hero entrance sequence */
  const tl = gsap.timeline({ delay: 0.2 });
  tl.to('#hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    .to('#hero-title',   { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.3')
    .to('#hero-tagline', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
    .to('#hero-cta',     { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3')
    .to('.hero-scroll-hint', { opacity: 1, duration: 0.6 }, '-=0.2');

  /* Scroll-triggered reveal for all .reveal elements */
  document.querySelectorAll('.reveal').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => setTimeout(() => el.classList.add('visible'), i * 80)
    });
  });

  /* Skills rings — animate stroke-dashoffset on scroll */
  ScrollTrigger.create({
    trigger: '#skills',
    start: 'top 70%',
    onEnter: () => {
      document.querySelectorAll('.ring-fill').forEach(ring => {
        const pct          = parseInt(ring.dataset.pct);
        const circumference = 326.7;
        const offset        = circumference - (pct / 100) * circumference;
        setTimeout(() => { ring.style.strokeDashoffset = offset; }, 200);
      });
    }
  });
}

/* ─────────────────────────────────────────────
   CAROUSEL
───────────────────────────────────────────── */
(function initCarousel() {
  const track   = document.getElementById('carousel-track');
  if (!track) return;
  const prev    = document.getElementById('car-prev');
  const next    = document.getElementById('car-next');
  const cards   = track.querySelectorAll('.proj-card');
  const cardW   = 368; // card width (340) + gap (28)
  let idx       = 0;

  function getVisible() {
    if (window.innerWidth < 600)  return 1;
    if (window.innerWidth < 960)  return 2;
    return 3;
  }

  function clamp() {
    const max = Math.max(0, cards.length - getVisible());
    idx = Math.max(0, Math.min(idx, max));
  }

  function update() {
    clamp();
    track.style.transform = `translateX(-${idx * cardW}px)`;
  }

  prev.addEventListener('click', () => { idx--; update(); });
  next.addEventListener('click', () => { idx++; update(); });
  window.addEventListener('resize', update);

  /* Touch drag support */
  let startX = 0, dragging = false;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (!dragging) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? idx++ : idx--; update(); }
    dragging = false;
  });
})();

/* ─────────────────────────────────────────────
   PARALLAX — GRID ON SCROLL
───────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const el = document.querySelector('.cyber-grid');
  if (el) el.style.transform = `translateY(${window.scrollY * 0.2}px)`;
});

/* ─────────────────────────────────────────────
   CONTACT FORM — Formspree real submission
   Messages are delivered to cybereedition@gmail.com

   HOW TO ACTIVATE (one-time, free):
/* ═══════════════════════════════════════════════════════
   CONTACT FORM — EmailJS  (free, no backend needed)
   Sends messages directly to cybereedition@gmail.com

   ── SETUP STEPS (one time, ~5 minutes) ──────────────

   STEP 1 → Go to https://www.emailjs.com
            Sign Up Free → log in with cybereedition@gmail.com

   STEP 2 → Dashboard → "Email Services" → "Add New Service"
            Choose Gmail → Connect cybereedition@gmail.com
            Set Service ID exactly: cyber_edition_service
            Click "Add Service"

   STEP 3 → Dashboard → "Email Templates" → "Create New Template"
            Set Template ID exactly: cyber_edition_template
            Paste this as the template body:
            ─────────────────────────────
            New message from your Cyber Edition portfolio!

            Name:    {{from_name}}
            Email:   {{from_email}}
            Subject: {{subject}}
            Message: {{message}}
            ─────────────────────────────
            To Email:  cybereedition@gmail.com
            Reply To:  {{from_email}}
            Click Save.

   STEP 4 → Dashboard → Account (top right) → General
            Copy your Public Key (e.g. abc123XYZdef)
            Paste it below replacing YOUR_PUBLIC_KEY

   STEP 5 → Save this file and re-upload. Done! ✅
            Free plan = 200 emails/month.
════════════════════════════════════════════════════════ */

const EMAILJS_PUBLIC_KEY  = '6aopFgoBI0OPcOoxX';        // ← Paste your key here
const EMAILJS_SERVICE_ID  = 'cyber_edition_service';  // ← Must match Step 2
const EMAILJS_TEMPLATE_ID = 'cyber_edition_template'; // ← Must match Step 3

window.handleSubmit = async function(e) {
  e.preventDefault();

  const form = e.target;
  const btn  = form.querySelector('.submit-btn');
  const span = btn.querySelector('span');

  const from_name  = form.querySelector('#fname').value.trim();
  const from_email = form.querySelector('#femail').value.trim();
  const subject    = form.querySelector('#fsubject').value.trim() || 'Portfolio Enquiry';
  const message    = form.querySelector('#fmsg').value.trim();

  // Not configured yet
  if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
    showToast('Setup EmailJS first — see steps in main.js', 'warn');
    return;
  }

  // Sending state
  btn.disabled         = true;
  span.textContent     = 'Transmitting...';
  btn.style.background = 'linear-gradient(90deg,#1a1a2e,#16213e)';

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:  EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id:     EMAILJS_PUBLIC_KEY,
        template_params: { from_name, from_email, subject, message }
      })
    });

    if (res.ok) {
      span.textContent     = '✓ Message Transmitted!';
      btn.style.background = 'linear-gradient(90deg,#00fff7,#00d4ff)';
      showToast('Message sent! I will get back to you soon.', 'success');
      form.reset();
      setTimeout(() => {
        span.textContent     = 'Transmit Message';
        btn.style.background = '';
        btn.disabled         = false;
      }, 4000);
    } else {
      throw new Error('Status ' + res.status);
    }

  } catch (err) {
    span.textContent     = 'Transmission Failed';
    btn.style.background = 'linear-gradient(90deg,#ff2d78,#b44fff)';
    showToast('Could not send. WhatsApp or email me directly!', 'error');
    setTimeout(() => {
      span.textContent     = 'Transmit Message';
      btn.style.background = '';
      btn.disabled         = false;
    }, 4000);
    console.error('EmailJS error:', err);
  }
};

/* ─── Cyberpunk toast notification ─── */
function showToast(msg, type) {
  const old = document.getElementById('cyber-toast');
  if (old) old.remove();

  const colors = {
    success: 'linear-gradient(90deg,#00d4ff,#00fff7)',
    error:   'linear-gradient(90deg,#ff2d78,#b44fff)',
    warn:    'linear-gradient(90deg,#ffaa00,#ff6600)'
  };

  const toast = document.createElement('div');
  toast.id = 'cyber-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '32px',
    left:         '50%',
    transform:    'translateX(-50%) translateY(80px)',
    background:   colors[type] || colors.success,
    color:        '#050508',
    fontFamily:   "'Share Tech Mono', monospace",
    fontSize:     '0.82rem',
    fontWeight:   '700',
    letterSpacing:'2px',
    padding:      '14px 28px',
    borderRadius: '2px',
    zIndex:       '99999',
    boxShadow:    '0 8px 32px rgba(0,0,0,0.5)',
    transition:   'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
    whiteSpace:   'nowrap',
    clipPath:     'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)'
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}
