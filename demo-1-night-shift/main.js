(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header background on scroll */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const menuBtn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.querySelector('.menu-open').classList.toggle('hidden', open);
    menuBtn.querySelector('.menu-close').classList.toggle('hidden', !open);
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

  /* Count-up stats */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      countIO.unobserve(el);
      if (reduceMotion) { el.textContent = end; return; }
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / 1600, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  /* Spotlight that follows the pointer on service cards */
  if (matchMedia('(hover: hover)').matches) document.querySelectorAll('.spot').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* Service-area city search (full list from garagedoorasapservice.com) */
  const cities = ['Orlando', 'Clermont', 'Kissimmee', 'The Villages', 'Winter Garden', 'Apopka', 'Sanford', 'Oviedo', 'Altamonte Springs', 'Leesburg', 'Winter Park', 'Ocoee', 'Winter Springs', 'Windermere', 'Davenport', 'Casselberry', 'Lake Mary', 'Longwood', 'Pine Hills', 'Groveland', 'Minneola', 'Eustis', 'Maitland', 'Doctor Phillips', 'Mount Dora', 'Wildwood', 'Deltona', 'DeBary', 'Tavares', 'Saint Cloud', 'Fruitland Park', 'Umatilla', 'Sorrento', 'Lockhart', 'Lady Lake', 'Hunters Creek', 'Coleman', 'Mascotte', 'Grand Island', 'Webster', 'Montverde', 'Howey-in-the-Hills', 'Bushnell', 'Astatula', 'Fairview Shores', 'Center Hill', 'Heathrow', 'Gotha', 'Oakland', 'Buena Ventura Lakes', 'Belle Isle', 'Meadow Woods', 'Azalea Park', 'Poinciana', 'Oak Ridge', 'Union Park', 'Ormond Beach', 'Ormond by the Sea', 'Daytona Beach', 'Holly Hill', 'Port Orange', 'Edgewater', 'New Smyrna Beach', 'Orange City', 'Palm Coast', 'South Daytona', 'DeLand', 'Ponce Inlet', 'Lake Helen', 'Melbourne', 'Rockledge', 'Titusville', 'Flagler Beach'];
  const list = document.getElementById('cityList');
  const empty = document.getElementById('cityEmpty');
  list.innerHTML = cities.map((c) =>
    `<li class="city-chip border border-white/10 bg-ink-950 px-4 py-2 text-sm text-zinc-300 hover:border-brand-500/50 hover:text-white" data-city="${c.toLowerCase()}">${c}</li>`
  ).join('');
  const chips = [...list.children];
  document.getElementById('citySearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    let shown = 0;
    chips.forEach((chip) => {
      const match = chip.dataset.city.includes(q);
      chip.classList.toggle('is-hidden', !match);
      chip.classList.toggle('is-hit', Boolean(q) && match);
      if (match) shown++;
    });
    empty.classList.toggle('hidden', shown > 0);
  });

  /* Demo quote form */
  const form = document.getElementById('quoteForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = [...form.querySelectorAll('[required]')];
    const invalid = required.filter((f) => !f.value.trim());
    required.forEach((f) => f.setAttribute('aria-invalid', String(invalid.includes(f))));
    if (invalid.length) { invalid[0].focus(); return; }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'Sending…';
    setTimeout(() => {
      form.querySelector('.quote-fields').classList.add('hidden');
      form.querySelector('.quote-success').classList.remove('hidden');
    }, 900);
  });

  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
