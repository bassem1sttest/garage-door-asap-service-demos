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

  /* Service area + free quote: one form. The city field lists every covered city
     (from garagedoorasapservice.com), and any other city can be typed and sent. */
  const cities = ['Orlando', 'Clermont', 'Kissimmee', 'The Villages', 'Winter Garden', 'Apopka', 'Sanford', 'Oviedo', 'Altamonte Springs', 'Leesburg', 'Winter Park', 'Ocoee', 'Winter Springs', 'Windermere', 'Davenport', 'Casselberry', 'Lake Mary', 'Longwood', 'Pine Hills', 'Groveland', 'Minneola', 'Eustis', 'Maitland', 'Doctor Phillips', 'Mount Dora', 'Wildwood', 'Deltona', 'DeBary', 'Tavares', 'Saint Cloud', 'Fruitland Park', 'Umatilla', 'Sorrento', 'Lockhart', 'Lady Lake', 'Hunters Creek', 'Coleman', 'Mascotte', 'Grand Island', 'Webster', 'Montverde', 'Howey-in-the-Hills', 'Bushnell', 'Astatula', 'Fairview Shores', 'Center Hill', 'Heathrow', 'Gotha', 'Oakland', 'Buena Ventura Lakes', 'Belle Isle', 'Meadow Woods', 'Azalea Park', 'Poinciana', 'Oak Ridge', 'Union Park', 'Ormond Beach', 'Ormond by the Sea', 'Daytona Beach', 'Holly Hill', 'Port Orange', 'Edgewater', 'New Smyrna Beach', 'Orange City', 'Palm Coast', 'South Daytona', 'DeLand', 'Ponce Inlet', 'Lake Helen', 'Melbourne', 'Rockledge', 'Titusville', 'Flagler Beach'];
  /* Dropdown fields (ARIA combobox): the list opens downward as an overlay, so the form and the page never move.
     4.5 rows show (the half row tells there is more) and the rest scroll.
     The city field is searchable, and a city outside the list can still be sent: we check it and call back. */
  const combo = (input, items, { search = false, onChange = () => {} } = {}) => {
    const list = document.getElementById(input.getAttribute('aria-controls'));
    const hint = search ? document.getElementById(input.dataset.hint) : null;
    const count = search ? document.getElementById(input.dataset.count) : null;
    const match = (v) => items.find((c) => c.toLowerCase() === v.trim().toLowerCase());
    const isOpen = () => input.getAttribute('aria-expanded') === 'true';
    let active = -1;

    const option = (i, value, q, custom) => {
      const li = document.createElement('li');
      li.id = `${list.id}-${i}`;
      li.setAttribute('role', 'option');
      li.dataset.value = value;
      li.className = custom ? 'combo-opt combo-opt--custom' : 'combo-opt';
      li.setAttribute('aria-selected', String(!custom && value === match(input.value)));
      const at = q && !custom ? value.toLowerCase().indexOf(q) : -1;
      if (custom) li.textContent = `Not listed? Send “${value}” anyway`;
      else if (at < 0) li.textContent = value;
      else {
        const m = document.createElement('mark');
        m.textContent = value.slice(at, at + q.length);
        li.append(value.slice(0, at), m, value.slice(at + q.length));
      }
      return li;
    };
    // Matches that start with the typed text come first; returns the row to highlight
    const render = () => {
      const typed = input.value.trim(), exact = match(typed), q = search ? typed.toLowerCase() : '';
      const hits = !q || exact ? items : items.filter((c) => c.toLowerCase().includes(q))
        .sort((a, b) => b.toLowerCase().startsWith(q) - a.toLowerCase().startsWith(q) || a.localeCompare(b));
      const rows = hits.map((c, i) => option(i, c, exact ? '' : q, false));
      if (q && !exact) rows.push(option(rows.length, typed, q, true));
      list.replaceChildren(...rows);
      if (count) count.textContent = q && !exact ? `${hits.length} ${hits.length === 1 ? 'city matches' : 'cities match'}` : '';
      return exact ? hits.indexOf(exact) : q ? 0 : -1;
    };
    // 4.5 rows, or fewer when fewer options match
    const fit = () => {
      list.style.maxHeight = '';
      const row = list.querySelector('.combo-opt')?.offsetHeight || 44;
      const pad = list.offsetHeight - list.clientHeight + parseFloat(getComputedStyle(list).paddingTop) * 2;
      list.style.maxHeight = `${Math.floor(Math.min(row * 4.5 + pad, list.scrollHeight + pad))}px`;
    };
    const setActive = (i) => {
      active = i;
      [...list.children].forEach((li, k) => li.classList.toggle('is-active', k === i));
      const li = list.children[i];
      if (!li) { input.removeAttribute('aria-activedescendant'); return; }
      input.setAttribute('aria-activedescendant', li.id);
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
    };
    // Scroll just enough that the whole list shows (above a phone keyboard too); the field stays below the header
    const reveal = () => {
      const view = window.visualViewport?.height ?? innerHeight;
      const over = list.getBoundingClientRect().bottom - view + 12;
      const room = input.getBoundingClientRect().top - ($('header')?.offsetHeight || 0) - 12;
      if (over > 0 && room > 0) window.scrollBy({ top: Math.min(over, room), behavior: 'smooth' });
    };
    const open = () => {
      const found = render(), start = !search && found < 0 ? 0 : found;
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      fit();
      list.scrollTop = 0;
      setActive(start);
      reveal();
    };
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); setActive(-1); };
    const commit = () => {
      const typed = input.value.trim(), exact = match(typed);
      if (exact) input.value = exact;
      if (hint) {
        const outside = Boolean(typed) && !exact;
        hint.hidden = !outside;
        if (outside) input.setAttribute('aria-describedby', hint.id); else input.removeAttribute('aria-describedby');
      }
      onChange(exact || typed, Boolean(exact));
    };
    const pick = (li) => { input.value = li.dataset.value; close(); commit(); };

    if (search) input.addEventListener('input', open);
    input.addEventListener('click', () => (isOpen() ? close() : open()));
    input.addEventListener('keydown', (e) => {
      const n = list.children.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); if (isOpen()) setActive(Math.min(active + 1, n - 1)); else { open(); if (active < 0) setActive(0); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (isOpen()) setActive(Math.max(active - 1, 0)); else if (!search) open(); }
      else if ((e.key === 'Enter' || (!search && e.key === ' ')) && isOpen() && active >= 0) { e.preventDefault(); pick(list.children[active]); }
      else if ((e.key === 'Enter' || e.key === ' ') && !search && !isOpen()) { e.preventDefault(); open(); }
      else if (!search && isOpen() && (e.key === 'Home' || e.key === 'End')) { e.preventDefault(); setActive(e.key === 'Home' ? 0 : n - 1); }
      else if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(); }
      else if (e.key === 'Tab' && isOpen()) close();
      else if (!search && e.key.length === 1 && /\S/.test(e.key)) {
        // type a letter to jump to the next option that starts with it
        const k = e.key.toLowerCase(), from = Math.max(active, items.indexOf(match(input.value) || ''));
        const hit = [...items.keys()].map((x) => (from + 1 + x) % items.length).find((x) => items[x].toLowerCase().startsWith(k));
        if (hit === undefined) return;
        if (!isOpen()) open();
        setActive(hit);
      }
    });
    input.addEventListener('blur', () => { close(); commit(); });
    list.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus in the field
    list.addEventListener('click', (e) => { const li = e.target.closest('[role="option"]'); if (li) pick(li); });
    addEventListener('resize', () => { if (isOpen()) fit(); });
    window.visualViewport?.addEventListener('resize', () => { if (isOpen()) reveal(); });
    return match;
  };

  // The map cards echo the chosen city
  const cityCards = $$('.city-card');
  const defaults = cityCards.map((c) => $('.fcard-title', c).textContent);
  const showCity = (name, covered) => cityCards.forEach((c, i) => {
    const hit = i === 0 && name;
    $('.fcard-title', c).textContent = hit ? name : defaults[i];
    $('.fcard-text', c).textContent = hit && !covered ? "We'll check" : 'Covered';
    c.classList.toggle('is-hit', Boolean(hit));
  });

  const cityIn = $('#qCity');
  const isCovered = combo(cityIn, [...cities].sort((x, y) => x.localeCompare(y)), { search: true, onChange: showCity });
  combo($('#qService'), ['Spring replacement', 'Opener repair', 'Opener replacement', 'Roller replacement', 'Shifted door repair', 'General maintenance', 'Not sure yet']);

  /* Demo quote form */
  const form = $('#quoteForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('[required]', form);
    const invalid = required.filter((f) => !f.value.trim());
    required.forEach((f) => f.setAttribute('aria-invalid', String(invalid.includes(f))));
    if (invalid.length) { invalid[0].focus(); return; }
    const notListed = !isCovered(cityIn.value);
    const city = cityIn.value.trim().replace(/[<>&"]/g, '');
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
