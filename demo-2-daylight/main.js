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
  // The rotator is a one-cell grid, so it is always as wide as its longest word:
  // the heading keeps the same line breaks whichever word shows, and nothing below it moves.
  if (!reduceMotion) {
    setInterval(() => {
      if (document.hidden) return;
      const cur = words[wi];
      wi = (wi + 1) % words.length;
      cur.classList.remove('is-active');
      cur.classList.add('is-leaving');
      words[wi].classList.remove('is-leaving');
      words[wi].classList.add('is-active');
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
  /* Dropdown fields (ARIA combobox): 4–5 rows show and the rest scroll, and the list always opens downward.
     The list stops 8px above the form's bottom edge, so it never sticks out of the form. With inPlace,
     a field with under 4 rows of room opens its list in place instead and pushes the fields below it down.
     The city field is searchable, and a city outside the list can still be sent: we check it and call back. */
  const combo = (input, items, { search = false, inPlace = true, onChange = () => {} } = {}) => {
    const list = document.getElementById(input.getAttribute('aria-controls'));
    const hint = search ? document.getElementById(input.dataset.hint) : null;
    const count = search ? document.getElementById(input.dataset.count) : null;
    const form = input.form;
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
    // 4.5 rows (the half row shows there is more), or as many as fit above the form's bottom edge
    const fit = () => {
      list.classList.remove('is-inline');
      list.style.maxHeight = '';
      const row = list.querySelector('.combo-opt')?.offsetHeight || 44;
      const pad = list.offsetHeight - list.clientHeight + parseFloat(getComputedStyle(list).paddingTop) * 2;
      const want = Math.min(row * 4.5 + pad, list.scrollHeight + pad);
      const room = form.getBoundingClientRect().bottom - 8 - list.getBoundingClientRect().top;
      const inline = inPlace && room < Math.min(row * 4 + pad, want);
      list.classList.toggle('is-inline', inline);
      list.style.maxHeight = `${Math.floor(inline ? want : Math.min(want, room))}px`;
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
    const close = () => { list.hidden = true; list.classList.remove('is-inline'); input.setAttribute('aria-expanded', 'false'); setActive(-1); };
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
  const bCity = $('#bCity');
  const isCovered = combo(bCity, [...cities].sort((x, y) => x.localeCompare(y)), { search: true });
  // Both service fields (hero "Free quote" bar and booking form) offer the same list
  const services = ['Spring replacement', 'Opener repair', 'Opener replacement', 'Roller replacement', 'Shifted door repair', '29-point tune-up', 'Not sure, help me diagnose'];
  combo($('#bService'), services);
  combo($('#qqService'), services);

  const book = $('#bookForm');
  book.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('[required]', book);
    const invalid = required.filter((f) => !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 7));
    required.forEach((f) => f.setAttribute('aria-invalid', String(invalid.includes(f))));
    if (invalid.length) { invalid[0].focus(); return; }
    const notListed = !isCovered(bCity.value);
    const city = bCity.value.trim().replace(/[<>&"]/g, '');
    $('.book-msg', book).textContent = notListed
      ? `Thanks! ${city} is outside our usual area. We'll check whether we can reach you and call you back.`
      : `Thanks! A technician near ${city} will call you shortly.`;
    $('.book-fields', book).classList.add('hidden');
    $('.book-success', book).classList.remove('hidden');
  });

  /* FAQ is a native <details name="faq"> accordion: no JS needed */

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
})();
