(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Smart header: hides on scroll down, returns on scroll up ---------- */
  const header = $('#header');
  const menu = $('#mobileMenu');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    const menuOpen = menu.classList.contains('is-open');
    if (!menuOpen && Math.abs(y - lastY) > 6) {
      header.classList.toggle('is-hidden', y > lastY && y > 160);
      lastY = y;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuBtn');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('.menu-open', menuBtn).classList.toggle('hidden', open);
    $('.menu-close', menuBtn).classList.toggle('hidden', !open);
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Hero word rotator ---------- */
  const rotator = $('#rotator');
  const words = $$('span', rotator);
  let wi = 0;
  // Animate the rotator's width to the active word so the line re-centres smoothly
  const fitRotator = () => { rotator.style.width = `${words[wi].offsetWidth}px`; };
  fitRotator();
  document.fonts?.ready.then(fitRotator);
  window.addEventListener('resize', fitRotator);
  if (!reduceMotion) {
    setInterval(() => {
      if (document.hidden) return;
      const cur = words[wi];
      wi = (wi + 1) % words.length;
      cur.classList.remove('is-active');
      cur.classList.add('is-leaving');
      words[wi].classList.remove('is-leaving');
      words[wi].classList.add('is-active');
      fitRotator();
      setTimeout(() => cur.classList.remove('is-leaving'), 800);
    }, 2600);
  }

  /* Hero photo zoom-out and the scroll progress bar are CSS scroll-driven animations: no JS on scroll */

  /* ---------- Quick quote ---------- */
  const qq = $('#quickQuote');
  qq.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = $('#qqPhone');
    const ok = phone.value.replace(/\D/g, '').length >= 7;
    $('.qq-error', qq).classList.toggle('hidden', ok);
    phone.setAttribute('aria-invalid', String(!ok));
    if (!ok) { phone.focus(); return; }
    $('.qq-fields', qq).classList.add('hidden');
    $('.qq-success', qq).classList.remove('hidden');
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  /* ---------- Count up ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      countIO.unobserve(el);
      if (reduceMotion) { el.textContent = end; return; }
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1500, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Diagnose tool ---------- */
  const tones = {
    red: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
  };
  const symptoms = [
    { label: "Won't open or close", urgency: 'Urgent', tone: 'red', cause: 'Broken spring or opener failure', img: 'part-springs.webp', w: 600, h: 378,
      text: "If you heard a loud bang before the door stopped, a torsion spring has most likely snapped. If the motor runs but the door doesn't move, the opener or a cable may be the culprit.",
      services: ['Spring replacement', 'Opener repair'],
      tip: "Don't try to lift the door by hand — without a working spring it's extremely heavy." },
    { label: 'Loud or grinding noise', urgency: 'Fix soon', tone: 'amber', cause: 'Worn rollers or dry hardware', img: 'part-roller-install.webp', w: 259, h: 194,
      text: 'Squeaking, grinding or rattling usually points to worn rollers, loose hardware or parts that need lubrication. Fixing it early prevents bigger damage.',
      services: ['Roller replacement', 'General maintenance'],
      tip: 'Note when the noise happens — opening, closing or both. It helps our tech diagnose faster.' },
    { label: 'Crooked or off track', urgency: 'Urgent', tone: 'red', cause: 'Shifted door / broken cable', img: 'job-shifted-before.webp', w: 960, h: 720,
      text: 'The most common cause is a broken or worn cable — cables balance the door and steer it along the tracks. A hard knock (like backing into a closed door) can also push it off track.',
      services: ['Shifted door repair'],
      tip: 'Stop using the door and keep cars, kids and pets clear until it is fixed.' },
    { label: "Remote doesn't work", urgency: 'Fix soon', tone: 'amber', cause: 'Opener, sensor or remote issue', img: 'part-opener.webp', w: 400, h: 300,
      text: "Try fresh remote batteries and check that the safety sensors near the floor are clean and aligned. Still no response? The opener likely needs repair or replacement.",
      services: ['Opener repair', 'Opener replacement'],
      tip: 'A blinking light on the floor sensors usually means they are misaligned.' },
    { label: 'Slow or jerky movement', urgency: 'Routine', tone: 'green', cause: 'Spring tension, rollers or lubrication', img: 'part-spring-shaft.webp', w: 741, h: 330,
      text: 'Jerky or slow travel is often an early sign of spring tension loss, worn rollers or dry tracks. A tune-up usually solves it.',
      services: ['General maintenance', 'Roller replacement'],
      tip: 'Our 29-point tune-up catches this early — for far less than an emergency repair.' },
    { label: 'I want a new opener', urgency: 'Planned', tone: 'blue', cause: 'Opener upgrade', img: 'part-opener-kit.webp', w: 360, h: 360, product: true,
      text: 'We carry openers for all models and brands — heavy-duty hardware, high-end keypads, Wi-Fi and smartphone control, and battery backup. Installed, programmed and tested the same day.',
      services: ['Opener replacement'],
      tip: 'Ask us which opener best fits your door size and weight.' },
  ];

  const tabsEl = $('#diagTabs');
  const panel = $('#diagPanel');
  tabsEl.innerHTML = symptoms.map((s, i) =>
    `<button class="diag-chip rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-ink/30 active:scale-[.97]" role="tab" id="diag-tab-${i}" aria-controls="diagPanel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${s.label}</button>`
  ).join('');
  const chips = $$('.diag-chip', tabsEl);

  const panelHTML = (s) => `
    <div class="diag-media${s.product ? ' diag-media--product' : ''}"><img src="../assets/img/${s.img}" width="${s.w}" height="${s.h}" alt="" decoding="async" /></div>
    <div class="p-7 sm:p-9">
    <div class="flex items-center justify-between gap-4">
      <span class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${tones[s.tone]}"><span class="size-1.5 rounded-full bg-current"></span>${s.urgency}</span>
      <span class="text-xs font-semibold uppercase tracking-wider text-ink/40">Likely cause</span>
    </div>
    <h3 class="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">${s.cause}</h3>
    <p class="mt-3 leading-relaxed text-ink/65">${s.text}</p>
    <p class="mt-7 text-xs font-bold uppercase tracking-wider text-ink/40">Recommended service</p>
    <div class="mt-2.5 flex flex-wrap gap-2">${s.services.map((x) => `<span class="rounded-xl border border-ink/[.08] bg-white px-3.5 py-2 text-sm font-bold">${x}</span>`).join('')}</div>
    <div class="mt-6 flex gap-3 rounded-2xl bg-white p-4 text-sm text-ink/70">
      <svg class="mt-0.5 size-5 shrink-0 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/></svg>
      <span>${s.tip}</span>
    </div>
    <div class="mt-7 flex flex-col gap-2 sm:flex-row">
      <a href="tel:8777877121" class="btn btn-primary btn-shine min-h-14 flex-1 rounded-2xl">Call (877) 787-7121</a>
      <a href="#contact" class="btn btn-outline min-h-14 flex-1 rounded-2xl">Get a free quote</a>
    </div>
    </div>`;

  const select = (i, focus) => {
    chips.forEach((c, j) => {
      c.setAttribute('aria-selected', String(i === j));
      c.tabIndex = i === j ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `diag-tab-${i}`);
    if (focus) chips[i].focus();
    const swap = () => { panel.innerHTML = panelHTML(symptoms[i]); };
    // Cross-fade with a View Transition where supported; instant swap elsewhere
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(swap);
    else swap();
  };
  panel.innerHTML = panelHTML(symptoms[0]);
  // Warm the cache for the other symptom photos once the visitor reaches for the tool
  tabsEl.addEventListener('pointerenter', () => symptoms.forEach((x) => { new Image().src = `../assets/img/${x.img}`; }), { once: true });
  panel.setAttribute('aria-labelledby', 'diag-tab-0');
  chips.forEach((c, i) => {
    c.addEventListener('click', () => select(i));
    c.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      select((i + dir + chips.length) % chips.length, true);
    });
  });

  /* ---------- Tune-up checklist tabs ---------- */
  const tuTabs = $$('.tu-tab');
  const tuLists = tuTabs.map((t) => $('#' + t.getAttribute('aria-controls')));
  tuLists.forEach((l) => $$('li', l).forEach((li, k) => li.style.setProperty('--k', k)));
  const selectTu = (i, focus) => {
    tuTabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
      tuLists[j].hidden = i !== j;
      tuLists[j].classList.remove('is-shown');
    });
    requestAnimationFrame(() => requestAnimationFrame(() => tuLists[i].classList.add('is-shown')));
    if (focus) tuTabs[i].focus();
  };
  tuTabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTu(i));
    t.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (dir) { e.preventDefault(); selectTu((i + dir + tuTabs.length) % tuTabs.length, true); }
    });
  });

  /* ---------- Reviews: progress-bar autoplay ---------- */
  const reviews = $('.reviews');
  const slides = $$('.review-slide');
  const tabs = $$('.review-tab');
  let ri = 0;
  const showReview = (i) => {
    ri = i;
    slides.forEach((s, j) => s.classList.toggle('is-active', j === i));
    tabs.forEach((t, j) => {
      t.classList.toggle('is-active', j === i);
      t.setAttribute('aria-selected', String(j === i));
      const bar = $('.bar', t);
      bar.style.animation = 'none';
      void bar.offsetWidth; // restart CSS animation
      bar.style.animation = '';
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => showReview(i));
    $('.bar', t).addEventListener('animationend', () => {
      if (!reduceMotion && i === ri) showReview((ri + 1) % slides.length);
    });
  });
  if (reduceMotion) reviews.classList.add('is-paused');
  ['pointerenter', 'focusin'].forEach((ev) => reviews.addEventListener(ev, () => reviews.classList.add('is-paused')));
  ['pointerleave', 'focusout'].forEach((ev) => reviews.addEventListener(ev, () => { if (!reduceMotion) reviews.classList.remove('is-paused'); }));
  new IntersectionObserver(([e]) => {
    if (!reduceMotion) reviews.classList.toggle('is-paused', !e.isIntersecting);
  }).observe(reviews);

  /* ---------- Service areas ---------- */
  // Full list from garagedoorasapservice.com
  const cities = ['Orlando', 'Clermont', 'Kissimmee', 'The Villages', 'Winter Garden', 'Apopka', 'Sanford', 'Oviedo', 'Altamonte Springs', 'Leesburg', 'Winter Park', 'Ocoee', 'Winter Springs', 'Windermere', 'Davenport', 'Casselberry', 'Lake Mary', 'Longwood', 'Pine Hills', 'Groveland', 'Minneola', 'Eustis', 'Maitland', 'Doctor Phillips', 'Mount Dora', 'Wildwood', 'Deltona', 'DeBary', 'Tavares', 'Saint Cloud', 'Fruitland Park', 'Umatilla', 'Sorrento', 'Lockhart', 'Lady Lake', 'Hunters Creek', 'Coleman', 'Mascotte', 'Grand Island', 'Webster', 'Montverde', 'Howey-in-the-Hills', 'Bushnell', 'Astatula', 'Fairview Shores', 'Center Hill', 'Heathrow', 'Gotha', 'Oakland', 'Buena Ventura Lakes', 'Belle Isle', 'Meadow Woods', 'Azalea Park', 'Poinciana', 'Oak Ridge', 'Union Park', 'Ormond Beach', 'Ormond by the Sea', 'Daytona Beach', 'Holly Hill', 'Port Orange', 'Edgewater', 'New Smyrna Beach', 'Orange City', 'Palm Coast', 'South Daytona', 'DeLand', 'Ponce Inlet', 'Lake Helen', 'Melbourne', 'Rockledge', 'Titusville', 'Flagler Beach'];
  const chip = (c) => `<span class="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-ink/[.07] bg-white px-5 py-2.5 text-sm font-semibold text-ink/70"><span class="size-1.5 rounded-full bg-brand-600"></span>${c}</span>`;
  const half = Math.ceil(cities.length / 2);
  const rowA = cities.slice(0, half).map(chip).join('');
  const rowB = cities.slice(half).map(chip).join('');
  $('#rowA').innerHTML = rowA + rowA;
  $('#rowB').innerHTML = rowB + rowB;
  $('#cityOptions').innerHTML = cities.map((c) => `<option value="${c}"></option>`).join('');

  const norm = (s) => s.toLowerCase().replace(/\bst\.?\s/g, 'saint ').replace(/-/g, ' ').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
  const result = $('#cityResult');
  $('#cityCheck').addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = $('#cityInput').value.trim();
    if (!raw) { result.className = 'mt-3 min-h-6 text-sm font-semibold text-ink/60'; result.textContent = 'Type your city to check coverage.'; return; }
    const found = cities.find((c) => norm(c) === norm(raw));
    if (found) {
      result.className = 'mt-3 min-h-6 text-sm font-semibold text-emerald-700';
      result.textContent = `✓ Yes — we serve ${found}! Same-day service available.`;
    } else {
      result.className = 'mt-3 min-h-6 text-sm font-semibold text-amber-700';
      result.textContent = `${raw} isn't on our list yet — call (877) 787-7121, we may still cover you.`;
    }
  });

  /* FAQ is a native <details name="faq"> accordion: no JS needed */

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
