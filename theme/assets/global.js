/* Elysium Clinical — global behaviour. Vanilla JS, no dependencies. */
(() => {
  const T = window.theme || { routes: {}, strings: {} };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');

  /* Toast */
  let toastTimer;
  function toast(msg) {
    const el = $('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  /* Drawers (cart, menu, filters) */
  let lastFocus = null;
  function openDrawer(id) {
    const d = document.getElementById(id);
    if (!d) return;
    lastFocus = document.activeElement;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-locked');
    $$('[data-drawer-open="' + id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    const f = $('[data-drawer-close], button, a, input', $('.drawer__panel', d));
    if (f) setTimeout(() => f.focus(), 50);
  }
  function closeDrawer(d) {
    if (!d || !d.classList.contains('is-open')) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    $$('[data-drawer-open="' + d.id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (!$('.drawer.is-open') && !$('.search-modal.is-open')) document.documentElement.classList.remove('is-locked');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-drawer-open]');
    if (opener) { e.preventDefault(); openDrawer(opener.dataset.drawerOpen); return; }
    const closer = e.target.closest('[data-drawer-close]');
    if (closer) { e.preventDefault(); closeDrawer(closer.closest('.drawer')); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    $$('.drawer.is-open').forEach(closeDrawer);
    $$('.search-modal.is-open').forEach(closeSearchModal);
    $$('.nav__item.is-open').forEach((i) => setMega(i, false));
  });
  window.ThemeDrawer = { open: openDrawer, close: closeDrawer };

  /* Cart */
  const cartDrawerId = 'CartDrawer';
  function sectionsUrl() { return window.location.pathname; }
  function renderCart(sections) {
    if (!sections || !sections['cart-drawer']) return;
    const doc = parseHTML(sections['cart-drawer']);
    const fresh = $('[data-cart-drawer-inner]', doc);
    const current = $('[data-cart-drawer-inner]');
    if (fresh && current) current.replaceWith(fresh);
    const root = $('[data-cart-count-source]', doc);
    if (root) updateCount(root.dataset.cartCountSource);
  }
  function updateCount(n) {
    $$('[data-cart-count]').forEach((el) => { el.textContent = n; el.dataset.count = n; });
  }
  async function addToCart(form) {
    const btn = $('[type=submit]', form);
    const err = $('[data-form-error]', form);
    if (err) { err.hidden = true; err.textContent = ''; }
    if (btn) { btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); }
    const fd = new FormData(form);
    fd.append('sections', 'cart-drawer');
    fd.append('sections_url', sectionsUrl());
    try {
      const res = await fetch(T.routes.cartAdd + '.js', { method: 'POST', body: fd, headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' } });
      const data = await res.json();
      if (!res.ok || data.status) throw new Error(data.description || data.message || T.strings.error);
      renderCart(data.sections);
      toast(T.strings.added);
      if (document.getElementById(cartDrawerId)) openDrawer(cartDrawerId);
      document.dispatchEvent(new CustomEvent('cart:added', { detail: data }));
    } catch (e) {
      if (err) { err.textContent = e.message; err.hidden = false; } else toast(e.message);
    } finally {
      if (btn) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); }
    }
  }
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-ajax-cart]');
    if (!form || T.cartType !== 'drawer' || !document.getElementById(cartDrawerId)) return;
    e.preventDefault();
    addToCart(form);
  });
  async function changeLine(line, quantity) {
    const drawer = document.getElementById(cartDrawerId);
    if (drawer) drawer.classList.add('is-busy');
    try {
      const res = await fetch(T.routes.cartChange + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity, sections: ['cart-drawer'], sections_url: sectionsUrl() })
      });
      const data = await res.json();
      if (!res.ok || data.status) throw new Error(data.description || data.message || T.strings.error);
      renderCart(data.sections);
    } catch (e) {
      toast(e.message);
    } finally {
      if (drawer) drawer.classList.remove('is-busy');
    }
  }
  const debouncedChange = debounce(changeLine, 350);
  const submitCartPage = debounce((form) => form.submit(), 500);
  document.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-cart-remove]');
    if (rm && rm.closest('[data-cart-drawer-inner]')) { e.preventDefault(); changeLine(Number(rm.dataset.cartRemove), 0); }
  });
  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-cart-drawer-inner] input[data-line]');
    if (input) debouncedChange(Number(input.dataset.line), Math.max(0, parseInt(input.value, 10) || 0));
    const note = e.target.closest('[data-cart-note]');
    if (note) fetch(T.routes.cart + '/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: note.value }) });
    const pageQty = e.target.closest('form[data-cart-page] input[data-line]');
    if (pageQty) submitCartPage(pageQty.form);
  });

  /* Quantity steppers */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-qty-minus],[data-qty-plus]');
    if (!b) return;
    const input = $('input', b.closest('[data-qty]'));
    if (!input) return;
    const min = input.hasAttribute('min') ? Number(input.min) : 0;
    const max = input.hasAttribute('max') && input.max !== '' ? Number(input.max) : Infinity;
    const v = (parseInt(input.value, 10) || 0) + (b.hasAttribute('data-qty-plus') ? 1 : -1);
    input.value = Math.min(max, Math.max(min, v));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* Mega menu */
  function setMega(item, open) {
    item.classList.toggle('is-open', open);
    const link = $('.nav__link', item);
    if (link) link.setAttribute('aria-expanded', String(open));
  }
  $$('.nav__item--mega').forEach((item) => {
    const link = $('.nav__link', item);
    link.addEventListener('click', (e) => {
      // Touch / keyboard: first activation opens the panel, second follows the link.
      if (!item.classList.contains('is-open') && (e.pointerType === 'touch' || e.detail === 0 || !window.matchMedia('(hover: hover)').matches)) {
        e.preventDefault();
        $$('.nav__item.is-open').forEach((i) => i !== item && setMega(i, false));
        setMega(item, true);
      }
    });
    item.addEventListener('mouseleave', () => setMega(item, false));
    item.addEventListener('focusout', (e) => { if (!item.contains(e.relatedTarget)) setMega(item, false); });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__item--mega')) $$('.nav__item.is-open').forEach((i) => setMega(i, false));
  });

  /* Search modal (mobile) */
  function closeSearchModal(m) {
    m.classList.remove('is-open');
    if (!$('.drawer.is-open')) document.documentElement.classList.remove('is-locked');
  }
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-search-open]');
    if (o) {
      e.preventDefault();
      const m = $('.search-modal');
      if (!m) { window.location.href = o.href || '/search'; return; }
      m.classList.add('is-open');
      document.documentElement.classList.add('is-locked');
      const i = $('input[type=search]', m); if (i) setTimeout(() => i.focus(), 30);
      return;
    }
    const c = e.target.closest('[data-search-close]');
    if (c) closeSearchModal(c.closest('.search-modal'));
    const m = e.target.classList && e.target.classList.contains('search-modal') ? e.target : null;
    if (m) closeSearchModal(m);
  });

  /* Predictive search */
  $$('[data-predictive]').forEach((root) => {
    const input = $('input[type=search]', root);
    const out = $('[data-predictive-results]', root);
    if (!input || !out || !T.routes.predictiveSearch) return;
    let ctrl;
    const run = debounce(async () => {
      const q = input.value.trim();
      if (q.length < 2) { out.hidden = true; out.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
      if (ctrl) ctrl.abort();
      ctrl = new AbortController();
      const url = T.routes.predictiveSearch + '?q=' + encodeURIComponent(q) + '&section_id=predictive-search&resources[type]=product,collection,article,page&resources[limit]=4&resources[options][unavailable_products]=last';
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(res.status);
        const doc = parseHTML(await res.text());
        const inner = $('#shopify-section-predictive-search', doc);
        out.innerHTML = inner ? inner.innerHTML : '';
        out.hidden = false;
        input.setAttribute('aria-expanded', 'true');
      } catch (e) { if (e.name !== 'AbortError') out.hidden = true; }
    }, 250);
    input.addEventListener('input', run);
    input.addEventListener('focus', () => { if (out.innerHTML.trim()) out.hidden = false; });
    document.addEventListener('click', (e) => { if (!root.contains(e.target)) out.hidden = true; });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { out.hidden = true; input.focus(); }
      if (e.key === 'ArrowDown' && document.activeElement === input) { const f = $('a', out); if (f) { e.preventDefault(); f.focus(); } }
    });
  });

  /* Carousels */
  function initCarousel(root) {
    const track = $('[data-carousel-track]', root);
    if (!track || root.dataset.ready) return;
    root.dataset.ready = '1';
    const prev = $('[data-carousel-prev]', root);
    const next = $('[data-carousel-next]', root);
    const bar = $('.carousel__bar span', root);
    let raf;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const fits = max <= 2;
      root.toggleAttribute('data-fits', fits);
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
      if (bar && !fits) {
        const w = Math.max(8, (track.clientWidth / track.scrollWidth) * 100);
        const p = max ? track.scrollLeft / max : 0;
        bar.style.setProperty('--bar-w', w + '%');
        bar.style.setProperty('--bar-x', (p * ((100 - w) / w) * 100) + '%');
      }
    };
    const step = (dir) => {
      const item = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const per = item ? Math.max(1, Math.floor((track.clientWidth + gap) / (item.offsetWidth + gap))) : 1;
      const dist = item ? per * (item.offsetWidth + gap) : track.clientWidth;
      track.scrollBy({ left: dir * dist, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    if (prev) prev.addEventListener('click', () => step(-1));
    if (next) next.addEventListener('click', () => step(1));
    track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(track);
    update();
  }
  window.initCarousels = (scope = document) => $$('[data-carousel]', scope).forEach(initCarousel);

  /* Tabs (WAI-ARIA pattern) */
  function selectTab(tab, focus) {
    const list = tab.closest('[role=tablist]');
    const root = tab.closest('[data-tabs]');
    $$('[role=tab]', list).forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) { loadRemote(panel); window.initCarousels(panel); }
    if (root) root.dispatchEvent(new CustomEvent('tabs:change', { detail: { tab } }));
  }
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tabs] [role=tab]');
    if (tab) selectTab(tab, false);
  });
  document.addEventListener('keydown', (e) => {
    const tab = e.target.closest('[data-tabs] [role=tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = $$('[role=tab]', tab.closest('[role=tablist]'));
    let i = tabs.indexOf(tab);
    if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') i = 0;
    if (e.key === 'End') i = tabs.length - 1;
    e.preventDefault();
    selectTab(tabs[i], true);
  });

  /* Remote panels: render real products through the Section Rendering API */
  async function loadRemote(panel) {
    const url = panel.dataset.remote;
    if (!url || panel.dataset.loaded) return;
    panel.dataset.loaded = '1';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const doc = parseHTML(await res.text());
      const content = $('[data-remote-content]', doc);
      const target = $('[data-remote-target]', panel) || panel;
      if (content && content.children.length) {
        target.innerHTML = content.innerHTML;
        window.initCarousels(target);
      } else {
        const empty = $('[data-remote-empty]', panel);
        if (empty) empty.hidden = false;
        target.innerHTML = '';
      }
    } catch (e) {
      delete panel.dataset.loaded;
    }
  }
  function initRemote() {
    const panels = $$('[data-remote]').filter((p) => !p.hidden);
    if (!('IntersectionObserver' in window)) { panels.forEach(loadRemote); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { loadRemote(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '400px 0px' });
    panels.forEach((p) => io.observe(p));
  }

  /* Read more */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-read-more]');
    if (!b) return;
    const box = document.getElementById(b.getAttribute('aria-controls'));
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    if (box) box.classList.toggle('is-expanded', open);
    b.textContent = open ? b.dataset.less : b.dataset.more;
  });

  /* Announcement */
  $$('[data-announcement]').forEach((bar) => {
    const btn = $('[data-announcement-close]', bar);
    if (btn) btn.addEventListener('click', () => { bar.hidden = true; store.set('elysium-ann-' + bar.dataset.announcement, '1'); });
  });

  /* Scroll reveal: elements already in view are marked visible before hiding the rest (no LCP delay). */
  function initReveal() {
    if (!T.reveal || reduceMotion || !('IntersectionObserver' in window)) return;
    const els = $$('.reveal');
    const vh = window.innerHeight;
    els.forEach((el) => { if (el.getBoundingClientRect().top < vh) el.classList.add('is-visible'); });
    document.documentElement.classList.add('reveal-on');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.filter((el) => !el.classList.contains('is-visible')).forEach((el) => io.observe(el));
  }

  /* Hero background video: the cover image paints first (fast LCP), the video starts after page load. */
  function initHero(scope) {
    $$('[data-hero]', scope).forEach((hero) => {
      if (hero.dataset.heroReady) return;
      hero.dataset.heroReady = '1';
      const video = $('[data-hero-video]', hero);
      const embed = $('[data-hero-embed]', hero);
      const media = video || embed;
      const btn = $('[data-hero-toggle]', hero);
      if (!media) return;
      const mobile = window.matchMedia('(max-width: 749px)').matches;
      if (mobile && media.hasAttribute('data-no-mobile')) return;
      let playing = false;
      const setState = (on) => {
        playing = on;
        hero.classList.toggle('is-playing', on);
        hero.classList.toggle('is-paused', !on);
        if (btn) { btn.hidden = false; btn.setAttribute('aria-label', on ? 'Pause background video' : 'Play background video'); }
      };
      const sizeEmbed = () => {
        const f = $('iframe', embed); if (!f) return;
        const w = embed.clientWidth; const h = embed.clientHeight;
        if (w / h > 16 / 9) { f.style.width = w + 'px'; f.style.height = Math.ceil(w * 9 / 16) + 'px'; }
        else { f.style.height = h + 'px'; f.style.width = Math.ceil(h * 16 / 9) + 'px'; }
      };
      const embedCommand = (cmd) => {
        const f = $('iframe', embed); if (!f) return;
        const msg = embed.dataset.provider === 'vimeo' ? { method: cmd } : { event: 'command', func: cmd === 'play' ? 'playVideo' : 'pauseVideo', args: [] };
        f.contentWindow.postMessage(JSON.stringify(msg), '*');
      };
      const play = () => {
        if (video) {
          if (!video.src) { video.src = (mobile && video.dataset.srcMobile) || video.dataset.src; }
          const p = video.play();
          if (p && p.then) p.then(() => setState(true)).catch(() => setState(false));
        } else if (embed) {
          if (!$('iframe', embed)) {
            const f = document.createElement('iframe');
            f.src = embed.dataset.heroEmbed;
            f.title = 'Background video';
            f.tabIndex = -1;
            f.allow = 'autoplay; encrypted-media; picture-in-picture';
            f.addEventListener('load', () => setTimeout(() => setState(true), 600), { once: true });
            embed.appendChild(f);
            sizeEmbed();
            if ('ResizeObserver' in window) new ResizeObserver(sizeEmbed).observe(embed);
          } else { embedCommand('play'); setState(true); }
        }
      };
      const pause = () => {
        if (video) video.pause(); else embedCommand('pause');
        setState(false);
      };
      if (btn) btn.addEventListener('click', () => { if (playing) { hero.dataset.userPaused = '1'; pause(); } else { delete hero.dataset.userPaused; play(); } });
      if (video) {
        video.addEventListener('playing', () => setState(true));
        // Pause off-screen to save CPU and battery; resume when visible again unless the visitor paused it.
        if ('IntersectionObserver' in window) {
          new IntersectionObserver((entries) => entries.forEach((en) => {
            if (!video.src || hero.dataset.userPaused) return;
            if (en.isIntersecting) video.play().catch(() => {}); else video.pause();
          })).observe(hero);
        }
      }
      if (reduceMotion) { setState(false); return; }
      const start = () => ('requestIdleCallback' in window ? window.requestIdleCallback(play, { timeout: 2500 }) : setTimeout(play, 300));
      if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
    });
  }

  /* Theme editor support */
  document.addEventListener('shopify:section:load', (e) => { initHero(e.target); window.initCarousels(e.target); $$('.reveal', e.target).forEach((el) => el.classList.add('is-visible')); });

  initHero(document);
  window.initCarousels();
  initRemote();
  initReveal();
})();
