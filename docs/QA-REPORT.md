# Elysium Clinical — build, QA and performance report

Date: 12 October 2026 · Theme version 1.0.2

## 1. What could and could not be inspected

| Source | Status |
|---|---|
| Attached audit (`SkinCeuticals_Section_Function_Animation_Audit`) | Read in full. Its section lists for homepage, PDP, PLP, bundle, advice, article, ingredient and about templates were used as the module checklist. |
| 4 uploaded full-page screenshots (Homepage, About, Build Your Routine, P-TIOX PDP) | Inspected. Section order, colour blocking (black header/footer, dark editorial bands, blue CTA band, light-grey panels), card anatomy and button styles were taken from these. |
| Live skinceuticals.com, robots.txt, sitemaps, 51 seed URLs | **Not inspected.** Outbound requests from this environment are refused (HTTP 403 at the proxy), and the two saveweb2zip downloads contained only Cloudflare's "Just a moment…" page. No per-URL measurements, computed CSS or animation timings were captured, and none are claimed. |
| Live elysiumskinsciences.com | **Not inspected** (same network block). |
| Shopify Admin (products, collections, current theme, apps) | **Not inspected.** The Shopify connector needs to be re-authorised. As a result no development theme was created, no catalogue audit was run and no preview URL exists yet. |

Dimensions in this theme are therefore **Elysium design tokens** (section 3). They are informed by the screenshots and the audit's estimates, not measured from the reference site.

## 2. Reference template → Elysium mapping

| Reference template (from audit/screenshots) | Elysium template | Sections |
|---|---|---|
| Homepage (~13 groups) | `index.json` | Announcement · Header/mega-menu · Hero · Promotion band · Intro + best-seller carousel · Shop by category · Shop by concern · Routine/service cards · Dark science split · Product spotlight · Routine builder (tabs) · Ingredient cards · Regimen carousel · Editorial banner · Expert advice · Reassurance band · Footer |
| PDP (~15–16 modules) | `product.json` | Gallery + zoom + buy box · Benefits (dark icon grid) · Details (dark split) · Blue CTA band · Science + documented results · Professional insight · Key ingredients + full-list drawer · How to use · FAQ (dark, large "FAQ") · Complete your routine (Day/Night) · Editorial banner · Reviews (app block) · Related products · Reassurance |
| All products / PLP / concern PLP | `collection.json`, `collection.concern.json` | Title + description + image · Filter sidebar/drawer (native Shopify filters) · Sort · 4/3/2-column grid · Pagination · FAQ (metafield) · CTA band / advice |
| Expert advice library + subcategory | `blog.json` | Hero · Tag navigation · Featured article · Article grid · Ingredient cards · Best sellers |
| Individual article | `article.json` | Title · Author/date/read-time · Hero image · Auto table of contents · Body · Featured products (metafield) · Related articles · Article schema |
| Ingredient glossary | `page.ingredients.json` | Hero · A–Z jump navigation · Ingredient cards · Best sellers |
| Ingredient detail | `page.ingredient.json` | Hero · Page content · Products carousel (choose a collection) · FAQ (page metafield) · Related reading |
| About / Our science | `page.about.json`, `page.science.json` | Hero · Alternating editorial splits · Technology accordion · Dark split · Get-in-touch cards · CTA band |
| Build Your Routine | `page.routine.json` | Pill label + H1 · Routine builder · Editorial split · Best sellers · Advice · FAQ |
| Customer service / contact | `page.contact.json` | Hero · Content · Contact form · Help cards |
| Cart, search, 404, account, password, gift card | Matching templates | Fully styled |

Not built, deliberately: a professional-locator map, a virtual consultation booking flow, a treatment comparison table, customer-media UGC, and a "timeline of milestones". These need real data or services that Elysium has not supplied. The theme does not show them as fake interfaces.

## 3. Design tokens (Elysium, editable in Theme settings)

