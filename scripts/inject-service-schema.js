#!/usr/bin/env node
/*
 * Idempotently inject Service JSON-LD into each branch service sub-page.
 * Marker-comment wrapped for clean re-runs.
 *
 *   node scripts/inject-service-schema.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// Branch metadata
const BRANCHES = {
  columbus: {
    legalName: "FirstCall Mechanical — Columbus",
    canonicalRoot: "https://firstcallmechanical.com/columbus",
    areaServed: { "@type": "City", name: "Columbus, Ohio" },
    addressLocality: "Columbus",
    addressRegion: "OH",
  },
  dfw: {
    legalName: "FirstCall Mechanical — DFW",
    canonicalRoot: "https://firstcallmechanical.com/dfw",
    areaServed: { "@type": "City", name: "Dallas-Fort Worth, Texas" },
    addressLocality: "Carrollton",
    addressRegion: "TX",
  },
  "central-texas": {
    legalName: "FirstCall Mechanical — Austin",
    canonicalRoot: "https://firstcallmechanical.com/central-texas",
    areaServed: { "@type": "City", name: "Austin, Texas" },
    addressLocality: "Austin",
    addressRegion: "TX",
  },
};

// Service metadata
const SERVICES = {
  "hvac-modernization": {
    name: "HVAC Change Outs and Modernization",
    description:
      "Commercial HVAC equipment replacement and system modernization — chillers, rooftop units, boilers, air handlers, and controls upgrades. Design-build mechanical retrofits for commercial buildings.",
    serviceType: "HVAC Modernization",
  },
  "planned-maintenance": {
    name: "Planned Maintenance",
    description:
      "Contract-based planned maintenance programs for commercial mechanical systems — scheduled service visits, equipment inspections, and proactive repair recommendations for HVAC, controls, and plumbing.",
    serviceType: "Planned Maintenance",
  },
  "project-work": {
    name: "Project Work and Design-Build",
    description:
      "Design-build retrofit and renovation project work for commercial buildings — mechanical system upgrades, expansions, tenant fit-outs, and capital project execution.",
    serviceType: "Mechanical Project Work",
  },
};

const START = "<!-- fc:service-schema:start -->";
const END = "<!-- fc:service-schema:end -->";

function block(branchKey, serviceKey) {
  const b = BRANCHES[branchKey];
  const s = SERVICES[serviceKey];
  const url = b.canonicalRoot + "/" + serviceKey;
  const obj = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    serviceType: s.serviceType,
    category: "Commercial Mechanical Service",
    url: url,
    provider: {
      "@type": "LocalBusiness",
      name: b.legalName,
      url: b.canonicalRoot,
      parentOrganization: {
        "@type": "Organization",
        name: "FirstCall Group",
        url: "https://firstcallgroup.com",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: b.addressLocality,
        addressRegion: b.addressRegion,
        addressCountry: "US",
      },
    },
    areaServed: b.areaServed,
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        "Commercial property owners, facility managers, general contractors, and building operators",
    },
  };
  const pretty = JSON.stringify(obj, null, 2);
  return (
    "  " + START + "\n" +
    "  <script type=\"application/ld+json\">\n" +
    pretty.split("\n").map((ln) => "  " + ln).join("\n") +
    "\n  </script>\n" +
    "  " + END
  );
}

let added = 0, replaced = 0;
for (const branchKey of Object.keys(BRANCHES)) {
  for (const serviceKey of Object.keys(SERVICES)) {
    const file = path.join(ROOT, branchKey, serviceKey + ".html");
    if (!fs.existsSync(file)) { console.warn("  missing: " + path.relative(ROOT, file)); continue; }
    let html = fs.readFileSync(file, "utf8");
    const newBlock = block(branchKey, serviceKey);
    if (html.includes(START)) {
      const re = new RegExp("\\s*" + START.replace(/[/*]/g, "\\$&") + "[\\s\\S]*?" + END.replace(/[/*]/g, "\\$&"), "");
      html = html.replace(re, "\n" + newBlock);
      replaced++;
    } else {
      html = html.replace("</head>", newBlock + "\n</head>");
      added++;
    }
    fs.writeFileSync(file, html);
  }
}

console.log("Service schema:", added, "added,", replaced, "replaced");
