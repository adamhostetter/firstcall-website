/**
 * Regenerates the FirstCall Mechanical "sister" pages from the FCG originals.
 *
 *   careers.html        ->  mechanical/careers.html
 *   contact.html        ->  mechanical/contact.html
 *   locations.html      ->  mechanical/locations.html
 *
 * The FCG file is the single source of truth. This script clones it and
 * swaps FCG chrome (logo, nav, footer) for FCM chrome, fixes titles +
 * canonicals + OG tags, points internal nav links at /mechanical/*, and
 * rewrites asset paths to root-relative.
 *
 * Run this:
 *   - automatically as the Cloudflare Pages build command
 *     (set "Build command" in Pages settings to: node scripts/build-mechanical-sisters.js)
 *   - locally before previewing or pushing FCG sister-page changes
 *     (npm script or just `node scripts/build-mechanical-sisters.js`)
 *
 * Idempotent — running it multiple times produces the same output.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// =============================================================================
// Per-page metadata (overrides the FCG version)
// =============================================================================
const PAGES = {
  "careers.html": {
    title: "Careers — FirstCall Mechanical",
    canonical: "https://firstcallmechanical.com/careers",
    description:
      "Careers at FirstCall — we build durable partnerships with our team. View open positions, learn about our values, and see what makes FirstCall a great place to work.",
    ogUrl: "https://firstcallmechanical.com/careers",
  },
  "contact.html": {
    title: "Contact — FirstCall Mechanical",
    canonical: "https://firstcallmechanical.com/contact",
    description:
      "Get in touch with FirstCall Mechanical — commercial mechanical service in Columbus, Dallas-Fort Worth, and Austin. Reach out about service, careers, or partnerships.",
    ogUrl: "https://firstcallmechanical.com/contact",
  },
  "locations.html": {
    title: "All Network Branches — FirstCall Mechanical",
    canonical: "https://firstcallmechanical.com/locations",
    description:
      "The full FirstCall network — 25 commercial mechanical service branches across 11 states. HVAC, building controls, plumbing, and electrical.",
    ogUrl: "https://firstcallmechanical.com/locations",
  },
};

// =============================================================================
// FCM chrome — logos, nav, footer
// =============================================================================
const FCM_LOGO_INNER = '<g fill="#fff"><path d="M367.89,132.98c-4.99-2.89-10.93-5.51-17.99-5.51-27.68,0-73.04,42.48-147.1,137.74-32.5,39.69-58.88,60.09-79.34,70.94h167.65l97.04-168.07-20.26-35.09Z"/><path d="M182.96,249.38c55.28-71.12,93.34-111.73,123.33-131.62,15.83-10.49,30.07-15.59,43.53-15.59.1,0,.19.01.29.01l-12.19-21.11-.16-.1c-5.4-3.33-12-6.74-20.05-6.74-27.68,0-73.04,42.48-147.09,137.74-44.35,54.17-77.32,72.41-99.39,79.47l17.82,30.87c18.08-4.24,48.41-17.34,93.92-72.92Z"/><path d="M140.04,158.32c-44.58,54.45-77.65,72.6-99.73,79.58l17.82,30.86c18.22-4.57,48.19-18.33,92.64-72.62,55.28-71.12,93.34-111.74,123.33-131.62,15.83-10.49,30.07-15.59,43.52-15.59.59,0,1.18.05,1.78.07l-12.67-21.94c-5.31-3.25-11.77-6.47-19.6-6.47-27.68,0-73.04,42.48-147.1,137.74Z"/><path d="M120.2,142.49C175.48,71.37,213.53,30.75,243.53,10.87c7.14-4.73,13.94-8.31,20.5-10.87H97.04L0,168.07l27.2,47.12c18.19-4.48,48.26-18.07,92.99-72.7Z"/><path d="M496.7,69.75v31.5h70.2v36h-70.2v54.23h-46.8V33.74h122.41v36h-75.6Z"/><path d="M586.62,191.48v-127.26h37.76v127.26h-37.76Z"/><path d="M699.89,157.17h-19.97v34.31h-37.76v-127.26h59.36c34.13,0,53.73,16.34,53.73,45.2,0,18.88-7.62,32.68-21.42,40.48l25.78,41.57h-42.84l-16.88-34.31ZM701.52,128.12c11.26,0,17.79-6.17,17.79-17.61s-6.53-17.25-17.79-17.25h-21.6v34.85h21.6Z"/><path d="M879.24,77.29l-13.98,29.05c-13.07-7.44-31.59-14.16-42.3-14.16-6.35,0-10.53,2.18-10.53,6.9,0,18.7,66.44,7.62,66.44,53.55,0,27.05-23.96,39.94-52.46,39.94-21.6,0-45.2-7.62-61.18-20.15l14.16-28.68c13.07,11.07,34.31,19.42,47.38,19.42,7.99,0,13.07-2.72,13.07-8.53,0-19.24-66.44-7.08-66.44-51.92,0-24.51,20.88-40.12,52.65-40.12,19.42,0,39.39,5.81,53.19,14.7Z"/><path d="M961.46,94.36v97.12h-37.94v-97.12h-36.85v-30.14h111.83v30.14h-37.03Z"/><path d="M1157.57,60.3l-27,31.95c-9.9-12.6-24.53-20.93-37.58-20.93-21.38,0-37.58,17.33-37.58,40.5s16.2,40.73,37.58,40.73c12.15,0,26.78-7.2,37.58-18.23l27,28.8c-17.1,18.45-42.98,30.38-66.83,30.38-47.93,0-83.26-34.65-83.26-81.23s36-79.88,84.83-79.88c23.85,0,49.28,10.8,65.25,27.9Z"/><path d="M1198.98,171.15l-7.62,20.33h-38.85l54.28-127.26h38.85l52.46,127.26h-40.3l-7.44-20.33h-51.38ZM1225.13,101.98l-15.61,41.57h30.86l-15.25-41.57Z"/><path d="M1398.48,159.89v31.59h-91.13v-127.26h37.76v95.67h53.37Z"/><path d="M1502.68,159.89v31.59h-91.13v-127.26h37.76v95.67h53.37Z"/><path d="M542.82,335.83l-.14-68.51-32.7,56.7h-8.24l-32.7-55.82v67.63h-17.63v-103.36h15.21l39.52,68.51,38.81-68.51h15.21l.14,103.36h-17.48Z"/><path d="M661.8,319.74v16.09h-74.63v-103.36h72.64v16.09h-54.16v26.87h48.05v15.8h-48.05v28.5h56.15Z"/><path d="M674.87,284.15c0-30.86,22.74-53.16,53.31-53.16,16.21,0,30.14,6.05,39.38,17.28l-11.94,11.67c-7.25-8.12-16.21-12.11-26.58-12.11-20.61,0-35.54,15.06-35.54,36.32s14.93,36.32,35.54,36.32c10.38,0,19.33-3.99,26.58-12.26l11.94,11.81c-9.24,11.22-23.17,17.28-39.52,17.28-30.42,0-53.16-22.3-53.16-53.16Z"/><path d="M873.74,232.47v103.36h-18.48v-44.3h-51.46v44.3h-18.48v-103.36h18.48v42.67h51.46v-42.67h18.48Z"/><path d="M965,311.91h-49.75l-9.81,23.92h-19.05l44.78-103.36h18.2l44.92,103.36h-19.33l-9.95-23.92ZM958.89,296.85l-18.76-45.18-18.62,45.18h37.39Z"/><path d="M1095.35,232.47v103.36h-15.21l-54.87-69.99v69.99h-18.34v-103.36h15.21l54.87,69.99v-69.99h18.34Z"/><path d="M1122.08,232.47h18.48v103.36h-18.48v-103.36Z"/><path d="M1160.31,284.15c0-30.86,22.74-53.16,53.31-53.16,16.21,0,30.14,6.05,39.38,17.28l-11.94,11.67c-7.25-8.12-16.21-12.11-26.58-12.11-20.61,0-35.54,15.06-35.54,36.32s14.93,36.32,35.54,36.32c10.38,0,19.33-3.99,26.58-12.26l11.94,11.81c-9.24,11.22-23.17,17.28-39.52,17.28-30.42,0-53.16-22.3-53.16-53.16Z"/><path d="M1333.17,311.91h-49.75l-9.81,23.92h-19.05l44.78-103.36h18.2l44.92,103.36h-19.33l-9.95-23.92ZM1327.06,296.85l-18.76-45.18-18.62,45.18h37.39Z"/><path d="M1375.1,232.47h18.48v87.12h52.03v16.24h-70.51v-103.36Z"/><path d="M1472.82,320.08h-5v-2.23h12.07v2.23h-5v15.71h-2.06v-15.71Z"/><path d="M1495.69,335.8l-.02-13.07-5.27,10.89h-.96l-5.27-10.82v13h-2v-17.94h1.71l6.09,12.61,6-12.61h1.71l.02,17.94h-2Z"/></g>';

const FCM_HEADER_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1502.68 337.31" aria-hidden="true">' +
  FCM_LOGO_INNER +
  "</svg>";

const FCM_FOOTER_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1502.68 337.31" aria-label="FirstCall Mechanical">' +
  FCM_LOGO_INNER +
  "</svg>";

const FCM_NAV_BLOCK =
  '<a class="site-header__logo" href="https://firstcallmechanical.com/" aria-label="FirstCall Mechanical — home">\n        ' +
  FCM_HEADER_LOGO_SVG +
  '\n      </a>\n\n      <nav class="site-nav" data-site-nav aria-label="Primary">\n        <div class="site-nav__dropdown-wrap" data-dropdown>\n          <button type="button" class="site-nav__link site-nav__dropdown-toggle"\n                  aria-haspopup="true" aria-expanded="false" data-dropdown-toggle>\n            FirstCall Branches\n            <svg class="site-nav__caret" viewBox="0 0 12 12" aria-hidden="true">\n              <path d="M2 4 L6 8 L10 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>\n            </svg>\n          </button>\n          <div class="site-nav__dropdown" data-dropdown-menu>\n            <a class="site-nav__dropdown-link" href="https://firstcallmechanical.com/columbus">Columbus, OH</a>\n            <a class="site-nav__dropdown-link" href="https://firstcallmechanical.com/dfw">Dallas-Fort Worth, TX</a>\n            <a class="site-nav__dropdown-link" href="https://firstcallmechanical.com/central-texas">Austin, TX</a>\n          </div>\n        </div>\n        <a class="site-nav__link" href="/mechanical/locations">All Network Branches</a>\n        <a class="site-nav__link" href="/mechanical/careers">Careers</a>\n        <a class="site-nav__link" href="/mechanical/contact">Contact</a>\n        <a class="site-nav__link" href="/" rel="noopener">FirstCall Group</a>\n      </nav>\n\n      <div class="site-header__cta">\n        <a class="btn btn--primary btn--sm hide-mobile" href="__CTA_HREF__">__CTA_LABEL__</a>';

const DROPDOWN_CSS = `
    /* ===== Nav dropdown (Branches) — injected by build-mechanical-sisters.js ===== */
    .site-header__logo svg { height: 42px; width: auto; display: block; }
    .site-nav__dropdown-wrap { position: relative; }
    .site-nav__dropdown-toggle {
      background: none; border: none; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px;
      font-family: var(--font-body); font-size: var(--text-base); font-weight: var(--weight-medium);
      color: var(--color-text-on-dark); padding: var(--space-2) 0;
    }
    .site-nav__caret { width: 12px; height: 12px; transition: transform var(--duration-base) var(--ease-out); }
    .site-nav__dropdown-toggle[aria-expanded="true"] .site-nav__caret { transform: rotate(180deg); }
    .site-nav__dropdown {
      position: absolute; top: calc(100% + 6px); left: -8px;
      min-width: 240px;
      background: rgba(15, 40, 20, 0.97);
      backdrop-filter: saturate(180%) blur(10px);
      -webkit-backdrop-filter: saturate(180%) blur(10px);
      border: 1px solid rgba(74, 125, 82, 0.35);
      border-radius: var(--radius-md);
      padding: var(--space-2);
      box-shadow: var(--shadow-lg);
      display: none;
      z-index: 1000;
    }
    .site-nav__dropdown.is-open { display: block; }
    .site-nav__dropdown-link {
      display: block; padding: var(--space-3); color: var(--color-text-on-dark);
      border-radius: var(--radius-sm); font-size: var(--text-base);
      font-weight: var(--weight-medium); text-decoration: none;
    }
    .site-nav__dropdown-link:hover, .site-nav__dropdown-link:focus-visible {
      background: rgba(91, 163, 214, 0.15); color: var(--color-accent-light);
    }
    @media (max-width: 1023px) {
      .site-nav__dropdown-wrap { width: 100%; }
      .site-nav__dropdown-toggle {
        width: 100%; justify-content: space-between;
        padding-block: var(--space-4);
        border-bottom: 1px solid rgba(74, 125, 82, 0.4);
        font-size: var(--text-lg);
      }
      .site-nav__dropdown {
        position: static;
        background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none;
        border: none; border-radius: 0; box-shadow: none; padding: 0; min-width: 0;
        display: none;
      }
      .site-nav__dropdown.is-open { display: block; }
    }
