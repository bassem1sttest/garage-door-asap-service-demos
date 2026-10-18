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
  $$('[data-reveal], .stage, .deck, [data-observe]').forEach((el) => {
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

  /* Services: tabs swap the scene; "Book this service" pre-fills the quote form */
  const tabs = $$('.svc-tab');
  const book = $('#bookService');
  const selectTab = (i, focus) => {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).classList.toggle('is-active', on);
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(i));
    t.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      selectTab((i + dir + tabs.length) % tabs.length, true);
    });
  });
  book.addEventListener('click', () => {
    const active = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
    $('#qService').value = active.dataset.service;
  });

  /* Reviews: a deck of cards; next sends the top card to the back */
  const cards = $$('.deck-card');
  const num = $('#deckNum');
  let top = 0;
  const layout = () => {
    cards.forEach((c, j) => {
      const pos = (j - top + cards.length) % cards.length;
      c.style.setProperty('--pos', pos);
      c.setAttribute('aria-hidden', String(pos !== 0));
    });
    num.textContent = top + 1;
  };
  const step = (dir) => {
    const leaving = cards[top];
    if (dir > 0 && !reduceMotion) {
      leaving.classList.add('is-out');
      setTimeout(() => leaving.classList.remove('is-out'), 280);
    }
    top = (top + dir + cards.length) % cards.length;
    setTimeout(layout, dir > 0 && !reduceMotion ? 180 : 0);
  };
  $('#deckNext').addEventListener('click', () => step(1));
  $('#deckPrev').addEventListener('click', () => step(-1));
  cards.forEach((c, j) => c.addEventListener('click', () => { if (j === top) step(1); }));
  layout();

  /* Service area: check a city; the map cards show the closest matches */
  const cities = ['Orlando', 'Clermont', 'Kissimmee', 'The Villages', 'Winter Garden', 'Apopka', 'Sanford', 'Oviedo', 'Altamonte Springs', 'Leesburg', 'Winter Park', 'Ocoee', 'Winter Springs', 'Windermere', 'Davenport', 'Casselberry', 'Lake Mary', 'Longwood', 'Pine Hills', 'Groveland', 'Minneola', 'Eustis', 'Maitland', 'Doctor Phillips', 'Mount Dora', 'Wildwood', 'Deltona', 'DeBary', 'Tavares', 'Saint Cloud', 'Fruitland Park', 'Umatilla', 'Sorrento', 'Lockhart', 'Lady Lake', 'Hunters Creek', 'Coleman', 'Mascotte', 'Grand Island', 'Webster', 'Montverde', 'Howey-in-the-Hills', 'Bushnell', 'Astatula', 'Fairview Shores', 'Center Hill', 'Heathrow', 'Gotha', 'Oakland', 'Buena Ventura Lakes', 'Belle Isle', 'Meadow Woods', 'Azalea Park', 'Poinciana', 'Oak Ridge', 'Union Park', 'Ormond Beach', 'Ormond by the Sea', 'Daytona Beach', 'Holly Hill', 'Port Orange', 'Edgewater', 'New Smyrna Beach', 'Orange City', 'Palm Coast', 'South Daytona', 'DeLand', 'Ponce Inlet', 'Lake Helen', 'Melbourne', 'Rockledge', 'Titusville', 'Flagler Beach'];
  $('#cityOptions').innerHTML = cities.map((c) => `<option value="${c}"></option>`).join('');
  const norm = (s) => s.toLowerCase().replace(/\bst\.?\s/g, 'saint ').replace(/-/g, ' ').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
  const cityCards = $$('.city-card');
  const defaults = cityCards.map((c) => $('.fcard-title', c).textContent);
  const showCities = (names, hit) => cityCards.forEach((c, i) => {
    const name = names[i] || defaults[i];
    $('.fcard-title', c).textContent = name;
    c.classList.toggle('is-hit', name === hit);
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
    if (!raw) { result.className = 'mt-3 min-h-6 text-sm font-semibold text-zinc-400'; result.textContent = 'Type your city to check.'; input.focus(); return; }
    const found = cities.find((c) => norm(c) === norm(raw));
    if (found) {
      showCities([found, ...cities.filter((c) => c !== found && norm(c).includes(norm(raw)))].slice(0, 4), found);
      result.className = 'mt-3 min-h-6 text-sm font-semibold text-emerald-400';
      result.textContent = `✓ Yes, we cover ${found}.`;
    } else {
      result.className = 'mt-3 min-h-6 text-sm font-semibold text-amber-300';
      result.innerHTML = `${raw.replace(/[<>&"]/g, '')} isn't listed yet. <a href="tel:8777877121" class="underline underline-offset-4">Call us</a>, we may still cover you.`;
    }
  });

  /* Demo quote form */
  const form = $('#quoteForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('[required]', form);
    const invalid = required.filter((f) => !f.value.trim());
    required.forEach((f) => f.setAttribute('aria-invalid', String(invalid.includes(f))));
    if (invalid.length) { invalid[0].focus(); return; }
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
