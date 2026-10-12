/* Filters and sorting: native Shopify URL parameters, so results stay crawlable and shareable. */
(() => {
  const go = (form) => {
    const params = new URLSearchParams();
    new FormData(form).forEach((v, k) => { if (v !== '') params.append(k, v); });
    window.location.search = params.toString();
  };
  const isDesktop = () => window.matchMedia('(min-width: 990px)').matches;
  let t;
  document.addEventListener('change', (e) => {
    const sort = e.target.closest('[data-sort]');
    if (sort) { go(sort.form); return; }
    const form = e.target.closest('[data-facets-form]');
    // Desktop applies instantly; mobile waits for "Show results" so shoppers can pick several filters.
    if (form && isDesktop()) { clearTimeout(t); t = setTimeout(() => go(form), e.target.type === 'number' ? 700 : 150); }
  });
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-facets-form]');
    if (form) { e.preventDefault(); go(form); }
  });
})();
