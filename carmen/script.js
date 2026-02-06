/*
* EW! you nerd, get the heck outta here
*/

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

document.addEventListener('DOMContentLoaded', () => {
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const wrap = document.getElementById('buttonsWrap');
  const overlay = document.getElementById('overlay');
  const closeOverlay = document.getElementById('closeOverlay');

  let noScale = 1;
  const NO_MIN_SCALE = 0.5;
  const NO_SHRINK_STEP = 0.06;
  function shrinkNo() {
    noScale = Math.max(NO_MIN_SCALE, +(noScale - NO_SHRINK_STEP).toFixed(3));
    noBtn.style.setProperty('--no-scale', noScale);
  }

  function getRects() {
    return {
      wrap: wrap.getBoundingClientRect(),
      no: noBtn.getBoundingClientRect(),
      yes: yesBtn.getBoundingClientRect()
    };
  }

  function intersects(a, b) {
    return !(a.left + a.width < b.left || b.left + b.width < a.left || a.top + a.height < b.top || b.top + b.height < a.top);
  }

  function moveNoButton() {
    const r = getRects();
    const btnW = r.no.width, btnH = r.no.height;
    const wrapW = r.wrap.width, wrapH = r.wrap.height;

    const yesRectLocal = { left: r.yes.left - r.wrap.left, top: r.yes.top - r.wrap.top, width: r.yes.width, height: r.yes.height };

    let attempt = 0;
    let x, y, candidate;

    do {
      x = Math.round(Math.random() * (wrapW - btnW));
      y = Math.round(Math.random() * (wrapH - btnH));
      candidate = { left: x, top: y, width: btnW, height: btnH };
      attempt++;
    } while (intersects(candidate, yesRectLocal) && attempt < 40);

    x = clamp(x, 4, Math.max(4, wrapW - btnW - 4));
    y = clamp(y, 4, Math.max(4, wrapH - btnH - 4));

    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
  }

  let lastMove = 0;
  function onPointerMove(e) {
    const now = Date.now();
    if (now - lastMove < 120) return;
    lastMove = now;
    const rect = getRects();
    const noCenter = { x: rect.no.left + rect.no.width / 2, y: rect.no.top + rect.no.height / 2 };
    const px = e.clientX != null ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
    const py = e.clientY != null ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY) || 0;
    const dist = Math.hypot(px - noCenter.x, py - noCenter.y);
    if (dist < 120) {
      moveNoButton();
      shrinkNo();
      noBtn.classList.add('wobble');
      setTimeout(() => noBtn.classList.remove('wobble'), 420);
      nudgeYes();
    }
  }
  wrap.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  const heartsContainer = document.querySelector('.hearts');

  function spawnHearts(n) {
    if (!heartsContainer) return;
    const wrapRect = wrap.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const h = document.createElement('div');
      h.className = 'heart-bubble';
      h.textContent = '❤';
      const left = Math.random() * (wrapRect.width - 20);
      const top = Math.random() * (wrapRect.height - 20);
      h.style.left = left + 'px';
      h.style.top = top + 'px';
      h.style.animationDelay = (Math.random() * 300) + 'ms';
      heartsContainer.appendChild(h);
      setTimeout(() => { h.remove(); }, 1500 + Math.random() * 400);
    }
  }

  let evadeCount = 0;
  function nudgeYes() {
    evadeCount++;
    if (evadeCount % 3 !== 0) return;
    yesBtn.classList.remove('nudge');

    void yesBtn.offsetWidth;
    yesBtn.classList.add('nudge');
    setTimeout(() => yesBtn.classList.remove('nudge'), 580);
  }

  function evade(e) {
    if (e && e.preventDefault) e.preventDefault();
    moveNoButton();
    shrinkNo();
    nudgeYes();
  }

  noBtn.addEventListener('click', (e) => { e.preventDefault(); evade(e); });
  noBtn.addEventListener('pointerdown', evade, { passive: false });
  noBtn.addEventListener('touchstart', evade, { passive: false });

  window.addEventListener('resize', () => { setTimeout(moveNoButton, 120); });

  yesBtn.addEventListener('click', () => {
    // small pop + hearts
    yesBtn.classList.add('pop');
    setTimeout(() => yesBtn.classList.remove('pop'), 380);
    spawnHearts(10);
    overlay.classList.remove('hidden');
  });
  closeOverlay.addEventListener('click', () => { overlay.classList.add('hidden'); });

  setTimeout(moveNoButton, 80);
  const rats = document.querySelectorAll('.dancing-rats .rat');
  const ratOverlay = document.getElementById('ratVideoOverlay');
  const ratIframe = document.getElementById('ratVideoIframe');
  const closeRatVideo = document.getElementById('closeRatVideo');
  const ratBtn = document.getElementById('ratBtn');
  const WATCH_URL = 'https://www.youtube.com/watch?v=OXQwx1EolD8';

  // Build an embed URL with origin when possible; prefer muted autoplay to reduce autoplay blocking
  function buildEmbedURL() {
    const origin = window.location && window.location.origin ? window.location.origin : null;
    // if page is loaded from file:// or origin is null, embedding often fails (YouTube returns errors)
    if (!origin || window.location.protocol === 'file:' || origin === 'null') return null;
    return 'https://www.youtube.com/embed/OXQwx1EolD8?autoplay=1&rel=0&mute=1&enablejsapi=1&origin=' + encodeURIComponent(origin);
  }

  function openVideoOverlayOrFallback() {
    const embed = buildEmbedURL();
    if (!embed) {
      // fallback: open YouTube watch page in a new tab (avoids embed/origin errors)
      window.open(WATCH_URL, '_blank', 'noopener');
      return;
    }
    ratIframe.src = embed;
    ratOverlay.classList.remove('hidden');
    ratOverlay.setAttribute('aria-hidden', 'false');
  }

  rats.forEach(r => {
    r.style.cursor = 'pointer';
    r.addEventListener('click', (ev) => {
      ev.stopPropagation();
      openVideoOverlayOrFallback();
    });
  });

  if (ratBtn) {
    ratBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openVideoOverlayOrFallback();
    });
  }

  function closeRat() {
    ratIframe.src = '';
    ratOverlay.classList.add('hidden');
    ratOverlay.setAttribute('aria-hidden', 'true');
  }

  closeRatVideo.addEventListener('click', (e) => { e.preventDefault(); closeRat(); });

  ratOverlay.addEventListener('click', (e) => { if (e.target === ratOverlay) closeRat(); });
});
