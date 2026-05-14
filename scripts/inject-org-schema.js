#!/usr/bin/env node
/*
 * Idempotently inject the FirstCall Group Organization JSON-LD into every
 * HTML page in the repo. Branch sub-pages get the same Organization block
 * (in addition to whatever LocalBusiness schema they already carry).
 *
 * Re-run any time the Organization facts change.
 *
 *   node scripts/inject-org-schema.js
 *
 * The block is wrapped in marker comments so re-runs replace cleanly.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// Pull the branch list so areaServed stays in sync automatically.
const dataFile = fs.readFileSync(path.join(ROOT, "assets/js/locations-data.js"), "utf8");
const branches = JSON.parse(dataFile.match(/window\.FC_LOCATIONS\s*=\s*(\[[\s\S]*\]);/)[1]);

const STATE_NAMES = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California",
  CO:"Colorado", CT:"Connecticut", DE:"Delaware", DC:"District of Columbia",
  FL:"Florida", GA:"Georgia", HI:"Hawaii", ID:"Idaho", IL:"Illinois",
  IN:"Indiana", IA:"Iowa", KS:"Kansas", KY:"Kentucky", LA:"Louisiana",
  ME:"Maine", MD:"Maryland", MA:"Massachusetts", MI:"Michigan", MN:"Minnesota",
  MS:"Mississippi", MO:"Missouri", MT:"Montana", NE:"Nebraska", NV:"Nevada",
  NH:"New Hampshire", NJ:"New Jersey", NM:"New Mexico", NY:"New York",
  NC:"North Carolina", ND:"North Dakota", OH:"Ohio", OK:"Oklahoma",
  OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina",
  SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont",
  VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming"
};

const uniqStates = [...new Set(branches.map((b) => b.state))].sort();
const areaServed = uniqStates.map((code) => ({
  "@type": "State",
  name: STATE_NAMES[code] || code,
}));

const org = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FirstCall Group",
  alternateName: ["FirstCall Mechanical", "FirstCall"],
  url: "https://firstcallgroup.com",
  logo: "https://firstcallgroup.com/shared/img/logos/firstcall-group-color.svg",
  foundingDate: "2022",
  founder: {
    "@type": "Person",
    name: "Evan Eachus",
    jobTitle: "Chief Executive Officer and Founder",
  },
  description:
    "FirstCall Group is a multi-region commercial and industrial mechanical service platform — HVAC, building controls, plumbing, and electrical — that partners with regional service companies across the United States.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3105 Bee Caves Rd, Suite 250",
    addressLocality: "Austin",
    addressRegion: "TX",
    postalCode: "78746",
    addressCountry: "US",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+1-844-713-0220",
      contactType: "customer service",
      email: "info@firstcallmechanical.com",
      areaServed: "US",
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      contactType: "acquisitions",
      email: "acquisitions@firstcallgroup.com",
      areaServed: "US",
    },
  ],
  sameAs: ["https://www.linkedin.com/company/firstcall-mechanical/"],
  knowsAbout: [
    "Commercial HVAC",
    "Industrial HVAC",
    "Building Controls",
    "Building Management Systems",
    "Building Automation Systems",
    "Commercial Plumbing",
    "Commercial Electrical",
    "Planned Maintenance",
    "Mechanical Retrofit",
    "Chiller Service",
    "Boiler Service",
    "Rooftop Unit Replacement",
    "Emergency HVAC Service",
    "Commercial Mechanical Service",
  ],
  numberOfEmployees: { "@type": "QuantitativeValue", value: "500+" },
  areaServed,
};

const START = "<!-- fc:org-schema:start -->";
const END = "<!-- fc:org-schema:end -->";

function block() {
  const pretty = JSON.stringify(org, null, 2);
  return (
    "  " + START + "\n" +
    "  <script type=\"application/ld+json\">\n" +
    pretty.split("\n").map((ln) => "  " + ln).join("\n") +
    "\n  </script>\n" +
    "  " + END
  );
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "reference") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && full.endsWith(".html") && !full.includes(path.sep + "shared" + path.sep + "templates" + path.sep)) {
      out.push(full);
    }
  }
  return out;
}

const targets = walk(ROOT).filter((p) => {
  // Skip the styleguide and partials
  if (p.includes(path.sep + "shared" + path.sep + "styleguide.html")) return false;
  if (p.includes(path.sep + "shared" + path.sep + "partials" + path.sep)) return false;
  return true;
});

let added = 0, replaced = 0, skipped = 0;
const newBlock = block();

for (const file of targets) {
  let html = fs.readFileSync(file, "utf8");
  if (!html.includes("</head>")) { skipped++; continue; }
  if (html.includes(START)) {
    // Replace existing block
    const re = new RegExp("\\s*" + START.replace(/[/*]/g, "\\$&") + "[\\s\\S]*?" + END.replace(/[/*]/g, "\\$&"), "");
    html = html.replace(re, "\n" + newBlock);
    replaced++;
  } else {
    html = html.replace("</head>", newBlock + "\n</head>");
    added++;
  }
  fs.writeFileSync(file, html);
}

console.log("Org schema:", added, "added,", replaced, "replaced,", skipped, "skipped");