- Colours: ink `#111418`, secondary text `#4b5561`, light surface `#f3f5f8`, light blue `#e4ecf5`, dark `#0e1114`, brand blue `#1c5fa8`, deep blue `#0f3866`, line `#dde3ea`, sale `#a8231c`.
- Type: Montserrat 600 headings / 400 body (Shopify font CDN, `font-display: swap`, preloaded). Body 15px. H1 `clamp(28px, 3.3vw, 44px)`, H2 `clamp(23px, 2.5vw, 34px)`. Uppercase labels at 11.5–12.5px with 0.08–0.14em tracking.
- Layout: max width 1320px (setting). Gutter `clamp(16px, 4vw, 56px)`. Section spacing `clamp(48px, 7vw, 96px)`.
- Header: 38px announcement, 74px top row and 46px nav on desktop; 64px on mobile; sticky.
- Buttons: 48px (52px on the PDP), square corners, uppercase.
- Media: product cards 1:1 (contain), category tiles 4:5, editorial 1:1 / 4:3 / 16:10, articles 4:3.
- Breakpoints: 750px (tablet), 900px (splits), 990px (desktop header, PDP and filters), 1100px (4-column grid).
- Motion: buttons 180ms; mega-menu 220ms; drawers 280ms; carousel smooth scroll; scroll reveal 500ms fade/translate; all switched off under `prefers-reduced-motion`. Opacity and transform only, so there is no layout animation.

## 4. Automated checks run

### 4.0a Added in 1.0.2: video in the homepage hero
- **Image / Video** switch on the Hero banner. Supports a Shopify-hosted video (separate mobile video optional) or a YouTube / Vimeo link, a mobile on/off switch and a pause / play button.
- Performance: the cover image is the eager, `fetchpriority=high` element. The video has `preload="none"` and starts only after the page `load` event, during idle time. It pauses when scrolled off-screen and does not autoplay under `prefers-reduced-motion`.
- Fixed in the same release: buttons on a dark image or video were black, and are now white. In the mobile stacked layout they stay dark.
- Browser tests (Chromium, real video file): **18/18 passed**. Covered:
  - The image fills the banner.
  - No video is downloaded during HTML parse.
  - The video autoplays muted after load and fades in.
  - Pause and play work by mouse and keyboard.
  - Reduced-motion visitors are offered a play button instead of autoplay.
  - On mobile the video plays without overflow; with the mobile switch off, phones get the image only.
  - The YouTube iframe is injected muted and looping, and is sized to cover the banner.
  - No JavaScript errors.
- Lighthouse on the video hero (local preview): mobile 100 (LCP 1.4 s, CLS 0, TBT 10 ms), desktop 100.

### 4.0 Fixes in 1.0.1 (reported after the first upload)
- **"Section does not exist" errors.** Shopify rejected `trust-bar`, `cta-band` and `ingredient-cards` at upload, because their `url` settings had defaults other than `/collections` or `/collections/all` (Shopify allows only those two). Every template that uses these sections then showed a missing-section error. The defaults have been removed.
- A strict upload-rule validator (`url`/resource defaults, range steps, select options, richtext format, unknown template settings, block types, name lengths) now reports **0 problems** for all sections, templates and section groups.
- **404s.** A new `safe-url` snippet checks that a linked page, policy, blog or collection exists before outputting the link. It is used by the buttons, CTA band, reassurance band, service cards, concern cards, ingredient cards, carousel intro link and announcement bar. Rich-text defaults no longer link to pages that may not exist.
- `predictive-search` now has a schema.


### 4.1 Shopify Theme Check (`@shopify/theme-check-node`, recommended config)
Final result: **0 errors, 0 warnings.** The first run found 11 errors and 8 warnings; all were fixed. They were filters inside `render` arguments, a missing image width/height, an unclosed-element branch, preload tags and a hard-coded route.

### 4.2 Render test
Every template was rendered with LiquidJS, using mocked Shopify objects and sample products: index, product, collection, about, routine, science, ingredients, contact, cart and 404. Result: no Liquid runtime errors.

### 4.3 Responsive overflow (Chromium)
Horizontal overflow was measured at 360, 390, 768, 1024 and 1440px on 10 templates. The final result is **0px on all** of them. Two bugs were found and fixed: the text-logo width on mobile and the edge-to-edge split media width.

### 4.4 Interaction tests (Playwright, real Chromium): 26/26 passed
Desktop:
- Mega-menu: opens on hover, closes when the mouse leaves, opens on keyboard focus.
- Carousel: next/prev buttons move the track and update their disabled state.
- Routine builder: tab switching, arrow-key navigation, and product cards loaded through the Section Rendering API.
- Cart drawer: opens from the header, closes with Escape.

