# Elysium Clinical — Shopify theme for Elysium Skin Sciences

A Shopify Online Store 2.0 theme. Its layout and interaction patterns are modelled on large clinical-skincare storefronts: a dark header with a mega-menu, editorial split sections, product carousels, a routine builder and long, modular product pages. The branding, copy and artwork are original Elysium work. No SkinCeuticals images, text, code or claims are used.

Products, prices (PKR), images, collections, blogs, menus and policies are read live from your Shopify store. The theme never invents prices, reviews, results or endorsements: a section that depends on data you haven't added hides itself.

- Theme source: [`theme/`](theme/)
- QA, performance and test report: [`docs/QA-REPORT.md`](docs/QA-REPORT.md)

## 1. Install as an unpublished theme (safe: your live theme is not touched)

1. Zip the **contents** of `theme/`, so that `layout/`, `templates/` and the other folders sit at the root of the zip. A ready-made zip is attached in the chat.
2. In Shopify admin, go to **Online Store → Themes → Add theme → Upload zip file**.
3. The theme uploads as **unpublished**. Use **Customize** to preview it and **Preview** to share a link.
4. Publish only after you have checked it.

> If your current theme has tracking code pasted into `theme.liquid` (Google tag, Meta Pixel and so on), copy it across or move it to **Settings → Customer events** before you publish. App embeds and Shopify's own analytics load automatically through `content_for_header`.

## 2. Pages to create (Online Store → Pages)

| Page title | Handle | Template to select |
|---|---|---|
| About | `about` | `page.about` |
| Our Science | `science` | `page.science` |
| Build Your Routine | `routine` | `page.routine` |
| Ingredient Glossary | `ingredients` | `page.ingredients` |
| Contact | `contact` | `page.contact` |
| One page per ingredient (e.g. PDRN, Exosomes) | `pdrn`, `exosomes`, … | `page.ingredient` |

Ingredient cards link automatically to a page whose handle matches the ingredient name, and fall back to a store search when no such page exists. Concern collections, such as Acne or Pigmentation, can use the `collection.concern` template.

## 3. Menus (Online Store → Navigation)

- **main-menu**: top-level items become the desktop navigation. Nest items up to 3 levels: a level-2 item with children becomes a mega-menu column. A flat list becomes a single list column.
- **footer**: help and policy links.
- Optional: a small "utility" menu (Customer care, Track order), which you select in the Header settings.

Mega-menu image cards: in **Customize → Header → Add block "Mega-menu image card"**, type the top-level menu title (for example `Skin Care`) and pick an image or a collection.

## 4. Product metafields (Settings → Custom data → Products)

Create these definitions and fill them per product. Every product-page module below is hidden until its metafield has content, so no generic or invented claims ever appear.

| Namespace.key | Type | Used for |
|---|---|---|
| `custom.subtitle` | Single line text | Tagline under the title (cards and product page) |
| `custom.size` | Single line text | e.g. `30 ml` |
| `custom.short_description` | Multi-line text | Summary next to the buy button (otherwise the first 30 words of the description) |
| `custom.benefits` | List of single line text | Benefits icon grid |
| `custom.key_ingredients` | List of single line text, format `Name \| Short description` | Key-ingredient cards |
| `custom.ingredients_full` | Multi-line text | "Full ingredient list" drawer and accordion |
| `custom.how_to_use` | List of single line text, format `Step \| Instruction` | How-to-use steps |
| `custom.how_to_use_text` | Multi-line text | Alternative to the list above |
| `custom.how_to_use_image` | File (image) | Optional |
| `custom.caution` | Single line text | Warning under the steps |
| `custom.science_heading` / `custom.science_text` / `custom.science_image` | Text / Multi-line / File | "Science behind the formula" |
| `custom.results` / `custom.results_note` | List `20% \| description` / Single line | **Documented study results only** |
| `custom.expert_quote` / `custom.expert_name` / `custom.expert_title` / `custom.expert_photo` | Text / Text / Text / File | **Approved, attributable professional quotes only** |
| `custom.faq` | List of single line text, format `Question \| Answer` | Product FAQ (shown before the general FAQs) |
| `custom.routine_am` / `custom.routine_pm` | List of product references | "Complete your routine" with Day/Night tabs |

Collection and page FAQs use the same `custom.faq` format on the collection or page. Article featured products use `custom.related_products` (list of product references) on the article.

Product badges come from tags: add `badge:Best Seller` or `badge:New` to a product. Sale and Sold out badges are automatic.

Reviews: add your review app's block to the **Reviews** section on the product template. The star rating on cards reads the standard `reviews.rating` metafield that review apps write.

## 5. Images to upload in Customize

Sections that have no photo show original Elysium "molecular" artwork or your product photos, so nothing ever looks empty. For the final look, upload:

| Where | Recommended size |
|---|---|
| Home → Hero banner (desktop + mobile) | 1920×800 and 900×1200 |
| Home → Promotion band | Transparent PNG product shot |
| Home → Science / Image banner | Laboratory or texture photography, 1600×1200 |
| Service cards, Ingredient cards | 1200×900 / 1000×1000 |
| Collections | Set a collection image in **Products → Collections** |
| Logo | **Theme settings → Logo** (a light version for the dark header) |

## 6. Editorial copy

All default headings and paragraphs are drafted in a neutral, non-medical tone and are editable in **Customize**. Review every line against your approved claims before publishing. This applies especially to the ingredient descriptions on the home, science and glossary pages: delete any ingredient that is not in an Elysium product.
