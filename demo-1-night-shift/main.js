(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Header background on scroll */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const menuBtn = $('#menuBtn');
  const menu = $('#mobileMenu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('.menu-open', menuBtn).classList.toggle('hidden', open);
    $('.menu-close', menuBtn).classList.toggle('hidden', !open);
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* Reveal on scroll: each section runs its own entrance (see "Section animations" in the CSS).
     Once it has played, .is-settled drops the entrance delays so later interactions feel instant. */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      (e.target.__reveal || e.target).classList.add('is-in');
      setTimeout(() => (e.target.__reveal || e.target).classList.add('is-settled'), 1800);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  // An element that starts fully clipped (clip-path) never counts as visible, so watch its parent instead
  $$('[data-reveal], .stage, .deal, [data-observe]').forEach((el) => {
    if (!/^(door|circle)$/.test(el.dataset.reveal || '')) return io.observe(el);
    el.parentElement.__reveal = el;
    io.observe(el.parentElement);
  });

  /* Stage tilt follows the pointer (mouse/trackpad only) */
  if (!reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-tilt]').forEach((stage) => {
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        stage.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 6}deg`);
        stage.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -6}deg`);
      });
      stage.addEventListener('pointerleave', () => { stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg'); });
    });
  }

  /* Count-up */
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

  /* Hero: one service per slide, auto-advance every 3s. The timer is the CSS bar on the active dot;
     it pauses with the pause button, while keyboard focus is inside, in a hidden tab, or under reduced motion. */
  const hero = $('.hero');
  const slides = $$('.hero-slide');
  const bgs = $$('.hero-bg');
  const loadBg = (k) => { const bg = bgs[k % bgs.length]; if (!bg) return; bg.querySelectorAll('[data-srcset]').forEach((el) => { el.srcset = el.dataset.srcset; el.removeAttribute('data-srcset'); });
    const img = $('img', bg); if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); } };
  const dots = $$('.hero-dot');
  const pauseBtn = $('#heroPause');
  let cur = 0;
  let userPaused = reduceMotion;
  let focusInside = false;
  const syncPause = () => hero.classList.toggle('is-paused', userPaused || focusInside || document.hidden);
  const show = (i) => {
    cur = (i + slides.length) % slides.length;
    slides.forEach((sl, k) => {
      const on = k === cur;
      sl.classList.toggle('is-active', on);
      sl.setAttribute('aria-hidden', String(!on));
      sl.inert = !on;
    });
    loadBg(cur); loadBg(cur + 1);
    bgs.forEach((bg, k) => bg.classList.toggle('is-active', k === cur));
    dots.forEach((d, k) => {
      d.setAttribute('aria-current', String(k === cur));
      const bar = $('span', d);
      bar.style.animation = 'none';
      void bar.offsetWidth; // restart the timer bar
      bar.style.animation = '';
    });
  };
  dots.forEach((d, k) => {
    d.addEventListener('click', () => show(k));
    $('span', d).addEventListener('animationend', () => { if (k === cur) show(cur + 1); });
  });
  const setUserPaused = (on) => {
    userPaused = on;
    pauseBtn.setAttribute('aria-pressed', String(on));
    pauseBtn.setAttribute('aria-label', on ? 'Play slideshow' : 'Pause slideshow');
    $('.icon-pause', pauseBtn).classList.toggle('hidden', on);
    $('.icon-play', pauseBtn).classList.toggle('hidden', !on);
    syncPause();
  };
  pauseBtn.addEventListener('click', () => setUserPaused(!userPaused));
  $('#heroSlides').addEventListener('focusin', () => { focusInside = true; syncPause(); });
  $('#heroSlides').addEventListener('focusout', () => { focusInside = false; syncPause(); });
  document.addEventListener('visibilitychange', syncPause);
  setUserPaused(userPaused);
  loadBg(1); // the next photo is ready before its slide
  // "Get a free quote" pre-fills the service in the quote form
  $$('.js-book').forEach((a) => a.addEventListener('click', () => { $('#qService').value = a.closest('.hero-slide').dataset.service; }));

  /* Service area + free quote: one form. The city dropdown lists every covered city
     (from garagedoorasapservice.com); "not listed" opens a free-text field instead. */
  const cities = ['Orlando', 'Clermont', 'Kissimmee', 'The Villages', 'Winter Garden', 'Apopka', 'Sanford', 'Oviedo', 'Altamonte Springs', 'Leesburg', 'Winter Park', 'Ocoee', 'Winter Springs', 'Windermere', 'Davenport', 'Casselberry', 'Lake Mary', 'Longwood', 'Pine Hills', 'Groveland', 'Minneola', 'Eustis', 'Maitland', 'Doctor Phillips', 'Mount Dora', 'Wildwood', 'Deltona', 'DeBary', 'Tavares', 'Saint Cloud', 'Fruitland Park', 'Umatilla', 'Sorrento', 'Lockhart', 'Lady Lake', 'Hunters Creek', 'Coleman', 'Mascotte', 'Grand Island', 'Webster', 'Montverde', 'Howey-in-the-Hills', 'Bushnell', 'Astatula', 'Fairview Shores', 'Center Hill', 'Heathrow', 'Gotha', 'Oakland', 'Buena Ventura Lakes', 'Belle Isle', 'Meadow Woods', 'Azalea Park', 'Poinciana', 'Oak Ridge', 'Union Park', 'Ormond Beach', 'Ormond by the Sea', 'Daytona Beach', 'Holly Hill', 'Port Orange', 'Edgewater', 'New Smyrna Beach', 'Orange City', 'Palm Coast', 'South Daytona', 'DeLand', 'Ponce Inlet', 'Lake Helen', 'Melbourne', 'Rockledge', 'Titusville', 'Flagler Beach'];
  const citySel = $('#qCity');
  const OTHER = '__other';
  citySel.insertAdjacentHTML('beforeend',
    `<optgroup label="Cities we cover">${[...cities].sort((x, y) => x.localeCompare(y)).map((c) => `<option>${c}</option>`).join('')}</optgroup>` +
    `<option value="${OTHER}">My city isn't listed</option>`);
  const otherWrap = $('#qOtherWrap');
  const other = $('#qOther');

  // The map cards echo the chosen city
  const cityCards = $$('.city-card');
  const defaults = cityCards.map((c) => $('.fcard-title', c).textContent);
  const showCity = (name, covered) => cityCards.forEach((c, i) => {
    const hit = i === 0 && name;
    $('.fcard-title', c).textContent = hit ? name : defaults[i];
    $('.fcard-text', c).textContent = hit && !covered ? "We'll check" : 'Covered';
    c.classList.toggle('is-hit', Boolean(hit));
  });

  citySel.addEventListener('change', () => {
    const notListed = citySel.value === OTHER;
    otherWrap.hidden = !notListed;
    other.required = notListed;
    if (notListed) { other.focus(); showCity('', false); }
    else showCity(citySel.value, true);
  });
  other.addEventListener('input', () => showCity(other.value.trim(), false));

  /* Demo quote form */
  const form = $('#quoteForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('[required]', form);
    const invalid = required.filter((f) => !f.value.trim());
    required.forEach((f) => f.setAttribute('aria-invalid', String(invalid.includes(f))));
    if (invalid.length) { invalid[0].focus(); return; }
    const notListed = citySel.value === OTHER;
    const city = (notListed ? other.value.trim() : citySel.value).replace(/[<>&"]/g, '');
    $('.quote-msg', form).textContent = notListed
      ? `Thanks! We'll check whether we can reach ${city} and call you back.`
      : `Thanks! A technician near ${city} will call you shortly.`;
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    $('.btn-label', btn).textContent = 'Sending…';
    setTimeout(() => {
      $('.quote-fields', form).classList.add('hidden');
      $('.quote-success', form).classList.remove('hidden');
    }, 900);
  });

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
