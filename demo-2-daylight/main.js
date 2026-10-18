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
    if (!menu.classList.contains('is-open') && Math.abs(y - lastY) > 6) {
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
  const fitRotator = () => { rotator.style.width = `${words[wi].offsetWidth}px`; };
  fitRotator();
  document.fonts?.ready.then(fitRotator);
  window.addEventListener('resize', fitRotator);
  if (!reduceMotion) {
    setInterval(() => {
      if (document.hidden) return;
      const cur = words[wi];
      wi = (wi + 1) % words.length;
      cur.classList.replace('is-active', 'is-leaving');
      words[wi].classList.remove('is-leaving');
      words[wi].classList.add('is-active');
      fitRotator();
      setTimeout(() => cur.classList.remove('is-leaving'), 800);
    }, 2600);
  }

  /* ---------- Quick quote (the one form on the page) ---------- */
  const qq = $('#quickQuote');
  const phone = $('#qqPhone');
  qq.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = phone.value.replace(/\D/g, '').length >= 7;
    $('.qq-error', qq).classList.toggle('hidden', ok);
    phone.setAttribute('aria-invalid', String(!ok));
    if (!ok) { phone.focus(); return; }
    $('.qq-fields', qq).classList.add('hidden');
    $('.qq-success', qq).classList.remove('hidden');
  });
  // Every "quote" button scrolls back to the form, highlights it and focuses the phone field
  const goToQuote = (e, service) => {
    e.preventDefault();
    if (service) $('#qqService').value = service;
    qq.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    const fields = $('.qq-fields', qq);
    fields.classList.remove('qq-flash');
    void fields.offsetWidth;
    fields.classList.add('qq-flash');
    setTimeout(() => phone.focus({ preventScroll: true }), reduceMotion ? 0 : 600);
  };
  $$('.js-quote').forEach((a) => a.addEventListener('click', (e) => goToQuote(e)));

  /* ---------- Reveal on scroll: each section runs its own entrance (see "Section animations" in the CSS).
     Once it has played, .is-settled drops the entrance delays so later interactions feel instant. ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      (e.target.__reveal || e.target).classList.add('is-in');
      setTimeout(() => (e.target.__reveal || e.target).classList.add('is-settled'), 1600);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  // An element that starts fully clipped (clip-path) never counts as visible, so watch its parent instead
  $$('[data-reveal], .stage').forEach((el) => {
    if (!/^(door|circle)$/.test(el.dataset.reveal || '')) return io.observe(el);
    el.parentElement.__reveal = el;
    io.observe(el.parentElement);
  });

  /* ---------- Count up ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      countIO.unobserve(el);
      if (reduceMotion) return;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1400, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Services: pick a symptom, see cause + fix ---------- */
  const tones = {
    red: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
  };
  const symptoms = [
    { label: "Won't open or close", urgency: 'Urgent', tone: 'red', cause: 'Broken spring', service: 'Spring replacement', img: 'part-springs.webp', w: 600, h: 378,
      text: 'A loud bang before the door stopped usually means a torsion spring snapped. Our springs are rated up to 50,000 cycles.' },
    { label: 'Loud or grinding', urgency: 'Fix soon', tone: 'amber', cause: 'Worn rollers', service: 'Roller replacement', img: 'part-rollers.webp', w: 300, h: 244, product: true,
      text: 'Squeaks and grinding point to worn rollers. Nickel-plated replacements run quiet and smooth.' },
    { label: 'Crooked or off track', urgency: 'Urgent', tone: 'red', cause: 'Broken cable', service: 'Shifted door repair', img: 'job-shifted-before.webp', w: 960, h: 720,
      text: 'Cables balance the door and steer it along the tracks. We straighten the tracks and realign the rollers.' },
    { label: "Remote doesn't work", urgency: 'Fix soon', tone: 'amber', cause: 'Opener or sensor fault', service: 'Opener repair', img: 'part-opener.webp', w: 400, h: 300,
      text: 'Try fresh batteries and check the floor sensors first. Still dead? We repair boards, motors, belts and limit switches.' },
    { label: 'Slow or jerky', urgency: 'Routine', tone: 'green', cause: 'Needs a tune-up', service: 'General maintenance', img: 'part-spring-shaft.webp', w: 741, h: 330,
      text: 'Our 29-point inspection and tune-up catches wear early and adds years to your door.' },
    { label: 'I want a new opener', urgency: 'Planned', tone: 'blue', cause: 'Opener upgrade', service: 'Opener replacement', img: 'part-opener-kit.webp', w: 360, h: 360, product: true,
      text: 'Wi-Fi and smartphone control, battery backup and pro keypads, installed and programmed.' },
  ];

  const tabsEl = $('#diagTabs');
  const panel = $('#diagPanel');
  tabsEl.innerHTML = symptoms.map((s, i) =>
    `<button class="diag-chip min-h-11 rounded-full border border-ink/10 bg-white px-4 py-2.5 text-sm font-semibold hover:border-ink/30 active:scale-[.97]" style="--c:${i}" role="tab" id="diag-tab-${i}" aria-controls="diagPanel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${s.label}</button>`
  ).join('');
  const chips = $$('.diag-chip', tabsEl);

  const panelHTML = (s) => `
    <div class="photo-card${s.product ? ' photo-card--product' : ''} inset-x-[14%] bottom-[22%] top-[14%]" style="--k:0;--fr:2deg"><img src="../assets/img/${s.img}" width="${s.w}" height="${s.h}" alt="" decoding="async" /></div>
    <div class="fcard left-3 top-4 w-[min(80%,300px)] sm:-left-4 sm:top-[8%]" style="--k:1">
      <p class="fcard-label">Likely cause</p>
      <p class="mt-1 text-lg font-extrabold tracking-tight">${s.cause}</p>
      <p class="mt-1 text-sm leading-relaxed text-ink/60">${s.text}</p>
    </div>
    <div class="fcard fcard--accent bottom-4 right-3 sm:-right-4 sm:bottom-[8%]" style="--k:2">
      <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tones[s.tone]}"><span class="size-1.5 rounded-full bg-current"></span>${s.urgency}</span>
      <p class="mt-2 fcard-label">The fix</p>
      <p class="font-extrabold">${s.service}</p>
    </div>`;

  let current = 0;
  const select = (i, focus) => {
    current = i;
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
  panel.setAttribute('aria-labelledby', 'diag-tab-0');
  // Warm the cache for the other symptom photos once the visitor reaches for the picker
  tabsEl.addEventListener('pointerenter', () => symptoms.forEach((x) => { new Image().src = `../assets/img/${x.img}`; }), { once: true });
  chips.forEach((c, i) => {
    c.addEventListener('click', () => select(i));
    c.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      select((i + dir + chips.length) % chips.length, true);
    });
  });
  $('#bookFix').addEventListener('click', (e) => goToQuote(e, symptoms[current].service));

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

  /* ---------- Service areas: the city pills show what you type ---------- */
  // Full list from garagedoorasapservice.com
  const cities = ['Orlando', 'Clermont', 'Kissimmee', 'The Villages', 'Winter Garden', 'Apopka', 'Sanford', 'Oviedo', 'Altamonte Springs', 'Leesburg', 'Winter Park', 'Ocoee', 'Winter Springs', 'Windermere', 'Davenport', 'Casselberry', 'Lake Mary', 'Longwood', 'Pine Hills', 'Groveland', 'Minneola', 'Eustis', 'Maitland', 'Doctor Phillips', 'Mount Dora', 'Wildwood', 'Deltona', 'DeBary', 'Tavares', 'Saint Cloud', 'Fruitland Park', 'Umatilla', 'Sorrento', 'Lockhart', 'Lady Lake', 'Hunters Creek', 'Coleman', 'Mascotte', 'Grand Island', 'Webster', 'Montverde', 'Howey-in-the-Hills', 'Bushnell', 'Astatula', 'Fairview Shores', 'Center Hill', 'Heathrow', 'Gotha', 'Oakland', 'Buena Ventura Lakes', 'Belle Isle', 'Meadow Woods', 'Azalea Park', 'Poinciana', 'Oak Ridge', 'Union Park', 'Ormond Beach', 'Ormond by the Sea', 'Daytona Beach', 'Holly Hill', 'Port Orange', 'Edgewater', 'New Smyrna Beach', 'Orange City', 'Palm Coast', 'South Daytona', 'DeLand', 'Ponce Inlet', 'Lake Helen', 'Melbourne', 'Rockledge', 'Titusville', 'Flagler Beach'];
  $('#cityOptions').innerHTML = cities.map((c) => `<option value="${c}"></option>`).join('');
  const norm = (s) => s.toLowerCase().replace(/\bst\.?\s/g, 'saint ').replace(/-/g, ' ').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
  const pills = $$('.city-pill');
  const defaults = pills.map((p) => $('.name', p).textContent);
  const showCities = (names, hit) => pills.forEach((p, i) => {
    const name = names[i] || defaults[i];
    $('.name', p).textContent = name;
    p.classList.toggle('is-hit', name === hit);
  });
  const input = $('#cityInput');
  input.addEventListener('input', () => {
    const q = norm(input.value);
    showCities(q ? cities.filter((c) => norm(c).includes(q)).slice(0, 4) : defaults);
  });
  const result = $('#cityResult');
  $('#cityCheck').addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) { result.className = 'mt-3 min-h-6 text-sm font-semibold text-ink/60'; result.textContent = 'Type your city to check.'; input.focus(); return; }
    const found = cities.find((c) => norm(c) === norm(raw));
    if (found) {
      showCities([found, ...cities.filter((c) => c !== found && norm(c).includes(norm(raw)))].slice(0, 4), found);
      result.className = 'mt-3 min-h-6 text-sm font-semibold text-emerald-700';
      result.textContent = `✓ Yes, we cover ${found}.`;
    } else {
      result.className = 'mt-3 min-h-6 text-sm font-semibold text-amber-700';
      result.innerHTML = `${raw.replace(/[<>&"]/g, '')} isn't listed yet. <a href="tel:8777877121" class="underline underline-offset-4">Call us</a>, we may still cover you.`;
    }
  });

  /* FAQ is a native <details name="faq"> accordion: no JS needed */

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