Product page:
- Gallery thumbnails.
- Zoom dialog, with click to magnify.
- Quantity stepper.
- Accordion.
- Full-ingredients drawer.
- Day/Night routine toggle.

Mobile:
- Menu drawer, submenu expanding and closing.
- Search overlay.
- 44px tap targets.
- Filter drawer.

No JavaScript errors were thrown on any page.

### 4.5 Lighthouse 13 (local preview build, simulated throttling)

| Template | Mobile perf | Desktop perf | Mobile LCP | CLS | TBT | A11y (m/d) |
|---|---|---|---|---|---|---|
| Home | 98 | 100 | 2.1 s | 0 | 10 ms | 100 / 96* |
| Product | 100 | 100 | 1.4 s | 0 | 30 ms | 100 / 96* |
| Collection | 100 | 100 | 1.6 s | 0 | 0 ms | 100 / 95* |
| About | 100 | 100 | 1.3 s | 0 | 0 ms | 100 / 95* |
| Build your routine | 100 | 100 | 1.6 s | 0 | 0 ms | 100 / 95* |
| Our science | 100 | 100 | 1.4 s | 0 | 0 ms | 100 / 95* |
| Ingredient glossary | 100 | 100 | 1.4 s | 0 | 0 ms | 100 / 95* |

\* The desktop accessibility point was an `aria-expanded` attribute on the search input. It was fixed after this run by adding `role="combobox"`. The SEO scores (91–92) and best-practice scores (96) in the preview come from a missing meta description and a missing favicon in the mock pages. In Shopify these come from your SEO settings and the favicon setting.

**These scores are not a PageSpeed result for the live store.** The preview has no `content_for_header` (Shopify analytics, apps, pixels), no real product photography and no web fonts. They show that the theme's own HTML, CSS (`base.css` 35 KB, about 8 KB gzipped) and JavaScript (17 KB global plus 7 KB on product pages, all deferred) are light. Apps and tracking scripts are usually the largest factor on Shopify. The 80+ mobile target must be re-measured on the unpublished theme preview URL once it exists.

## 5. Performance engineering in the theme

- Responsive `srcset`/`sizes` for every image, with intrinsic width/height (no CLS).
- The first section's image is eager with `fetchpriority="high"`; everything else is lazy and async.
- Separate desktop and mobile hero crops via `<picture>`.
- No frameworks. Carousels use CSS scroll-snap with about 60 lines of JS. Accordions use native `<details>`. Zoom uses native `<dialog>`.
- Page-specific CSS and JS (`product.*`, `collection.css`, `facets.js`) load only on those templates.
- Reveal-on-scroll never hides content that is already in the viewport, so it cannot delay LCP.
- Recommendations and routine products are lazy-loaded with IntersectionObserver.

## 6. SEO

- Product, collection, blog and page URLs are untouched: a theme cannot change them.
- `canonical_url`, Open Graph and Twitter tags.
- JSON-LD: Organization + WebSite SearchAction (home), Product (`structured_data`), Article, BreadcrumbList.
- One H1 per template, semantic landmarks and a skip link.
- Filters and sorting use native Shopify URL parameters, so they are crawlable.
- If an SEO app already outputs Product or Breadcrumb schema, remove the matching block in `snippets/structured-data.liquid` or `snippets/breadcrumbs.liquid` to avoid duplicates.

## 7. Not yet verified (needs the real store)

- Add to cart against the live cart API.
- Multi-variant switching. The logic is implemented, but the sample products had a single variant.
- Predictive search API results.
- Filters with your Search & Discovery configuration.
- Complementary and related recommendations.
- Newsletter and contact form submission.
- Customer account pages.
- Gift card page.
- Payment-button rendering.

## 8. Next steps once the Shopify connector is re-authorised

1. Read the catalogue, collections, menus, blogs and current theme (read-only).
2. Upload this theme as an **unpublished** theme and send the preview link.
3. Create the pages from README §2 and the metafield definitions from README §4.
4. Run PageSpeed Insights (mobile + desktop) on the preview URL for every template, and fix anything under 80 or 90.
5. Retest add to cart, variants, filters and search on the preview.
6. Publish only with your approval.
