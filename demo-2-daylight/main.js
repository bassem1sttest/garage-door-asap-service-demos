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

  /* ---------- Services: no hover on touch screens, so visible cards gently alternate before/after ---------- */
  if (!matchMedia('(hover: hover)').matches && !reduceMotion) {
    const visible = new Set();
    const baIO = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) visible.add(e.target); else { visible.delete(e.target); e.target.classList.remove('show-after'); }
    }), { threshold: 0.6 });
    $$('.ba-card').forEach((c) => baIO.observe(c));
    setInterval(() => { if (!document.hidden) visible.forEach((c) => c.classList.toggle('show-after')); }, 3200);
  }

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

  /* ---------- Request form: any city, covered or not ---------- */
  // Full list from garagedoorasapservice.com
  const cities = ['Orlando', 'Clermont', 'Kissimmee', 'The Villages', 'Winter Garden', 'Apopka', 'Sanford', 'Oviedo', 'Altamonte Springs', 'Leesburg', 'Winter Park', 'Ocoee', 'Winter Springs', 'Windermere', 'Davenport', 'Casselberry', 'Lake Mary', 'Longwood', 'Pine Hills', 'Groveland', 'Minneola', 'Eustis', 'Maitland', 'Doctor Phillips', 'Mount Dora', 'Wildwood', 'Deltona', 'DeBary', 'Tavares', 'Saint Cloud', 'Fruitland Park', 'Umatilla', 'Sorrento', 'Lockhart', 'Lady Lake', 'Hunters Creek', 'Coleman', 'Mascotte', 'Grand Island', 'Webster', 'Montverde', 'Howey-in-the-Hills', 'Bushnell', 'Astatula', 'Fairview Shores', 'Center Hill', 'Heathrow', 'Gotha', 'Oakland', 'Buena Ventura Lakes', 'Belle Isle', 'Meadow Woods', 'Azalea Park', 'Poinciana', 'Oak Ridge', 'Union Park', 'Ormond Beach', 'Ormond by the Sea', 'Daytona Beach', 'Holly Hill', 'Port Orange', 'Edgewater', 'New Smyrna Beach', 'Orange City', 'Palm Coast', 'South Daytona', 'DeLand', 'Ponce Inlet', 'Lake Helen', 'Melbourne', 'Rockledge', 'Titusville', 'Flagler Beach'];
  const OTHER = '__other';
  const bCity = $('#bCity');
  bCity.insertAdjacentHTML('beforeend',
    `<optgroup label="Cities we cover">${[...cities].sort((x, y) => x.localeCompare(y)).map((c) => `<option>${c}</option>`).join('')}</optgroup>` +
    `<option value="${OTHER}">My city isn't listed</option>`);
  const bOtherWrap = $('#bOtherWrap');
  const bOther = $('#bOther');
  bCity.addEventListener('change', () => {
    const notListed = bCity.value === OTHER;
    bOtherWrap.hidden = !notListed;
    bOther.required = notListed;
    if (notListed) bOther.focus();
  });

  const book = $('#bookForm');
  book.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('[required]', book);
    const invalid = required.filter((f) => !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 7));
    required.forEach((f) => f.setAttribute('aria-invalid', String(invalid.includes(f))));
    if (invalid.length) { invalid[0].focus(); return; }
    const notListed = bCity.value === OTHER;
    const city = (notListed ? bOther.value.trim() : bCity.value).replace(/[<>&"]/g, '');
    $('.book-msg', book).textContent = notListed
      ? `Thanks! ${city} is outside our usual area. We'll check whether we can reach you and call you back.`
      : `Thanks! A technician near ${city} will call you shortly.`;
    $('.book-fields', book).classList.add('hidden');
    $('.book-success', book).classList.remove('hidden');
  });

  /* FAQ is a native <details name="faq"> accordion: no JS needed */

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