`;

const DROPDOWN_JS = `

      function initDropdowns() {
        var wraps = document.querySelectorAll("[data-dropdown]");
        wraps.forEach(function (wrap) {
          var toggle = wrap.querySelector("[data-dropdown-toggle]");
          var menu   = wrap.querySelector("[data-dropdown-menu]");
          if (!toggle || !menu) return;
          function open()  { menu.classList.add("is-open");    toggle.setAttribute("aria-expanded", "true"); }
          function close() { menu.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
          toggle.addEventListener("click", function (e) {
            e.stopPropagation();
            menu.classList.contains("is-open") ? close() : open();
          });
          document.addEventListener("click", function (e) {
            if (!wrap.contains(e.target)) close();
          });
          if (window.matchMedia("(min-width: 1024px)").matches) {
            wrap.addEventListener("mouseenter", open);
            wrap.addEventListener("mouseleave", close);
          }
        });
      }`;

const FCM_FOOTER_COLUMNS = `<div>
          <div class="site-footer__heading">Branches</div>
          <ul class="site-footer__list">
            <li><a href="https://firstcallmechanical.com/columbus">Columbus, OH</a></li>
            <li><a href="https://firstcallmechanical.com/dfw">Dallas-Fort Worth, TX</a></li>
            <li><a href="https://firstcallmechanical.com/central-texas">Austin, TX</a></li>
          </ul>
        </div>
        <div>
          <div class="site-footer__heading">FirstCall Network</div>
          <ul class="site-footer__list">
            <li><a href="/mechanical/locations">All Network Branches</a></li>
            <li><a href="/" rel="noopener">FirstCall Group</a></li>
          </ul>
        </div>
        <div>
          <div class="site-footer__heading">Connect</div>
          <ul class="site-footer__list">
            <li><a href="https://www.linkedin.com/company/firstcall-mechanical/" rel="noopener">LinkedIn</a></li>
            <li><a href="/mechanical/careers">Careers</a></li>
            <li><a href="/mechanical/contact">Contact</a></li>
          </ul>
        </div>`;

// =============================================================================
// Transformation pipeline
// =============================================================================
function buildOne(sourceFile, destFile, meta) {
  const sourcePath = path.join(ROOT, sourceFile);
  const destPath = path.join(ROOT, destFile);
  let html = fs.readFileSync(sourcePath, "utf8");
  const inputBytes = html.length;

  // ---- Head: title / canonical / description / og ----
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  html = html.replace(
    /<link rel="canonical" href="[^"]+"/,
    `<link rel="canonical" href="${meta.canonical}"`
  );
  html = html.replace(
    /<meta name="description" content="[^"]+"/,
    `<meta name="description" content="${meta.description}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]+"/,
    `<meta property="og:title" content="${meta.title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]+"/,
    `<meta property="og:description" content="${meta.description}"`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]+"/,
    `<meta property="og:url" content="${meta.ogUrl}"`
  );

  // ---- Header (logo + nav). Anchor: site-header__logo opening through the page's CTA button. ----
  html = html.replace(
    /<a class="site-header__logo"[^>]*>[\s\S]*?<a class="btn btn--primary btn--sm hide-mobile" href="([^"]+)">([^<]+)<\/a>/,
    (_, ctaHref, ctaLabel) =>
      FCM_NAV_BLOCK.replace("__CTA_HREF__", ctaHref).replace("__CTA_LABEL__", ctaLabel)
  );

  // ---- Footer brand SVG (FCG → FCM) ----
  html = html.replace(
    /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 1080 339\.464" aria-label="FirstCall Group">[\s\S]*?<\/svg>/,
    FCM_FOOTER_LOGO_SVG
  );

  // ---- Footer brand paragraph ----
  html = html.replace(
    "<p>FirstCall is a multi-region commercial mechanical service platform — partnering with property owners and facility managers across the United States.</p>",
    "<p>FirstCall Mechanical — commercial HVAC, building controls, and project work in Columbus, DFW, and Austin. Backed by the FirstCall Group national platform.</p>"
  );

  // ---- Footer columns (the 3 link columns between brand and copyright) ----
  html = html.replace(
    /<div>\s*<div class="site-footer__heading">FirstCall<\/div>[\s\S]*?<div class="site-footer__heading">Connect<\/div>[\s\S]*?<\/ul>\s*<\/div>/,
    FCM_FOOTER_COLUMNS
  );

  // ---- Copyright ----
  html = html.replace(
    "&copy; 2026 FirstCall Group. All rights reserved.",
    "&copy; 2026 FirstCall Mechanical. All rights reserved."
  );

  // ---- Inject dropdown CSS just before </style> ----
  html = html.replace("  </style>", DROPDOWN_CSS + "  </style>");

  // ---- Inject dropdown JS right after the initMobileNav function block ----
  html = html.replace(
    /(function initMobileNav\(\) \{[\s\S]*?\n      \})/,
    "$1" + DROPDOWN_JS
  );

  // ---- Wire initDropdowns() into the existing init flow ----
  html = html.replace(
    /initMobileNav\(\);/g,
    "initMobileNav();\n          initDropdowns();"
  );

  // ---- Asset paths: root-relative so they resolve from /mechanical/* ----
  html = html.replace(/src="assets\/js\//g, 'src="/assets/js/');
  html = html.replace(/src="assets\/Photos\//g, 'src="/assets/Photos/');

  // ---- Internal page links: nav targets at /mechanical/* for FCM,
  //      external/branch hosts kept as absolute, root pages kept at /. ----
  const linkMap = {
    'href="acquisitions.html"': 'href="/acquisitions"',
    'href="locations.html"':    'href="/mechanical/locations"',
    'href="team.html"':         'href="/team"',
    'href="news.html"':         'href="/news"',
    'href="careers.html"':      'href="/mechanical/careers"',
    'href="contact.html"':      'href="/mechanical/contact"',
    'href="index.html"':        'href="/"',
  };
  for (const [from, to] of Object.entries(linkMap)) {
    html = html.split(from).join(to);
  }

  // ---- locations.html specific: the 3 hardcoded FCM brand cards link absolute.
  //      (FCG source already has these absolute after commit 53ce0b6, but be
  //      idempotent in case someone edits FCG locations.html.) ----
  html = html
    .replace(/href="\/columbus"(?=[^>]*FirstCall Mechanical — Columbus)/g, 'href="https://firstcallmechanical.com/columbus"')
    .replace(/href="\/dfw"(?=[^>]*FirstCall Mechanical — DFW)/g,           'href="https://firstcallmechanical.com/dfw"')
    .replace(/href="\/central-texas"(?=[^>]*FirstCall Mechanical — Austin)/g, 'href="https://firstcallmechanical.com/central-texas"');

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, html, "utf8");
  console.log(
    `  ${sourceFile.padEnd(20)} -> ${destFile.padEnd(35)} (${inputBytes} -> ${html.length} bytes)`
  );
}

// =============================================================================
// Run
// =============================================================================
console.log("Building FCM sister pages from FCG sources:");
for (const [source, meta] of Object.entries(PAGES)) {
  const dest = path.join("mechanical", source);
  buildOne(source, dest, meta);
}
console.log("Done.");
