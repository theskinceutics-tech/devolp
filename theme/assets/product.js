/* Elysium Clinical — product page: gallery, zoom, variant picker, recommendations */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const smooth = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  /* Gallery */
  $$('[data-gallery]').forEach((g) => {
    const track = $('[data-gallery-track]', g);
    if (!track) return;
    const slides = $$('.pdp__slide', track);
    const thumbs = $$('[data-thumb]', g);
    const dots = $$('.pdp__dots span', g);
    let current = 0;
    const mark = (i) => {
      current = i;
      thumbs.forEach((t, j) => { t.classList.toggle('is-active', i === j); t.setAttribute('aria-current', String(i === j)); });
      dots.forEach((d, j) => d.classList.toggle('is-active', i === j));
    };
    const goTo = (i) => {
      const s = slides[i];
      if (!s) return;
      track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: smooth });
      mark(i);
    };
    thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));
    let raf;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        if (i !== current) mark(i);
      });
    }, { passive: true });
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(Math.min(slides.length - 1, current + 1)); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(Math.max(0, current - 1)); }
    });
    g.goToMedia = (id) => {
      const i = slides.findIndex((s) => s.dataset.mediaId === String(id));
      if (i > -1) goTo(i);
    };
  });

  /* Zoom */
  const dialog = $('[data-zoom-dialog]');
  if (dialog && typeof dialog.showModal === 'function') {
    const img = $('[data-zoom-img]', dialog);
    document.addEventListener('click', (e) => {
      const z = e.target.closest('[data-zoom]');
      if (!z) return;
      img.src = z.dataset.zoom;
      img.classList.remove('is-zoomed');
      dialog.showModal();
    });
    img.addEventListener('click', (e) => {
      img.classList.toggle('is-zoomed');
      const r = img.getBoundingClientRect();
      img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
    });
    img.addEventListener('mousemove', (e) => {
      if (!img.classList.contains('is-zoomed')) return;
      const r = img.getBoundingClientRect();
      img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
    });
    $('[data-zoom-close]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  } else {
    document.addEventListener('click', (e) => {
      const z = e.target.closest('[data-zoom]');
      if (z) window.open(z.dataset.zoom, '_blank', 'noopener');
    });
  }

  /* Variant picker: instant UI update, then server-rendered price/stock via Section Rendering API */
  $$('[data-product-section]').forEach((section) => {
    const picker = $('[data-variant-picker]', section);
    if (!picker) return;
    const variants = JSON.parse($('[data-variants]', picker).textContent);
    const sectionId = section.dataset.productSection;
    const baseUrl = section.dataset.url;
    const idInput = $('[data-variant-id]', section);
    const addBtn = $('[data-add-button]', section);
    const addText = $('[data-add-text]', section);
    const gallery = $('[data-gallery]', section);
    const fieldsets = $$('fieldset', picker);
    let ctrl;

    const selected = () => fieldsets.map((fs) => { const c = $('input:checked', fs); return c ? c.value : null; });
    const markAvailability = (sel) => {
      fieldsets.forEach((fs, idx) => {
        $$('input', fs).forEach((input) => {
          const test = sel.slice(); test[idx] = input.value;
          const ok = variants.some((v) => v.available && v.options.every((o, i) => o === test[i]));
          input.nextElementSibling.classList.toggle('is-unavailable', !ok);
        });
      });
    };
    const update = async () => {
      const sel = selected();
      fieldsets.forEach((fs, i) => { const out = $('[data-option-value]', fs); if (out) out.textContent = sel[i] || ''; });
      markAvailability(sel);
      const v = variants.find((x) => x.options.every((o, i) => o === sel[i]));
      if (!v) {
        idInput.value = '';
        addBtn.disabled = true;
        addText.textContent = (window.theme && window.theme.strings.unavailable) || 'Unavailable';
        return;
      }
      idInput.value = v.id;
      addBtn.disabled = !v.available;
      addText.textContent = v.available ? (window.theme.strings.addToCart || 'Add to cart') : (window.theme.strings.soldOut || 'Sold out');
      window.history.replaceState({}, '', baseUrl + '?variant=' + v.id);
      if (v.featured_media && gallery && gallery.goToMedia) gallery.goToMedia(v.featured_media.id);
      if (ctrl) ctrl.abort();
      ctrl = new AbortController();
      try {
        const res = await fetch(baseUrl + '?variant=' + v.id + '&section_id=' + sectionId, { signal: ctrl.signal });
        const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
        ['[data-pdp-price]', '[data-stock]'].forEach((sel2) => {
          const fresh = $(sel2, doc); const cur = $(sel2, section);
          if (fresh && cur) cur.innerHTML = fresh.innerHTML;
        });
      } catch (e) { /* keep instant state */ }
    };
    picker.addEventListener('change', update);
    markAvailability(selected());
  });

  /* Recommendations (related / complementary) */
  const load = async (root) => {
    try {
      const res = await fetch(root.dataset.url);
      if (!res.ok) return;
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const content = $('[data-remote-content]', doc);
      if (content) { root.innerHTML = content.innerHTML; if (window.initCarousels) window.initCarousels(root); }
    } catch (e) { /* section stays hidden */ }
  };
  const recs = $$('[data-recommendations]').filter((r) => !r.children.length);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); load(en.target); } }), { rootMargin: '600px 0px' });
    recs.forEach((r) => io.observe(r));
  } else recs.forEach(load);
})();
