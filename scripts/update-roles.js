/**
 * One-shot: set Matthew Hunt + Chris Landreth roles back to "Group President"
 * across team.html and llms.txt.
 *
 * Run: node scripts/update-roles.js
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const REPLACEMENTS = [
  // ---- team.html ----
  // Matthew Hunt — JSON-LD
  [
    `"name": "Matthew Hunt",\n      "jobTitle": "Chief Commercial Officer",`,
    `"name": "Matthew Hunt",\n      "jobTitle": "Group President",`,
  ],
  [
    `"description": "Matthew Hunt joined FirstCall in 2024 as CCO. Licensed Professional Engineer; founder of C2H Air and Electric; 20+ years in commercial HVAC and electrical contracting."`,
    `"description": "Matthew Hunt joined FirstCall in 2024 as Group President. Licensed Professional Engineer; founder of C2H Air and Electric; 20+ years in commercial HVAC and electrical contracting."`,
  ],
  // Matthew Hunt — leader button + image alt
  [
    `data-name="Matthew Hunt"\n                  data-title="Chief Commercial Officer"`,
    `data-name="Matthew Hunt"\n                  data-title="Group President"`,
  ],
  [
    `alt="Matthew Hunt, Chief Commercial Officer"`,
    `alt="Matthew Hunt, Group President"`,
  ],
  [
    `<div class="leader__name">Matthew Hunt</div>\n              <div class="leader__title">Chief Commercial Officer</div>`,
    `<div class="leader__name">Matthew Hunt</div>\n              <div class="leader__title">Group President</div>`,
  ],

  // Chris Landreth — JSON-LD
  [
    `"name": "Chris Landreth",\n      "jobTitle": "Senior Vice President of M&A, Integration",`,
    `"name": "Chris Landreth",\n      "jobTitle": "Group President",`,
  ],
  [
    `"description": "Chris Landreth joined FirstCall in 2022 as Senior VP of M&A, Integration. Co-founder of STR Mechanical, FirstCall's first partner branch. 20+ years in commercial HVAC."`,
    `"description": "Chris Landreth joined FirstCall in 2022 as Group President. Co-founder of STR Mechanical, FirstCall's first partner branch. 20+ years in commercial HVAC."`,
  ],
  // Chris Landreth — leader button + bio + image alt
  [
    `data-name="Chris Landreth"\n                  data-title="Senior VP of M&amp;A, Integration"`,
    `data-name="Chris Landreth"\n                  data-title="Group President"`,
  ],
  [
    `data-bio="Chris Landreth joined FirstCall Mechanical in 2022 and serves as Senior VP of M&amp;A, Integration, overseeing operations for Ohio, New York, Virginia, and the Carolinas.`,
    `data-bio="Chris Landreth joined FirstCall Mechanical in 2022 and serves as Group President, overseeing operations for Ohio, New York, Virginia, and the Carolinas.`,
  ],
  [
    `alt="Chris Landreth, Senior VP of M&amp;A, Integration"`,
    `alt="Chris Landreth, Group President"`,
  ],
  [
    `<div class="leader__name">Chris Landreth</div>\n              <div class="leader__title">Senior VP of M&amp;A, Integration</div>`,
    `<div class="leader__name">Chris Landreth</div>\n              <div class="leader__title">Group President</div>`,
  ],

  // ---- llms.txt ----
  [
    `- **Matthew Hunt, PE** — Chief Commercial Officer. Founder of C2H Air and Electric; 20+ years commercial HVAC experience.`,
    `- **Matthew Hunt, PE** — Group President. Founder of C2H Air and Electric; 20+ years commercial HVAC experience.`,
  ],
  [
    `- **Chris Landreth** — Senior VP of M&A, Integration. Co-founder of STR Mechanical, FirstCall's first partner branch (2022).`,
    `- **Chris Landreth** — Group President. Co-founder of STR Mechanical, FirstCall's first partner branch (2022).`,
  ],
];

const FILES = [
  "team.html",
  "llms.txt",
].map(f => path.join(ROOT, f));

let totalChanges = 0;
for (const file of FILES) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  let changes = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (html.includes(from)) {
      html = html.replace(from, to);
      changes++;
    }
  }
  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    console.log(`  ${path.relative(ROOT, file).padEnd(20)} ${changes} replacements`);
    totalChanges += changes;
  } else {
    console.log(`  ${path.relative(ROOT, file).padEnd(20)} no changes (already updated?)`);
  }
}
console.log(`\nDone. ${totalChanges} replacements.`);
